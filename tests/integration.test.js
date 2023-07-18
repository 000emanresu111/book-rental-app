const test = require('ava')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const ObjectId = require('mongoose').Types.ObjectId
const sinon = require('sinon')
const User = require('../models/User')
const Book = require('../models/Book')
const Rental = require('../models/Rental')

process.env.NODE_ENV = 'testing'
const app = require('../app')

test.afterEach.always(() => {
  sinon.restore()
})

const user = {
  username: 'testuser1',
  email: 'testuser1@example.com',
  password: 'testpassword1',
  tenantId: '1234'
}

const userCredentials = {
  email: 'testuser1@example.com',
  password: 'testpassword1'
}

test.serial('Integration Test: Register, Login, Rent, and Return', async (t) => {
  const findOneExistingUserStub = sinon.stub(User, 'findOne').resolves(null)

  const saveStub = sinon.stub(User.prototype, 'save').resolves()

  // Register a new user
  const registerResponse = await supertest(app)
    .post('/auth/register')
    .send(user)
    .expect(201)

  console.log('Registration response:', registerResponse.body)

  t.is(registerResponse.body.message, 'User registered successfully')
  t.true(saveStub.calledOnce)

  findOneExistingUserStub.restore()

  // Login with the registered user credentials
  const testUser = new User({
    email: 'testuser1@example.com',
    password: await bcrypt.hash('testpassword1', 10)
  })

  const findOneUserStub = sinon.stub(User, 'findOne').resolves(testUser)

  const loginResponse = await supertest(app)
    .post('/auth/login')
    .send(userCredentials)
    .expect(200)

  console.log('Login response:', loginResponse.body)

  const token = loginResponse.body.token

  t.truthy(token)
  t.true(findOneUserStub.calledOnce)

  // Rent a book
  const book = new Book({
    _id: new ObjectId(),
    title: 'Book 1',
    author: 'Author 1',
    quantity: 5,
    bookstoreId: user.tenantId
  })

  const bookSaveStub = sinon.stub(Book.prototype, 'save').resolves()
  const findOneBookStub = sinon.stub(Book, 'findOne').resolves(book)
  const startSessionStub = sinon.stub(Book, 'startSession').resolves({
    startTransaction: sinon.stub(),
    commitTransaction: sinon.stub(),
    abortTransaction: sinon.stub(),
    endSession: sinon.stub()
  })

  const rentalSaveStub = sinon.stub(Rental.prototype, 'save').resolves(new Rental())
  const activeRentalStub = sinon.stub(Rental, 'findOne').resolves(null)

  const rentResponse = await supertest(app)
    .post(`/books/${book._id}/rent`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  console.log('Rent response:', rentResponse.body)

  t.deepEqual(new Book(rentResponse.body), book)
  t.is(book.quantity, 4)
  t.true(bookSaveStub.calledOnce)
  t.true(findOneBookStub.calledOnce)
  t.true(startSessionStub.calledOnce)
  t.true(rentalSaveStub.calledOnce)
  t.true(activeRentalStub.calledOnce)

  // Return the rented book
  const returnResponse = await supertest(app)
    .post(`/books/${book._id}/return`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  console.log('Return response:', returnResponse.body)

  t.deepEqual(new Book(returnResponse.body), book)
  t.is(book.quantity, 5)
})
