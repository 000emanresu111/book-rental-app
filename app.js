const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Routes
// app.use(routes)

// Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  const code = err.code || 'INTERNAL_SERVER_ERROR'
  const message = err.message || 'Internal Server Error'

  console.error(err)

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
})

module.exports = app
