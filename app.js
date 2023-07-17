const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const errorHandler = require('./middlewares/errorHandler')
const authRoutes = require('./routes/authRoutes')
const bookstoreRoutes = require('./routes/bookstoreRoutes')
const bookRoutes = require('./routes/bookRoutes')
const connectToMongoDB = require('./database/db')

dotenv.config()

const app = express()
const config = require('./config')[process.env.NODE_ENV || 'development']

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// MongoDB Connection (Conditional)
if (config.connectToDB) {
  const dbURI = process.env.MONGODB_URI
  connectToMongoDB(dbURI)
}

// Routes
app.use('/auth', authRoutes)
app.use('/bookstores', bookstoreRoutes)
app.use('/books', bookRoutes)

// Error Handler
app.use(errorHandler)

// Start the server
const port = process.env.NODE_ENV === 'testing' ? undefined : process.env.PORT

const server = app.listen(port, () => {
  console.log(`Server listening on port ${server.address().port}`)
})

module.exports = app
