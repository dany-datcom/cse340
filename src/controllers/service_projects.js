import {
    getUpcomingProjects,
    getProjectDetails,
    createProject,
    updateProject,
    isUserVolunteer,
    addVolunteer,
    removeVolunteer,
} from '../models/service_project.js';
import { getUserProjects } from '../models/users.js';

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

        res.render('projects', {
            title: 'Projects',
            projects,
            isAdmin: req.session?.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error loading projects:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

const showProjectDetailsPage = async (req, res) => {
    const { id: projectId } = req.params;

    try {
        const project = await getProjectDetails(projectId);

        if (!project) {
            return res.status(404).render("errors/404", {
                title: "Project Not Found"
            });
        }

        const categories = await getCategoriesByProjectId(projectId);

        const user = req.session?.user || null;
        let isVolunteer = false;

        if (user) {
            isVolunteer = await isUserVolunteer(user.user_id, projectId);
        }

        res.render("project", {
            title: project.title,
            project,
            categories,
            user,
            isVolunteer,
            isAdmin: req.session?.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error loading project details:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/* ============================= */
/*        CREATE                */
/* ============================= */

const showNewProjectForm = async (req, res) => {
    try {
        const organizations = await getAllOrganizations();

        res.render('new-project', {
            title: 'Add New Service Project',
            organizations
        });

    } catch (error) {
        console.error('Error loading new project form:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

const processNewProjectForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach((error) => req.flash('error', error.msg));
        return res.redirect('/new-project');
    }

    try {
        const { title, description, location, date, organizationId } = req.body;

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
        console.error('Error creating project:', error);

        req.flash('error', 'Failed to create project.');
        res.redirect('/new-project');
    }
};

/* ============================= */
/*        EDIT / UPDATE         */
/* ============================= */

const showEditProjectForm = async (req, res) => {
    const { id: projectId } = req.params;

    try {
        const project = await getProjectDetails(projectId);
        const organizations = await getAllOrganizations();

        if (!project) {
            return res.status(404).render("errors/404", {
                title: "Project Not Found"
            });
        }

        project.date = project.date
            ? new Date(project.date).toISOString().split("T")[0]
            : "";

        res.render("edit-project", {
            title: "Edit Project",
            project,
            organizations
        });

    } catch (error) {
        console.error('Error loading edit form:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

const processEditProjectForm = async (req, res) => {
    const { id: projectId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const organizations = await getAllOrganizations();

        errors.array().forEach((error) => req.flash('error', error.msg));

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

    try {
        const { title, description, location, date, organizationId } = req.body;

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
        console.error('Error updating project:', error);

        req.flash('error', 'Failed to update project.');
        res.redirect(`/edit-project/${projectId}`);
    }
};

/* ============================= */
/*        VOLUNTEER             */
/* ============================= */

const volunteerProject = async (req, res) => {
    try {
        const userId = req.session?.user?.user_id;
        const { id: projectId } = req.params;

        if (!userId) {
            return res.redirect('/login');
        }

        await addVolunteer(userId, projectId);

        res.redirect(`/project/${projectId}`);

    } catch (error) {
        console.error('Error volunteering:', error);
        res.redirect(`/project/${req.params.id}`);
    }
};

const unvolunteerProject = async (req, res) => {
    try {
        const userId = req.session?.user?.user_id;
        const { id: projectId } = req.params;

        if (!userId) {
            return res.redirect('/login');
        }

        await removeVolunteer(userId, projectId);

        res.redirect(`/project/${projectId}`);

    } catch (error) {
        console.error('Error removing volunteer:', error);
        res.redirect(`/project/${req.params.id}`);
    }
};

/* ============================= */
/*        DASHBOARD             */
/* ============================= */

const showUserVolunteeredProjects = async (req, res) => {
    try {
        const user = req.session?.user;

        if (!user) {
            return res.redirect('/login');
        }

        const projects = await getUserProjects(user.user_id);

        res.render('dashboard', {
            title: 'My Dashboard',
            projects,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error('Error loading volunteered projects:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/* ============================= */
/*        EXPORTS               */
/* ============================= */

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    projectValidation,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    volunteerProject,
    unvolunteerProject,
    showUserVolunteeredProjects
};