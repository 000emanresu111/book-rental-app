const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, bookstoreId } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ username, email, password: hashedPassword, bookstoreId })
    await user.save()
    const token = generateToken(user._id)
    res.json({ token })
  } catch (error) {
    next(error)
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    const token = generateToken(user._id)
    res.json({ token })
  } catch (error) {
    next(error)
  }
}

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

module.exports = { loginUser, generateToken }

module.exports = { registerUser, loginUser, generateToken }
