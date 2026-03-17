import db from './db.js';

const getAllServiceProjects = async () => {
    const query = `
        SELECT 
            sp.project_id, 
            sp.title, 
            sp.description,
            sp.location,
            sp.date,
            o.name AS organization_name
        FROM Public.service_project sp
        JOIN Public.organization o 
        ON sp.organization_id = o.organization_id 
        ORDER BY sp.date;
    `;
    const result = await db.query(query);
    return result.rows;
}

const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          date
        FROM service_project 
        WHERE organization_id = $1
        ORDER BY date;
      `;
      
      const query_params = [organizationId];
      const result = await db.query(query, query_params);

      return result.rows;
};
export { getAllServiceProjects, getProjectsByOrganizationId };