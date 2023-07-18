const mongoose = require('mongoose')
const { logger } = require('../middlewares/logger')

const connectToMongoDB = async (dbURI) => {
  try {
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    logger.info('Connected to MongoDB')
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error}`)
  }
}

module.exports = connectToMongoDB
