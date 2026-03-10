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
export { getAllServiceProjects }