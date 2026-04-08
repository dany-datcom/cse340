import {
    getAllOrganizations,
    getOrganizationDetails,
    updateOrganization
} from '../models/organizations.js';

import { getProjectsByOrganizationId } from '../models/service_project.js';
import { createOrganization } from '../models/organization.js';
import { body, validationResult } from 'express-validator';
import { title } from 'process';

/**
 * Validation rules for organization forms
 */
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 }).withMessage('Organization name must be between 3 and 150 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Organization description is required')
        .isLength({ max: 500 }).withMessage('Organization description cannot exceed 500 characters'),

    body('contactEmail')
        .normalizeEmail()
        .notEmpty().withMessage('Contact email is required')
        .isEmail().withMessage('Please provide a valid email address')
];

/**
 * Displays all organizations
 */
const showOrganizationsPage = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();

        res.render('organizations', {
            title: 'Organizations',
            organizations,
            isAdmin: req.session.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error fetching organizations:', error);

        res.status(500).render('errors/500', {
            title: 'Server Error'
        });
    }
};

/**
 * Displays organization details and associated projects
 */
const showOrganizationDetailsPage = async (req, res) => {
    const { id: organizationId } = req.params;

    try {
        const organizationDetails = await getOrganizationDetails(organizationId);

        // Validate if organization exists
        if (!organizationDetails) {
            return res.status(404).render('errors/404', {
                title: 'Organization Not Found'
            });
        }

        const projects = await getProjectsByOrganizationId(organizationId);

        res.render('organization', {
            title: 'Organization Details',
            organizationDetails,
            projects,
            isAdmin: req.session.user?.role_name === 'admin'
        });
    } catch (error) {
        console.error('Error loading organization details:', error);

        res.status(500).render('errors/500', {
            title: 'Server Error'
        });
    }
};

/**
 * Displays form to create a new organization
 */
const showNewOrganizationForm = (req, res) => {
    res.render('new-organization', {
        title: 'Add New Organization',
        isAdmin: req.session.user?.role_name === 'admin'
    });
};

/**
 * Handles creation of a new organization
 */
const processNewOrganizationForm = async (req, res) => {
    const results = validationResult(req);

    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect('/new-organization');
    }

    try {
        const { name, description, contactEmail } = req.body;

        // Placeholder logo (can be replaced with file upload logic)
        const logoFilename = 'placeholder-logo.png';

        const organizationId = await createOrganization(
            name,
            description,
            contactEmail,
            logoFilename
        );

        req.flash('success', 'Organization created successfully!');
        res.redirect(`/organization/${organizationId}`);

    } catch (error) {
        console.error('Error creating organization:', error);

        req.flash('error', 'Failed to create organization.');
        res.redirect('/new-organization');
    }
};

/**
 * Displays form to edit an existing organization
 */
const showEditOrganizationForm = async (req, res) => {
    const { id: organizationId } = req.params;

    try {
        const organizationDetails = await getOrganizationDetails(organizationId);

        // Validate if organization exists
        if (!organizationDetails) {
            return res.status(404).render('errors/404', {
                title: 'Organization Not Found'
            });
        }

        res.render('edit-organization', {
            title: 'Edit Organization',
            organizationDetails,
            isAdmin: req.session.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error loading organization for edit:', error);

        res.status(500).render('errors/500', {
            title: 'Server Error'
        });
    }
};

/**
 * Handles updating an existing organization
 */
const processEditOrganizationForm = async (req, res) => {
    const results = validationResult(req);

    if (!results.isEmpty()) {
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect(`/edit-organization/${req.params.id}`);
    }

    const { id: organizationId } = req.params;

    try {
        const { name, description, contactEmail, logoFilename } = req.body;

        await updateOrganization(
            organizationId,
            name,
            description,
            contactEmail,
            logoFilename,
            
        );

        req.flash('success', 'Organization updated successfully!');
        res.redirect(`/organization/${organizationId}`);

    } catch (error) {
        console.error('Error updating organization:', error);

        req.flash('error', 'Failed to update organization.');
        res.redirect(`/edit-organization/${organizationId}`);
    }
};

export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    organizationValidation,
    showEditOrganizationForm,
    processEditOrganizationForm
};