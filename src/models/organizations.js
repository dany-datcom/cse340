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

const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
  const query = `
    UPDATE organization
    SET name = $1, description = $2, contact_email = $3, logo_filename = $4
    WHERE organization_id = $5
    RETURNING organization_id;
  `;

  const query_params = [name, description, contactEmail, logoFilename, organizationId];
  const result = await db.query(query, query_params);

  if (result.rows.length === 0) {
    throw new Error('Organization not found');
  }

  if (process.env.ENABLE_SQL_LOGGING === 'true') {
    console.log('Updated organization with ID:', organizationId);
  }

  return result.rows[0].organization_id;
};

export { getAllOrganizations, getOrganizationDetails, updateOrganization };