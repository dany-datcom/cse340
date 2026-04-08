import { Pool } from 'pg';

/**
 * Initialize PostgreSQL connection pool
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // 🔥 FIX
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * Database wrapper (adds logging in development mode)
 */
let db = null;

if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {

    db = {
        async query(text, params) {
            const start = Date.now();

            try {
                const res = await pool.query(text, params);
                const duration = Date.now() - start;

                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: res.rowCount
                });

                return res;

            } catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });

                throw error;
            }
        },

        async connect() {
            return pool.connect();
        },

        async close() {
            await pool.end();
        }
    };

} else {
    db = {
        query: (text, params) => pool.query(text, params),
        connect: () => pool.connect(),
        close: () => pool.end()
    };
}

/**
 * Tests database connection
 */
const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW() as current_time');

        console.log('Database connection successful. Current time:', result.rows[0].current_time);

        return true;

    } catch (error) {
        console.error('Database connection failed:', error);

        return false;
    }
};

export { db as default, testConnection };