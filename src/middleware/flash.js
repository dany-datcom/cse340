/**
 * Flash Message Middleware
 *
 * Provides temporary message storage using session.
 * Messages persist across redirects and are cleared after retrieval.
 *
 * Supported types: success, error, warning, info
 */

const DEFAULT_FLASH_STRUCTURE = {
    success: [],
    error: [],
    warning: [],
    info: []
};

/**
 * Initializes flash storage and attaches flash() helper to request
 */
const flashMiddleware = (req, res, next) => {
    /**
     * Flash function behavior:
     * - flash(type, message): stores a message
     * - flash(type): retrieves and clears messages of that type
     * - flash(): retrieves and clears all messages
     */
    req.flash = function (type, message) {

        // Ensure session exists
        if (!req.session) {
            console.error('Session is not available for flash messages.');
            return;
        }

        // Initialize flash storage if missing
        if (!req.session.flash) {
            req.session.flash = { ...DEFAULT_FLASH_STRUCTURE };
        }

        /* ============================= */
        /*        SET MESSAGE           */
        /* ============================= */
        if (type && message) {

            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }

            req.session.flash[type].push(message);
            return;
        }

        /* ============================= */
        /*    GET MESSAGES BY TYPE      */
        /* ============================= */
        if (type && !message) {
            const messages = req.session.flash[type] || [];

            // Clear messages after reading
            req.session.flash[type] = [];

            return messages;
        }

        /* ============================= */
        /*        GET ALL MESSAGES      */
        /* ============================= */
        const allMessages = { ...req.session.flash };

        // Reset flash storage
        req.session.flash = { ...DEFAULT_FLASH_STRUCTURE };

        return allMessages;
    };

    next();
};

/**
 * Makes flash() available in all views via res.locals
 */
const flashLocals = (req, res, next) => {
    res.locals.flash = req.flash;
    next();
};

/**
 * Combined middleware (ensures correct execution order)
 */
const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;