const express = require('express')
const { getAllBooks, rentBook, returnBook, searchBooks } = require('../controllers/bookController')
const { authenticateUser } = require('../utils/auth')

const router = express.Router()

router.get('/', authenticateUser, getAllBooks)
router.post('/:bookId/rent', authenticateUser, rentBook)
router.post('/:bookId/return', authenticateUser, returnBook)
router.post('/search', authenticateUser, searchBooks)

module.exports = router
