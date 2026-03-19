import { getAllCategories, getCategoryById, getProjectsByCategoryId } from '../models/categories.js';

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

export { showCategoriesPage, buildCategoryPage };