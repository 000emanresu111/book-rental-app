const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, tenantId } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({ username, email, password: hashedPassword, tenantId })

    await user.save()

    const token = generateToken(user._id)
    
    res.status(201).json({ message: 'User registered successfully', token })
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
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

module.exports = { registerUser, loginUser, generateToken }
