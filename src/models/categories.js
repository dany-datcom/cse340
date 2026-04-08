import db from './db.js';

/**
 * Retrieves all categories ordered by name
 */
const getAllCategories = async () => {
    try {
        const result = await db.query(`
            SELECT category_id, name
            FROM categories
            ORDER BY name
        `);

        return result.rows;

    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Retrieves a category by ID
 */
const getCategoryById = async (id) => {
    try {
        const result = await db.query(
            `SELECT * FROM categories WHERE category_id = $1`,
            [id]
        );

        return result.rows[0];

    } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
    }
};

/**
 * Retrieves all projects for a given category
 */
const getProjectsByCategoryId = async (categoryId) => {
    try {
        const result = await db.query(
            `SELECT p.*
             FROM service_project p
             JOIN project_categories pc 
             ON p.project_id = pc.project_id
             WHERE pc.category_id = $1`,
            [categoryId]
        );

        return result.rows;

    } catch (error) {
        console.error('Error fetching projects by category:', error);
        throw error;
    }
};

/**
 * Retrieves all categories assigned to a project
 */
const getCategoriesByProjectId = async (projectId) => {
    try {
        const result = await db.query(
            `SELECT c.*
             FROM categories c
             JOIN project_categories pc 
             ON c.category_id = pc.category_id
             WHERE pc.project_id = $1`,
            [projectId]
        );

        return result.rows;

    } catch (error) {
        console.error('Error fetching categories by project:', error);
        throw error;
    }
};

/**
 * Assigns a category to a project
 */
const assignCategoryToProject = async (categoryId, projectId) => {
    try {
        await db.query(
            `INSERT INTO project_categories (category_id, project_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`, // Prevent duplicates
            [categoryId, projectId]
        );

    } catch (error) {
        console.error('Error assigning category to project:', error);
        throw error;
    }
};

/**
 * Updates category assignments for a project (transactional)
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // Remove existing assignments
        await client.query(
            `DELETE FROM project_categories WHERE project_id = $1`,
            [projectId]
        );

        // Bulk insert (much better than loop)
        if (categoryIds.length > 0) {
            const values = categoryIds
                .map((_, index) => `($1, $${index + 2})`)
                .join(',');

            const query = `
                INSERT INTO project_categories (project_id, category_id)
                VALUES ${values}
                ON CONFLICT DO NOTHING
            `;

            await client.query(query, [projectId, ...categoryIds]);
        }

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Error updating category assignments:', error);
        throw error;

    } finally {
        client.release();
    }
};

/**
 * Creates a new category
 */
const createCategory = async (name) => {
    try {
        const result = await db.query(
            `INSERT INTO categories (name)
             VALUES ($1)
             RETURNING category_id`,
            [name]
        );

        if (result.rows.length === 0) {
            throw new Error('Failed to create category');
        }

        return result.rows[0].category_id;

    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

/**
 * Updates an existing category
 */
const updateCategory = async (id, name) => {
    try {
        const result = await db.query(
            `UPDATE categories
             SET name = $1
             WHERE category_id = $2
             RETURNING category_id`,
            [name, id]
        );

        if (result.rows.length === 0) {
            throw new Error('Category not found');
        }

        return result.rows[0].category_id;

    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    assignCategoryToProject,
    createCategory,
    updateCategory
};