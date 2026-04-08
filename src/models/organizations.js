import db from './db.js';

/**
 * Retrieves all organizations
 */
const getAllOrganizations = async () => {
    try {
        const result = await db.query(`
            SELECT organization_id, name, description, contact_email, logo_filename
            FROM organization
            ORDER BY name
        `);

        return result.rows;

    } catch (error) {
        console.error('Error fetching organizations:', error);
        throw error;
    }
};

/**
 * Retrieves details of a specific organization
 */
const getOrganizationDetails = async (organizationId) => {
    try {
        const result = await db.query(
            `SELECT organization_id, name, description, contact_email, logo_filename
             FROM organization
             WHERE organization_id = $1`,
            [organizationId]
        );

        return result.rows[0] || null;

    } catch (error) {
        console.error('Error fetching organization details:', error);
        throw error;
    }
};

/**
 * Updates an existing organization
 */
const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
    try {
        const result = await db.query(
            `UPDATE organization
             SET name = $1,
                 description = $2,
                 contact_email = $3,
                 logo_filename = $4
             WHERE organization_id = $5
             RETURNING organization_id`,
            [name, description, contactEmail, logoFilename, organizationId]
        );

        if (result.rows.length === 0) {
            throw new Error('Organization not found');
        }

        const updatedId = result.rows[0].organization_id;

        // Log only in development mode
        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Updated organization with ID:', updatedId);
        }

        return updatedId;

    } catch (error) {
        console.error('Error updating organization:', error);
        throw error;
    }
};

export { getAllOrganizations, getOrganizationDetails, updateOrganization };