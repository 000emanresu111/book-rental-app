const express = require('express')
const { getAllBookstores } = require('../controllers/bookstoreController')

const router = express.Router()

router.get('/', getAllBookstores)

module.exports = router
