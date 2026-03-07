import logger from "../config/logger";

//Tar emot och logar URL för varge angrep
const loggMiddleware = (req, res, next) => {
    logger.info(`Anrop: ${req.method} ${req.url}`);
    next();
};

export default loggMiddleware;