import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    transports: [
        //Sparar fel i fil
        new winston.transports.File({ filename: 'error.log', level: 'error'}),
        //Kombinerar alla fel i en fil
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

//För utveckling i lockal utvekling
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;