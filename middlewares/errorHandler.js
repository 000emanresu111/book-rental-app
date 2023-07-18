const { logger } = require('./logger')

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const code = err.code || 'INTERNAL_SERVER_ERROR'
  const message = err.message || 'Internal Server Error'

  logger.error(err) // Log the error using the logger

  if (!res.headersSent) {
    const errorResponse = {
      status,
      error: {
        code,
        message
      }
    }

    res.status(status).json(errorResponse)
  }

  next(err)
}

module.exports = errorHandler
