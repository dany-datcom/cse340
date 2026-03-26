import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesByProjectId,
    updateCategoryAssignments,
    createCategory,
    updateCategory
} from '../models/categories.js';
import { body, validationResult } from 'express-validator';
import { getProjectDetails } from '../models/service_project.js';

const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
];

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

const showNewCategoryForm = (req, res) => {
    res.render('new-category', {
        title: 'Create Category'
    });
};

const processNewCategoryForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new project form
        return res.redirect('/new-category');
    }

    try {
        const { name } = req.body;

        const categoryId = await createCategory(name);

        req.flash('success', 'Category created successfully!');
        res.redirect(`/category/${categoryId}`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating category');
    }
};

const showEditCategoryForm = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await getCategoryById(id);

        res.render('edit-category', {
            title: 'Edit Category',
            category
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading category');
    }
};

const processEditCategoryForm = async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Loop through validation errors and flash them
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        // Redirect back to the new project form
        return res.redirect(`/edit-category/${req.params.id}`);
    }

    try {
        const id = req.params.id;
        const { name } = req.body;

        await updateCategory(id, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${id}`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating category');
    }
};
export {
    showCategoriesPage,
    buildCategoryPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    processEditCategoryForm,
    showEditCategoryForm,
    processNewCategoryForm,
    showNewCategoryForm,
    categoryValidation
};