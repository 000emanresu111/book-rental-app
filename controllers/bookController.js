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
    // Using transactions and locks to prevent race conditions
    const session = await Book.startSession()
    session.startTransaction()

    const bookId = req.params.id
    const userTenantId = req.user.tenantId

    const book = await Book.findOne({ _id: bookId, bookstoreId: userTenantId })

    if (!book) {
      return res.status(404).json({ message: 'Book not found' })
    }

    if (book.quantity === 0) {
      return res.status(400).json({ message: 'Book out of stock' })
    }

    try {
      // findOneAndUpdate() is atomic: the document can't change between when MongoDB finds the document and when MongoDB applies the update operation
      const updatedBook = await Book.findOneAndUpdate(
        { _id: bookId, bookstoreId: userTenantId, quantity: 1 },
        { $inc: { quantity: -1 } },
        { new: true, session }
      )

      if (!updatedBook) {
        await session.abortTransaction()
        session.endSession()
        return res.status(404).json({ message: 'Book not found or out of stock' })
      }

      await session.commitTransaction()
      session.endSession()

      res.json(updatedBook)
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      next(error)
    }
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
