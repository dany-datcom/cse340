import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Creates a new user with default role "user"
 */
const createUser = async (name, email, passwordHash) => {
    try {

        email = email.trim().toLowerCase(); 

        const result = await db.query(
            `INSERT INTO users (name, email, password_hash, role_id)
             VALUES ($1, $2, $3,
                (SELECT role_id FROM roles WHERE role_name = $4)
             )
             RETURNING user_id`,
            [name, email, passwordHash, 'user']
        );

        if (result.rows.length === 0) {
            throw new Error('Failed to create user');
        }

        const userId = result.rows[0].user_id;

        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log('Created new user with ID:', userId);
        }

        return userId;

    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Finds a user by email (includes role)
 */
const findUserByEmail = async (email) => {
    try {
        const result = await db.query(
            `SELECT 
                u.user_id,
                u.name,
                u.email,
                u.password_hash,
                r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE LOWER(u.email) = LOWER($1)`,
            [email]
        );

        return result.rows[0] || null;

    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error;
    }
};

/**
 * Verifies password using bcrypt
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates user credentials
 */
const authenticateUser = async (email, password) => {
    try {

        email = email.trim().toLowerCase();

        const user = await findUserByEmail(email);

        if (!user) return null;

        const isMatch = await verifyPassword(password, user.password_hash);

        if (!isMatch) return null;

        // Remove sensitive data
        delete user.password_hash;

        return user;

    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
};

/**
 * Retrieves all users with roles (admin view)
 */
const getAllUsers = async () => {
    try {
        const result = await db.query(`
            SELECT 
                u.user_id,
                u.name,
                u.email,
                r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            ORDER BY u.user_id
        `);

        return result.rows;

    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

/**
 * Retrieves projects associated with a user
 */
const getUserProjects = async (userId) => {
    try {
        const result = await db.query(
            `SELECT sp.*
             FROM project_volunteers pv
             JOIN service_project sp 
                ON pv.project_id = sp.project_id
             WHERE pv.user_id = $1`,
            [userId]
        );

        return result.rows;

    } catch (error) {
        console.error('Error fetching user projects:', error);
        throw error;
    }
};

export {
    createUser,
    findUserByEmail,
    verifyPassword,
    authenticateUser,
    getUserProjects,
    getAllUsers
};