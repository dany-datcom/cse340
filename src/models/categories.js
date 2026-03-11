import db from './db.js';

export async function getAllCategories() {
    const result = await db.query(`
        SELECT category_id, name
        FROM categories
        ORDER BY name
    `);
    return result.rows;
}