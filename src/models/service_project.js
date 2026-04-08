import db from './db.js';

/**
 * Retrieves all service projects
 */
const getAllServiceProjects = async () => {
    try {
        const result = await db.query(`
            SELECT 
                sp.project_id, 
                sp.title, 
                sp.description,
                sp.location,
                sp.date,
                o.name AS organization_name
            FROM service_project sp
            JOIN organization o 
                ON sp.organization_id = o.organization_id
            ORDER BY sp.date
        `);

        return result.rows;

    } catch (error) {
        console.error('Error fetching all projects:', error);
        throw error;
    }
};

/**
 * Retrieves projects by organization ID
 */
const getProjectsByOrganizationId = async (organizationId) => {
    try {
        const result = await db.query(
            `SELECT project_id, organization_id, title, description, location, date
             FROM service_project
             WHERE organization_id = $1
             ORDER BY date`,
            [organizationId]
        );

        return result.rows;

    } catch (error) {
        console.error('Error fetching projects by organization:', error);
        throw error;
    }
};

/**
 * Retrieves upcoming projects
 */
const getUpcomingProjects = async (limit) => {
    try {
        const result = await db.query(
            `SELECT
                p.project_id,
                p.title,
                p.description,
                p.date,
                p.location,
                p.organization_id,
                o.name AS organization_name
             FROM service_project p
             JOIN organization o
                ON p.organization_id = o.organization_id
             WHERE p.date >= CURRENT_DATE
             ORDER BY p.date ASC
             LIMIT $1`,
            [limit]
        );

        return result.rows;

    } catch (error) {
        console.error('Error fetching upcoming projects:', error);
        throw error;
    }
};

/**
 * Retrieves project details by ID
 */
const getProjectDetails = async (id) => {
    try {
        const result = await db.query(
            `SELECT 
                p.project_id,
                p.title,
                p.description,
                p.date,
                p.location,
                p.organization_id,
                o.name AS organization_name
             FROM service_project p
             JOIN organization o 
                ON p.organization_id = o.organization_id
             WHERE p.project_id = $1`,
            [id]
        );

        return result.rows[0] || null;

    } catch (error) {
        console.error('Error fetching project details:', error);
        throw error;
    }
};

/**
 * Creates a new project
 */
const createProject = async (title, description, location, date, organizationId) => {
    try {
        const result = await db.query(
            `INSERT INTO service_project (title, description, location, date, organization_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING project_id`,
            [title, description, location, date, organizationId]
        );

        if (result.rows.length === 0) {
            throw new Error('Failed to create project');
        }

        const projectId = result.rows[0].project_id;

        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Created new project with ID:', projectId);
        }

        return projectId;

    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

/**
 * Updates an existing project
 */
const updateProject = async (projectId, title, description, location, date, organizationId) => {
    try {
        const result = await db.query(
            `UPDATE service_project
             SET title = $1,
                 description = $2,
                 location = $3,
                 date = $4,
                 organization_id = $5
             WHERE project_id = $6
             RETURNING project_id`,
            [title, description, location, date, organizationId, projectId]
        );

        if (result.rows.length === 0) {
            throw new Error('Project not found');
        }

        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Updated project with ID:', projectId);
        }

        return result.rows[0].project_id;

    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
};

/**
 * Adds a volunteer to a project
 */
const addVolunteer = async (userId, projectId) => {
    try {
        const result = await db.query(
            `INSERT INTO project_volunteers (user_id, project_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING
             RETURNING *`,
            [userId, projectId]
        );

        return result.rows[0] || null;

    } catch (error) {
        console.error('Error adding volunteer:', error);
        throw error;
    }
};

/**
 * Removes a volunteer from a project
 */
const removeVolunteer = async (userId, projectId) => {
    try {
        await db.query(
            `DELETE FROM project_volunteers
             WHERE user_id = $1 AND project_id = $2`,
            [userId, projectId]
        );

    } catch (error) {
        console.error('Error removing volunteer:', error);
        throw error;
    }
};

const isUserVolunteer = async (userId, projectId) => {
    const query = `
        SELECT 1
        FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2
        LIMIT 1;
    `;

    const result = await db.query(query, [userId, projectId]);

    return result.rows.length > 0;
};

export {
    getAllServiceProjects,
    getProjectsByOrganizationId,
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject,
    addVolunteer,
    removeVolunteer,
    isUserVolunteer
};