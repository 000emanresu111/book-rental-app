const Book = require('../models/Book')

const getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ bookstoreId: req.user.tenantId })
    res.json(books)
  } catch (error) {
    next(error)
  }
}

const rentBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ message: 'Book not found' })
    }

    if (book.quantity === 0) {
      return res.status(400).json({ message: 'Book out of stock' })
    }

    book.quantity -= 1
    await book.save()

    res.json(book)
  } catch (error) {
    next(error)
  }
}

const returnBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({ message: 'Book not found' })
    }

    book.quantity += 1
    await book.save()

    res.json(book)
  } catch (error) {
    next(error)
  }
}

module.exports = { getAllBooks, rentBook, returnBook }
