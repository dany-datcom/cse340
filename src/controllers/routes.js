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
    processEditProjectForm,
    volunteerProject,
    unvolunteerProject,
    showUserVolunteeredProjects
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

// Public content
router.get('/project/:id', showProjectDetailsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/category/:id', buildCategoryPage);

// Test error
router.get('/test-error', testErrorPage);


/**
 * =========================
 * AUTHENTICATED ROUTES
 * =========================
 */

router.use(requireLogin);

// Dashboard
router.get('/dashboard', showUserVolunteeredProjects);

// Home
router.get('/', showHomePage);

// Organizations
router.get('/organizations', showOrganizationsPage);

// Projects
router.get('/projects', showProjectsPage);

// Categories
router.get('/categories', showCategoriesPage);

// Volunteer routes
router.post('/project/:id/volunteer', volunteerProject);
router.post('/project/:id/unvolunteer', unvolunteerProject);


/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

router.use(requireRole('admin'));

// Users
router.get('/users', usersPage);

/**
 * ---- ORGANIZATIONS ----
 */
router.get('/new-organization', showNewOrganizationForm);
router.post('/new-organization', organizationValidation, processNewOrganizationForm);

router.get('/edit-organization/:id', showEditOrganizationForm);
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);

/**
 * ---- PROJECTS ----
 */
router.get('/new-project', showNewProjectForm);
router.post('/new-project', projectValidation, processNewProjectForm);

router.get('/edit-project/:id', showEditProjectForm);
router.post('/edit-project/:id', projectValidation, processEditProjectForm);

/**
 * ---- CATEGORIES ----
 */
router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);

router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);

/**
 * ---- ASSIGN CATEGORIES ----
 */
router.get('/assign-categories/:projectId', showAssignCategoriesForm);
router.post('/assign-categories/:projectId', processAssignCategoriesForm);

export default router;