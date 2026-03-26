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



const showProjectsPage = async (req, res) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);

        res.render("projects", {
            title: "Upcoming Service Projects",
            projects: projects
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading projects");
    }
}

const showProjectDetailsPage = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await getProjectDetails(id);

        if (!project) {
            return res.status(404).send("Project not found");
        }

        const categories = await getCategoriesByProjectId(id);

        res.render("project", { // ojo: project.ejs
            title: project.title,
            project: project,
            categories: categories
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading project details");
    }
}

const showNewProjectForm = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Add New Service Project';

    res.render('new-project', { title, organizations });
}

const processNewProjectForm = async (req, res) => {
    // Extract form data from req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new project form
        return res.redirect('/new-project');
    }

    const { title, description, location, date, organizationId } = req.body;

    try {
        // Create the new project in the database
        const newProjectId = await createProject(title, description, location, date, organizationId);

        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
}

const showEditProjectForm = async (req, res) => {
    try {
        const projectId = req.params.id;

        const project = await getProjectDetails(projectId);

        // 🔥 arreglo de fecha
        if (project && project.date) {
            project.date = new Date(project.date).toISOString().split("T")[0];
        } else {
            project.date = "";
        }

        // 🔥 ESTO ES LO QUE TE ESTÁ FALLANDO
        const organizations = await getAllOrganizations();

        console.log("organizations:", organizations); // 👈 DEBUG

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


const processEditProjectForm = async (req, res) => {
    try {
        const projectId = req.params.id;

        const { title, description, location, date, organization_id } = req.body;

        await updateProject(projectId, title, description, location, date, organization_id);
        req.flash('success', 'Project updated successfully!');
        res.redirect(`/project/${projectId}`);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating project");
    }
};


export { showProjectsPage, showProjectDetailsPage, showNewProjectForm, projectValidation, processNewProjectForm, showEditProjectForm, processEditProjectForm };