const Book = require('../models/Book')

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ bookstoreId: req.user.tenantId })
    res.json(books)
  } catch (error) {
    next(error)
  }
}

module.exports = { getAllBooks }
