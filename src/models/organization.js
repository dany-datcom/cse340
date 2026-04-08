/**
 * Creates a new organization in the database
 * 
 * @param {string} name - Organization name
 * @param {string} description - Organization description
 * @param {string} contactEmail - Contact email
 * @param {string} logoFilename - Logo filename
 * @returns {number} Newly created organization ID
 */
import db from './db.js';

const createOrganization = async (name, description, contactEmail, logoFilename) => {
    try {
        const result = await db.query(
            `INSERT INTO organization (name, description, contact_email, logo_filename)
             VALUES ($1, $2, $3, $4)
             RETURNING organization_id`,
            [name, description, contactEmail, logoFilename]
        );

        if (result.rows.length === 0) {
            throw new Error('Failed to create organization');
        }

        const organizationId = result.rows[0].organization_id;

        // Log only in development mode
        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Created new organization with ID:', organizationId);
        }

        return organizationId;

    } catch (error) {
        console.error('Error creating organization:', error);
        throw error;
    }
};

export { createOrganization };