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

// Home
router.get('/', showHomePage);

// Authentication
router.get('/register', showUserRegistrationForm);
router.post('/register', userRegistrationValidation, processUserRegistrationForm);

router.get('/login', showLoginForm);
router.post('/login', processLoginForm);

router.get('/logout', processLogout);

// Public content (lists)
router.get('/projects', showProjectsPage);
router.get('/organizations', showOrganizationsPage);
router.get('/categories', showCategoriesPage);

// Public content (details)
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

// Dashboard
router.get('/dashboard', requireLogin, showUserVolunteeredProjects);

// Volunteer actions
router.post('/project/:id/volunteer', requireLogin, volunteerProject);
router.post('/project/:id/unvolunteer', requireLogin, unvolunteerProject);

/**

* =========================
* ADMIN ROUTES
* =========================
  */

// Users
router.get('/users', requireLogin, requireRole('admin'), usersPage);

/**

* ---- ORGANIZATIONS ----
  */
  router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
  router.post('/new-organization', requireLogin, requireRole('admin'), organizationValidation, processNewOrganizationForm);

router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), organizationValidation, processEditOrganizationForm);

/**

* ---- PROJECTS ----
  */
  router.get('/new-project', requireLogin, requireRole('admin'), showNewProjectForm);
  router.post('/new-project', requireLogin, requireRole('admin'), projectValidation, processNewProjectForm);

router.get('/edit-project/:id', requireLogin, requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireLogin, requireRole('admin'), projectValidation, processEditProjectForm);

/**

* ---- CATEGORIES ----
  */
  router.get('/new-category', requireLogin, requireRole('admin'), showNewCategoryForm);
  router.post('/new-category', requireLogin, requireRole('admin'), categoryValidation, processNewCategoryForm);

router.get('/edit-category/:id', requireLogin, requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireLogin, requireRole('admin'), categoryValidation, processEditCategoryForm);

/**

* ---- ASSIGN CATEGORIES ----
  */
  router.get('/assign-categories/:projectId', requireLogin, requireRole('admin'), showAssignCategoriesForm);
  router.post('/assign-categories/:projectId', requireLogin, requireRole('admin'), processAssignCategoriesForm);

export default router;
