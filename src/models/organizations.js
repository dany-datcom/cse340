import db from './db.js';

const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM Public.organization;
    `;
    const result = await db.query(query);
    return result.rows;
}


const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT 
        organization_id, 
        name, 
        description, 
        contact_email, 
        logo_filename
        FROM organization
        WHERE organization_id = $1;
    `;
    const query_params = [organizationId];
    const result = await db.query(query, query_params);

    return result.rows.length > 0 ? result.rows[0] : null;
}

    export { getAllOrganizations, getOrganizationDetails };