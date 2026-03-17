import { getAllServiceProjects } from '../models/service_project.js';

const showProjectsPage = async (req, res) => {
    const projects = await getAllServiceProjects();
    const title = 'Projects';
    res.render('projects', { title, projects });
};

export { showProjectsPage };