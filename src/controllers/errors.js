/**
 * Middleware to simulate a server error for testing purposes.
 * This helps verify that global error handling is working correctly.
 */
const testErrorPage = (req, res, next) => {
    try {
        // Create a custom error with message and status code
        const error = new Error('This is a test error');

        // Attach HTTP status code to the error object
        error.status = 500;

        // Pass error to the next middleware (global error handler)
        next(error);

    } catch (unexpectedError) {
        // Fallback in case something goes wrong unexpectedly
        console.error('Unexpected error in testErrorPage middleware:', unexpectedError);

        next(unexpectedError);
    }
};

export { testErrorPage };