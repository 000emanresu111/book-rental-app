const test = require('ava')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const sinon = require('sinon')
const User = require('../models/User')

process.env.NODE_ENV = 'testing'
const app = require('../app')

const registrationInfo = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'testpassword',
  tenantId: '123'
}

const userCredentials = {
  email: 'testuser@example.com',
  password: 'testpassword'
}

const saveStub = sinon.stub(User.prototype, 'save').resolves()

test.serial('Integration Test: Register, Login, Rent, and Return', async (t) => {
  // Register a new user
  const registerResponse = await supertest(app)
    .post('/auth/register')
    .send(registrationInfo)
    .expect(201)

  console.log('Registration response:', registerResponse.body)

  t.is(registerResponse.body.message, 'User registered successfully')
  t.true(saveStub.calledOnce)

  // Login with the registered user credentials
  const testUser = new User({
    email: 'test@example.com',
    password: await bcrypt.hash('testpassword', 10)
  })

  const findOneStub = sinon.stub(User, 'findOne').resolves(testUser)

  const loginResponse = await supertest(app)
    .post('/auth/login')
    .send(userCredentials)
    .expect(200)

  console.log('Login response:', loginResponse.body)

  const token = loginResponse.body.token

  t.truthy(token)

  //   // Rent a book
  //   const rentResponse = await supertest(app)
  //     .post('/books/:bookId/rent')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({
  //       title: 'Book 1',
  //       author: 'Author 1',
  //       quantity: 5,
  //       bookstoreId: 'bookstore1'
  //     })
  //     .expect(200)

  //   t.is(rentResponse.body.message, 'Book rented successfully')

  //   // Return the rented book
  //   const returnResponse = await supertest(app)
  //     .post('/books/:bookId/return')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send({
  //       title: 'Book 1',
  //       author: 'Author 1'
  //     })
  //     .expect(200)

  //   t.is(returnResponse.body.message, 'Book returned successfully')

  saveStub.restore()
  findOneStub.restore()
})
