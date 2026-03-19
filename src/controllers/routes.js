import express from 'express';
import { showOrganizationDetailsPage } from './organizations.js';
import { showHomePage } from './index.js';
import { showOrganizationsPage } from './organizations.js';
import { showProjectsPage, showProjectDetailsPage} from './service_projects.js';
import { showCategoriesPage } from './categories.js';
import { testErrorPage } from './errors.js';
const router = express.Router();
import { buildCategoryPage } from './categories.js';

// Home route
router.get('/', showHomePage);
// Organizations route
router.get('/organization', showOrganizationsPage);
// Projects route
router.get('/projects', showProjectsPage);
// Project details route
router.get('/project/:id', showProjectDetailsPage);
// Categories route
router.get('/categories', showCategoriesPage);
// Test error route
router.get('/test-error', testErrorPage);

router.get('/organization/:id', showOrganizationDetailsPage);

router.get('/category/:id', buildCategoryPage);


export default router;