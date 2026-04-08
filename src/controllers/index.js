/**
 * Renders the home page of the application
 */
const showHomePage = async (req, res) => {
    try {
        // Define page title
        const title = 'Home';

        // Render home view with title
        res.render('home', { title });

    } catch (error) {
        // Log error for debugging purposes
        console.error('Error rendering home page:', error);

        // Render generic server error page
        res.status(500).render('errors/500', {
            title: 'Server Error'
        });
    }
};

export { showHomePage };