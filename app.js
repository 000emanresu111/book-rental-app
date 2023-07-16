const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const authRoutes = require('./routes/authRoutes')
dotenv.config()

const app = express()

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Routes
app.use('/auth', authRoutes)

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

// Start the server
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

module.exports = app
