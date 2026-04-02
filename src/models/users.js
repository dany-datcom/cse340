import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Creates a new user with a default role of "user"
 */
const createUser = async (name, email, passwordHash) => {
    const defaultRole = 'user';

    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, 
            (SELECT role_id FROM roles WHERE role_name = $4)
        )
        RETURNING user_id;
    `;

    const params = [name, email, passwordHash, defaultRole];

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    // Optional SQL logging (for development/debugging)
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Finds a user by email and includes their role name
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT 
            u.user_id,
            u.name,
            u.email,
            u.password_hash,
            r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1;
    `;

    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

/**
 * Verifies a plain password against a hashed password
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates a user by email and password
 * Removes password_hash before returning user object
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user) {
        return null;
    }

    const isMatch = await verifyPassword(password, user.password_hash);

    if (!isMatch) {
        return null;
    }

    // Remove sensitive data before returning
    delete user.password_hash;

    return user;
};

/**
 * Retrieves all users with their roles
 * Used for admin-only users page
 */
const getAllUsers = async () => {
    const query = `
        SELECT 
            u.user_id,
            u.name,
            u.email,
            r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.user_id;
    `;

    const result = await db.query(query);
    return result.rows;
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
    authenticateUser,
    getAllUsers
};