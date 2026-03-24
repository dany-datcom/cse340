import db from './db.js';

const getAllCategories = async () => {
    const result = await db.query(`
        SELECT category_id, name
        FROM categories
        ORDER BY name
    `);
    return result.rows;
};

const getCategoryById = async (id) => {
    const result = await db.query(
        `SELECT * FROM categories WHERE category_id = $1`,
        [id]
    );
    return result.rows[0];
};

const getProjectsByCategoryId = async (categoryId) => {
    const result = await db.query(
        `SELECT p.*
         FROM service_project p
         JOIN project_categories pc 
         ON p.project_id = pc.project_id
         WHERE pc.category_id = $1`,
        [categoryId]
    );
    return result.rows;
};

const getCategoriesByProjectId = async (projectId) => {
    const result = await db.query(
        `SELECT c.*
         FROM categories c
         JOIN project_categories pc 
         ON c.category_id = pc.category_id
         WHERE pc.project_id = $1`,
        [projectId]
    );
    return result.rows;
};

const assignCategoryToProject = async(categoryId, projectId) => {
    const query = `
        INSERT INTO project_categories (category_id, project_id)
        VALUES ($1, $2);
    `;

    await db.query(query, [categoryId, projectId]);
}

const updateCategoryAssignments = async(projectId, categoryIds) => {
    // First, remove existing category assignments for the project
    const deleteQuery = `
        DELETE FROM project_categories
        WHERE project_id = $1;
    `;
    await db.query(deleteQuery, [projectId]);

    // Next, add the new category assignments
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(categoryId, projectId);
    }
}

export {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    assignCategoryToProject
};