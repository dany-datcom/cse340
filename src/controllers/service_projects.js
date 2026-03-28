import {
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject,
    getAllServiceProjects
} from '../models/service_project.js';

import { getAllOrganizations } from '../models/organizations.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

/* ============================= */
/*        VALIDATION             */
/* ============================= */

const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),

    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),

    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),

    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

/* ============================= */
/*        VIEWS                  */
/* ============================= */

const showProjectsPage = async (req, res) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);

        res.render("projects", {
            title: "Upcoming Service Projects",
            projects
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading projects");
    }
};

const showProjectDetailsPage = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).send("Project not found");
        }

        const categories = await getCategoriesByProjectId(id);

        res.render("project", {
            title: project.title,
            project,
            categories
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading project details");
    }
};

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();

    res.render('new-project', {
        title: 'Add New Service Project',
        organizations
    });
};

/* ============================= */
/*        CREATE                */
/* ============================= */

const processNewProjectForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;

    try {
        if (!organizationId) {
            throw new Error("organizationId missing");
        }

        const newProjectId = await createProject(
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);

    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
};

/* ============================= */
/*        EDIT FORM              */
/* ============================= */

const showEditProjectForm = async (req, res) => {
    try {
        const projectId = req.params.id;

        const project = await getProjectDetails(projectId);
        const organizations = await getAllOrganizations();

        // Fix fecha
        if (project && project.date) {
            project.date = new Date(project.date).toISOString().split("T")[0];
        } else {
            project.date = "";
        }

        res.render("edit-project", {
            title: "Edit Project",
            project,
            organizations
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading edit form");
    }
};

/* ============================= */
/*        UPDATE                */
/* ============================= */

const processEditProjectForm = async (req, res) => {
    try {
        const projectId = req.params.id;

        console.log("BODY:", req.body); // 🔥 DEBUG

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const organizations = await getAllOrganizations();

            errors.array().forEach((error) => {
                req.flash('error', error.msg);
            });

            return res.render("edit-project", {
                title: "Edit Project",
                project: {
                    ...req.body,
                    project_id: projectId,
                    organization_id: req.body.organizationId
                },
                organizations
            });
        }

        const { title, description, location, date, organizationId } = req.body;

        if (!organizationId) {
            throw new Error("organizationId is required (comes null from form)");
        }

        await updateProject(
            projectId,
            title,
            description,
            location,
            date,
            organizationId
        );

        req.flash('success', 'Project updated successfully!');
        res.redirect(`/project/${projectId}`);

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        res.status(500).send("Error updating project");
    }
};

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    projectValidation,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm
};