/**
 * Create a new organization in database
 * @param {String} name - The name of the organization
 * @param {String} description - A brief description of the organization
 * @param {String} contactEmail - The contact email for the organization
 * @param {string} logoFilename - The filename of the organization's logo image
 * @returns {string} Thwe ID of the newly created organization record 
 */
import db from './db.js';

const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id
    `;
    const query_params = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new organization with ID', result.rows[0].organization_id);
    }

    return result.rows[0].organization_id;
};

export { createOrganization };