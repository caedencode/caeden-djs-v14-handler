const winston = require('winston');
const { format, transports } = winston;
const path = require('path');

const customColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(customColors);

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize({ all: true }),
    format.printf(
        info => `[${info.timestamp}] [${info.level}]: ${info.message}`
    )
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4
    },
    format: logFormat,
    transports: [
        new transports.Console(),
        new transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new transports.File({
            filename: path.join(__dirname, '../../logs/combined.log')
        })
    ]
});

module.exports = logger;