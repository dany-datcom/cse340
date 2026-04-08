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

/**
 * Validation rules for category creation and update
 */
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
];

/**
 * Displays all categories
 */
const showCategoriesPage = async (req, res) => {
    try {
        const categories = await getAllCategories();

        res.render('categories', {
            title: 'Categories',
            categories,
            isAdmin: req.session.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error fetching categories:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/**
 * Displays a single category with its associated projects
 */
const buildCategoryPage = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await getCategoryById(id);

        // Validate if category exists
        if (!category) {
            return res.status(404).render("errors/404", {
                title: "Category Not Found"
            });
        }

        const projects = await getProjectsByCategoryId(id);

        res.render("category", {
            title: category.name,
            category,
            projects,
            isAdmin: req.session.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error building category page:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/**
 * Displays form to assign categories to a project
 */
const showAssignCategoriesForm = async (req, res) => {
    const { projectId } = req.params;

    try {
        const projectDetails = await getProjectDetails(projectId);

        // Validate if project exists
        if (!projectDetails) {
            return res.status(404).render("errors/404", {
                title: "Project Not Found"
            });
        }

        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesByProjectId(projectId);

        res.render('assign-categories', {
            title: 'Assign Categories to Project',
            projectId,
            projectDetails,
            categories,
            assignedCategories,
            isAdmin: req.session.user?.role_name === 'admin'
        });

    } catch (error) {
        console.error('Error loading assign categories form:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/**
 * Processes category assignment to a project
 */
const processAssignCategoriesForm = async (req, res) => {
    const { projectId } = req.params;
    const selectedCategoryIds = req.body.categoryIds || [];

    try {
        // Ensure selectedCategoryIds is always an array
        const categoryIdsArray = Array.isArray(selectedCategoryIds)
            ? selectedCategoryIds
            : [selectedCategoryIds];

        await updateCategoryAssignments(projectId, categoryIdsArray);

        req.flash('success', 'Categories updated successfully.');
        res.redirect(`/project/${projectId}`);

    } catch (error) {
        console.error('Error updating category assignments:', error);

        req.flash('error', 'Failed to update categories.');
        res.redirect(`/assign-categories/${projectId}`);
    }
};

/**
 * Displays form to create a new category
 */
const showNewCategoryForm = (req, res) => {
    res.render('new-category', {
        title: 'Create Category'
    });
};

/**
 * Handles creation of a new category
 */
const processNewCategoryForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect('/new-category');
    }

    try {
        const { name } = req.body;

        const categoryId = await createCategory(name);

        req.flash('success', 'Category created successfully!');
        res.redirect(`/category/${categoryId}`);

    } catch (error) {
        console.error('Error creating category:', error);

        req.flash('error', 'Failed to create category.');
        res.redirect('/new-category');
    }
};

/**
 * Displays form to edit an existing category
 */
const showEditCategoryForm = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await getCategoryById(id);

        // Validate if category exists
        if (!category) {
            return res.status(404).render("errors/404", {
                title: "Category Not Found"
            });
        }

        res.render('edit-category', {
            title: 'Edit Category',
            category
        });

    } catch (error) {
        console.error('Error loading category:', error);

        res.status(500).render("errors/500", {
            title: "Server Error"
        });
    }
};

/**
 * Handles updating an existing category
 */
const processEditCategoryForm = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });

        return res.redirect(`/edit-category/${req.params.id}`);
    }

    try {
        const { id } = req.params;
        const { name } = req.body;

        await updateCategory(id, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${id}`);

    } catch (error) {
        console.error('Error updating category:', error);

        req.flash('error', 'Failed to update category.');
        res.redirect(`/edit-category/${req.params.id}`);
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