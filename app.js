const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const errorHandler = require('./middlewares/errorHandler')
const authRoutes = require('./routes/authRoutes')
const bookstoreRoutes = require('./routes/bookstoreRoutes')
const bookRoutes = require('./routes/bookRoutes')

dotenv.config()

const app = express()

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// MongoDB Connection
const dbURI = process.env.MONGODB_URI

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
  }
}
connectToMongoDB()

// Routes
app.use('/auth', authRoutes)
app.use('/bookstores', bookstoreRoutes)
app.use('/books', bookRoutes)

// Error Handler
app.use(errorHandler)

// Start the server
const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

module.exports = app
