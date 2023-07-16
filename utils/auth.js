const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      throw new Error('Authorization token missing')
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decodedToken.userId)
    if (!user) {
      throw new Error('Invalid user')
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

module.exports = { authenticateUser }
