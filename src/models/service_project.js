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

const getUpcomingProjects = async (number_of_projects) => {
  const query = `
        SELECT
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
        LIMIT $1;
    `;
  const values = [number_of_projects];
  const result = await db.query(query, values);
  return result.rows;
}

const getProjectDetails = async (id) => {
  const query = `
    SELECT 
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
    WHERE p.project_id = $1;
  `;

  const values = [id];
  const result = await db.query(query, values);

  return result.rows[0];
}



export { getAllServiceProjects, getProjectsByOrganizationId, getUpcomingProjects, getProjectDetails };