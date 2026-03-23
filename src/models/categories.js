import db from './db.js';

export const getAllCategories = async () => {
    const result = await db.query(`
        SELECT category_id, name
        FROM categories
        ORDER BY name
    `);
    return result.rows;
};

export const getCategoryById = async (id) => {
  const result = await db.query(
    "SELECT * FROM categories WHERE category_id = $1",
    [id]
  );
  return result.rows[0];
}

export const getProjectsByCategoryId = async (categoryId) => {
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

export const getCategoriesByProjectId = async (projectId) => {
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