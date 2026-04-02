import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { testConnection } from './src/models/db.js';
import router from './src/controllers/routes.js';
import session from 'express-session';
import flash from './src/middleware/flash.js';

// Define the application environment
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

// Define the port number
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * SESSION CONFIGURATION
 */
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

/**
 * FLASH MESSAGES
 */
app.use(flash);

/**
 * BODY PARSING
 */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * STATIC FILES
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * VIEW ENGINE
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

/**
 * REQUEST LOGGER (solo en dev)
 */
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

/**
 * 🔥 MIDDLEWARE GLOBAL PARA VISTAS (AQUÍ ESTÁ LA MAGIA)
 */
app.use((req, res, next) => {
    // Estado de login
    res.locals.isLoggedIn = false;

    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    // 🔥 AGREGADO IMPORTANTE: hacer disponible el usuario en todas las vistas
    res.locals.user = req.session?.user || null;

    // Environment
    res.locals.NODE_ENV = NODE_ENV;

    next();
});

/**
 * ROUTES
 */
app.use(router);

/**
 * 404 HANDLER
 */
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

/**
 * GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);

    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    res.status(status).render(`errors/${template}`, context);
});

/**
 * START SERVER
 */
app.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
});