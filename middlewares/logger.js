const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => {
      const coloredLevel = format.colorize().colorize(level, level.toUpperCase());
      return `[${timestamp}] ${coloredLevel}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs.log', format: format.simple(), encoding: 'utf8' })
  ]
});

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const logMessage = `[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`;
    logger.info(logMessage);
  });

  next();
};

module.exports = { logger, loggerMiddleware };
