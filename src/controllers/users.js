import bcrypt from 'bcrypt';
import {
    createUser,
    authenticateUser,
    getAllUsers
} from "../models/users.js";
import { body, validationResult } from 'express-validator';

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
 * Render registration form
 */
const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

/**
 * Handle registration form submission
 */
const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(e => e.msg).join(', '));
        return res.redirect('/register');
    }

    try {
        // Hash password before storing
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user in database
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
 * Render login form
 */
const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

/**
 * Handle login logic
 */
const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);

        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }

        // Store user in session
        req.session.user = user;

        req.flash('success', 'Login successful!');

        if (process.env.NODE_ENV === 'development') {
            console.log('User logged in:', user);
        }

        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login.');
        res.redirect('/login');
    }
};

/**
 * Handle logout
 */
const processLogout = (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

/**
 * Middleware: requires user to be logged in
 */
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access this page.');
        return res.redirect('/login');
    }
    next();
};

/**
 * Middleware factory: requires specific role (e.g., admin)
 */
const requireRole = (role) => {
    return (req, res, next) => {

        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        next();
    };
};

/**
 * Render dashboard (requires login)
 */
const showDashboard = (req, res) => {
    const user = req.session.user;

    res.render('dashboard', {
        title: 'Dashboard',
        name: user.name,
        email: user.email
    });
};

/**
 * Admin-only page: list all users
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