const winston = require('winston');

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4
};

const logger = winston.createLogger({
  level: 'info',
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      const coloredLevel = winston.format.colorize().colorize(level, level.toUpperCase());
      return `[${timestamp}] ${coloredLevel}: ${message}`;
    })
  ),
  transports: [
    process.env.NODE_ENV !== 'testing' ? new winston.transports.Console() : null,
    new winston.transports.File({ filename: 'logs.log', format: winston.format.simple(), encoding: 'utf8' })
  ].filter(Boolean)
});

const loggerMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV !== 'testing') {
    logger.info(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  }
  next();
};

module.exports = { logger, loggerMiddleware };
