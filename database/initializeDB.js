const User = require('../models/User')
const Book = require('../models/Book')
const Bookstore = require('../models/Bookstore')
const Rental = require('../models/Rental')
const mongoose = require('mongoose')
const errorHandler = require('../middlewares/errorHandler')
const connectToMongoDB = require('./db')
const { logger } = require('../middlewares/logger')

require('dotenv').config({ path: '.env' })

const dbURI = process.env.NODE_ENV === 'docker' ? process.env.MONGODB_URI : process.env.MONGODB_URI_LOCAL

const createCollection = async (model) => {
  try {
    await model.createCollection()
    logger.info('Collection is created!')
  } catch (error) {
    logger.error(`Failed to create collection: ${error}`)
  }
}

const createCollections = async () => {
  await createCollection(User)
  await createCollection(Book)
  await createCollection(Bookstore)
  await createCollection(Rental)
}

createCollections()

const initializeData = async () => {
  try {
    await initializeUsers()
    await initializeBooks()
    await initializeBookstores()
  } catch (error) {
    logger.error(`Failed to initialize data: ${error}`)
  }
}

// Initialize Users collection
const initializeUsers = async () => {
  try {
    await User.deleteMany()

    const users = [
      {
        username: 'user1',
        email: 'user1@example.com',
        password: 'user1password',
        tenantId: 'bookstore1'
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: 'user2password',
        tenantId: 'bookstore1'
      },
      {
        username: 'user3',
        email: 'user3@example.com',
        password: 'user3password',
        tenantId: 'bookstore3'
      }
    ]

    await User.insertMany(users)
    logger.info('Users collection initialized')
  } catch (error) {
    logger.error(`Failed to initialize Users collection: ${error}`)
  }
}

// Initialize Books collection
const initializeBooks = async () => {
  try {
    await Book.deleteMany()

    const books = [
      {
        title: 'Book 1',
        author: 'Author 1',
        quantity: 5,
        bookstoreId: 'bookstore1'
      },
      {
        title: 'Book 2',
        author: 'Author 2',
        quantity: 3,
        bookstoreId: 'bookstore2'
      },
      {
        title: 'Book 3',
        author: 'Author 3',
        quantity: 7,
        bookstoreId: 'bookstore3'
      }
    ]

    await Book.insertMany(books)
    logger.info('Book collection initialized')
  } catch (error) {
    logger.error(`Failed to initialize Books collection: ${error}`)
  }
}

// Initialize Bookstores collection
const initializeBookstores = async () => {
  try {
    await Bookstore.deleteMany()

    const bookstores = [
      { name: 'BookstoreNameOne' },
      { name: 'BookstoreNameTwo' },
      { name: 'BookstoreNameThree' }
    ]

    await Bookstore.insertMany(bookstores)
    logger.info('Bookstores collection initialized')
  } catch (error) {
    logger.error(`Failed to initialize Bookstores collection: ${error}`)
  }
}

// Close the MongoDB connection
const closeConnection = async () => {
  try {
    await mongoose.disconnect()
    logger.info('MongoDB connection closed')
  } catch (error) {
    logger.error(`Failed to close MongoDB connection: ${error}`)
  }
}

const initDB = async () => {
  try {
    await connectToMongoDB(dbURI)
    await initializeData()
  } catch (error) {
    errorHandler(error)
  } finally {
    closeConnection()
  }
}

initDB()
