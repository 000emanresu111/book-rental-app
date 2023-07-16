const Bookstore = require('../models/Bookstore')

const getAllBookstores = async (req, res, next) => {
  try {
    const bookstores = await Bookstore.find()
    res.json(bookstores)
  } catch (error) {
    next(error)
  }
}

module.exports = { getAllBookstores }
