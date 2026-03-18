import {getUpcomingProjects, getProjectDetails} from '../models/service_project.js';
const NUMBER_OF_UPCOMING_PROJECTS = 5;

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

        res.render("project", { // ojo: project.ejs
            title: project.title,
            project: project
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading project details");
    }
}


export { showProjectsPage, showProjectDetailsPage };