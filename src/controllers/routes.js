import express from 'express';

import {
    showUserRegistrationForm,
    processUserRegistrationForm,
    userRegistrationValidation,
    processLoginForm,
    showLoginForm,
    processLogout,
    showDashboard,
    requireLogin,
    requireRole,
    usersPage
} from './users.js';

import { showHomePage } from './index.js';

import {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    projectValidation,
    showEditProjectForm,
    processEditProjectForm
} from './service_projects.js';

import { testErrorPage } from './errors.js';

import {
    showCategoriesPage,
    buildCategoryPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showEditCategoryForm,
    showNewCategoryForm,
    processEditCategoryForm,
    processNewCategoryForm,
    categoryValidation
} from './categories.js';

import {
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showOrganizationsPage,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
} from './organizations.js';

const router = express.Router();

/**
 * =========================
 * PUBLIC ROUTES
 * =========================
 */

// Authentication
router.get('/register', showUserRegistrationForm);
router.post('/register', userRegistrationValidation, processUserRegistrationForm);

router.get('/login', showLoginForm);
router.post('/login', processLoginForm);

router.get('/logout', processLogout);

// Public pages
router.get('/project/:id', showProjectDetailsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/category/:id', buildCategoryPage);

// Test route
router.get('/test-error', testErrorPage);


/**
 * =========================
 * AUTHENTICATED ROUTES
 * =========================
 */

// Dashboard (requires login)
router.get('/dashboard', requireLogin, showDashboard);

// Home
router.get('/', requireLogin, showHomePage);

// Organizations
router.get('/organizations', requireLogin, showOrganizationsPage);

// Projects
router.get('/projects', requireLogin, showProjectsPage);

// Categories
router.get('/categories', requireLogin, showCategoriesPage);


/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// Users page (admin only)
router.get('/users', requireRole('admin'), usersPage);

/**
 * ---- ORGANIZATIONS ----
 */
router.get('/new-organization', requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireRole('admin'), organizationValidation, processNewOrganizationForm);

router.get('/edit-organization/:id', requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireRole('admin'), organizationValidation, processEditOrganizationForm);

/**
 * ---- PROJECTS ----
 */
router.get('/new-project', requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireRole('admin'), projectValidation, processNewProjectForm);

router.get('/edit-project/:id', requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireRole('admin'), projectValidation, processEditProjectForm);

/**
 * ---- CATEGORIES ----
 */
router.get('/new-category', requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireRole('admin'), categoryValidation, processNewCategoryForm);

router.get('/edit-category/:id', requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireRole('admin'), categoryValidation, processEditCategoryForm);

/**
 * ---- ASSIGN CATEGORIES ----
 */
router.get('/assign-categories/:projectId', requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireRole('admin'), processAssignCategoriesForm);

export default router;