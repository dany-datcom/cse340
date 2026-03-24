import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
} from '../models/categories.js';
import { getProjectDetails } from '../models/service_project.js';

const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();
        const title = 'Categories';

        res.render('categories', {
            title,
            categories
        });

    } catch (error) {
        console.error(error);
        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

const buildCategoryPage = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await getCategoryById(id);
        const projects = await getProjectsByCategoryId(id);

        res.render("category", {
            title: category.name,
            category,
            projects
        });

    } catch (error) {
        console.error(error);
        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

const showAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;

    const projectDetails = await getProjectDetails(projectId);
    const categories = await getAllCategories();
    const assignedCategories = await getCategoriesByProjectId(projectId);

    const title = 'Assign Categories to Project';

    res.render('assign-categories', { title, projectId, projectDetails, categories, assignedCategories });
};

const processAssignCategoriesForm = async (req, res) => {
    const projectId = req.params.projectId;
    const selectedCategoryIds = req.body.categoryIds || [];

    // Ensure selectedCategoryIds is an array
    const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];
    await updateCategoryAssignments(projectId, categoryIdsArray);
    req.flash('success', 'Categories updated successfully.');
    res.redirect(`/project/${projectId}`);
};

export { showCategoriesPage, buildCategoryPage, showAssignCategoriesForm, processAssignCategoriesForm };