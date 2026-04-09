import bcrypt from 'bcrypt';
import {
    createUser,
    authenticateUser,
    getAllUsers,
    getUserProjects
} from "../models/users.js";
import { body, validationResult } from 'express-validator';
import db from '../models/db.js';

/**
 * Validation rules for user registration
 */
const userRegistrationValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

/**
 * Renders registration form
 */
const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

/**
 * Handles user registration
 */
const processUserRegistrationForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(e => e.msg).join(', '));
        return res.redirect('/register');
    }

    try {
        const { name, email, password } = req.body;

        // Hash password securely
        const passwordHash = await bcrypt.hash(password, 10);

        await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');

    } catch (error) {
        console.error('Error registering user:', error);

        req.flash('error', 'An error occurred during registration.');
        res.redirect('/register');
    }
};

/**
 * Renders login form
 */
const showLoginForm = (req, res) => {
    res.render('login', {
        title: 'Login',
        authRequired: req.query.auth === 'required'
    });
};


/**
 * Handles login logic
 */
const processLoginForm = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authenticateUser(email, password);


        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        // Store only necessary user data in session
        req.session.user = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role_name: user.role_name
        };

        req.flash('success', 'Login successful!');


        if (process.env.NODE_ENV === 'development') {
            console.log('User logged in:', req.session.user);
        }

        req.session.save(() => {
            res.redirect('/dashboard');
        });

    } catch (error) {
        console.error('Error during login:', error);

        req.flash('error', 'An error occurred during login.');
        res.redirect('/login');
    }
};

/**
 * Handles logout
 */
const processLogout = (req, res) => {
    try {
        if (req.session) {
            // Destroy session completely (more secure than delete)
            req.session.destroy(() => {
                res.redirect('/login');
            });
        } else {
            res.redirect('/login');
        }

    } catch (error) {
        console.error('Error during logout:', error);

        res.redirect('/login');
    }
};

/**
 * Middleware: requires user to be logged in
 */
const requireLogin = (req, res, next) => {
    if (req.session?.user) {
        return next();
    }

    req.flash('error', 'You must be logged in to access this page.');
    return res.redirect('/login');
};
/**
    * Middleware factory: requires specific role (e.g., admin)
    */
const requireRole = (role) => {
    return (req, res, next) => {

        if (!req.session?.user) {
            req.flash('error', 'You must be logged in.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/dashboard');
        }

        next();
    };
};

/**
 * Displays user dashboard with their projects
 */
const showDashboard = async (req, res) => {
    try {
        const user = req.session.user;

        const projects = await getUserProjects(user.user_id);

        res.render('dashboard', {
            title: 'Dashboard',
            name: user.name,
            email: user.email,
            projects,
            user
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/**
 * Admin-only page: lists all users
 */
const usersPage = async (req, res) => {
    try {
        const users = await getAllUsers();

        res.render('users', {
            title: 'All Users',
            users
        });

    } catch (error) {
        console.error('Error loading users:', error);

        req.flash('error', 'Error loading users.');
        res.redirect('/');
    }
};

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    userRegistrationValidation,
    processLoginForm,
    showLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    usersPage
};