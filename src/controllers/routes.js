import express from 'express';

import { showHomePage } from './index.js';
import { showOrganizationsPage } from './organizations.js';
import { showProjectsPage } from './service_projects.js';
import { showCategoriesPage } from './categories.js';
import { testErrorPage } from './errors.js';
const router = express.Router();

// Home route
router.get('/', showHomePage);
// Organizations route
router.get('/organization', showOrganizationsPage);
// Projects route
router.get('/projects', showProjectsPage);
// Categories route
router.get('/categories', showCategoriesPage);
// Test error route
router.get('/test-error', testErrorPage);


export default router;