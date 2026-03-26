import express from 'express';
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

// Home route
router.get('/', showHomePage);
// Organizations route
router.get('/organization', showOrganizationsPage);
//Route for new project page
router.get('/new-project', showNewProjectForm);
// Route to handle new project form submission
router.post('/new-project', projectValidation, processNewProjectForm);
// Projects route
router.get('/projects', showProjectsPage);
// Project details route
router.get('/project/:id', showProjectDetailsPage);
// Mostrar formulario de edición
router.get("/edit-project/:id", showEditProjectForm);
//Procesar formulario de edición
router.post("/edit-project/:id", processEditProjectForm);
// Categories route
router.get('/categories', showCategoriesPage);

router.get('/new-category', showNewCategoryForm);
router.post('/new-category', categoryValidation, processNewCategoryForm);

router.get('/edit-category/:id', showEditCategoryForm);
router.post('/edit-category/:id', categoryValidation, processEditCategoryForm);
// Routes to handle the assign categories to project form
router.get('/assign-categories/:projectId', showAssignCategoriesForm);

router.post('/assign-categories/:projectId', processAssignCategoriesForm);
// Test error route
router.get('/test-error', testErrorPage);
// Organization details route
router.get('/organization/:id', showOrganizationDetailsPage);
// edit organization
router.get('/edit-organization/:id', showEditOrganizationForm);
// Route to handle the edit organization form submission
router.post('/edit-organization/:id', organizationValidation, processEditOrganizationForm);
// Category details route
router.get('/category/:id', buildCategoryPage);
// New organization form route
router.get('/new-organization', showNewOrganizationForm);
// Process new organization form submission
router.post('/new-organization', organizationValidation, processNewOrganizationForm);





export default router;