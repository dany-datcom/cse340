import db from './db.js';

export const getAllCategories = async () => {
    const result = await db.query(`
        SELECT category_id, name
        FROM categories
        ORDER BY name
    `);
    return result.rows;
};

export async function getCategoryById(id) {
  const result = await db.query(
    "SELECT * FROM categories WHERE category_id = $1",
    [id]
  );
  return result.rows[0];
}

export async function getProjectsByCategoryId(categoryId) {
  const result = await db.query(
    `SELECT p.*
     FROM service_project p
     JOIN project_categories pc 
     ON p.project_id = pc.project_id
     WHERE pc.category_id = $1`,
    [categoryId]
  );
  return result.rows;
}

export async function getCategoriesByProjectId(projectId) {
  const result = await db.query(
    `SELECT c.*
     FROM categories c
     JOIN project_categories pc 
     ON c.category_id = pc.category_id
     WHERE pc.project_id = $1`,
    [projectId]
  );
  return result.rows;
}