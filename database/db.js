const mongoose = require('mongoose')

const connectToMongoDB = async (dbURI) => {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
  }
}

module.exports = connectToMongoDB
