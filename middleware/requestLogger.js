import logger from '../config/logger.js';

// HTTP request logging middleware - loggar inkommande requests och responses
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Logga inkommande request
    logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    
    // Fånga när response skickas
    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        const status = res.statusCode;
        
        // Logga response med status kod och varaktighet
        logger.info(`${req.method} ${req.originalUrl} ${status} - ${duration}ms`);
        
        // Om det är ett fel (4xx, 5xx), logga som warning/error
        if (status >= 400) {
            logger.warn(`ERROR: ${req.method} ${req.originalUrl} ${status}`);
        }
        
        res.send = originalSend;
        return res.send(data);
    };
    
    next();
};

export default requestLogger;
