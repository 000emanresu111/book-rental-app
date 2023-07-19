const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
const errorHandler = require('./middlewares/errorHandler')
const authRoutes = require('./routes/authRoutes')
const bookstoreRoutes = require('./routes/bookstoreRoutes')
const bookRoutes = require('./routes/bookRoutes')
const connectToMongoDB = require('./database/db')
const { logger, loggerMiddleware } = require('./middlewares/logger')

dotenv.config()

const app = express()
const config = require('./config')[process.env.NODE_ENV || 'development']

// Middleware
app.use(loggerMiddleware)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Error Handler
app.use(errorHandler)

// MongoDB Connection (Conditional)
if (config.connectToDB) {
  const dbURI = process.env.NODE_ENV === 'docker' ? process.env.MONGODB_URI : process.env.MONGODB_URI_LOCAL
  connectToMongoDB(dbURI)
}

// Routes
app.use('/auth', authRoutes)
app.use('/bookstores', bookstoreRoutes)
app.use('/books', bookRoutes)
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// Start the server
const port = process.env.NODE_ENV === 'testing' ? undefined : process.env.PORT

const server = app.listen(port, () => {
  logger.info(`Server listening on port ${server.address().port}`)
})

module.exports = app
