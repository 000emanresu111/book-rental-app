const express = require('express')
const { getAllBooks } = require('../controllers/bookController')
const { authenticateUser } = require('../utils/auth')

const router = express.Router()

router.get('/', authenticateUser, getAllBooks)

module.exports = router
