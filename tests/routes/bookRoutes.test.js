const test = require('ava')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const Book = require('../../models/Book')
const sinon = require('sinon')
const ObjectId = require('mongoose').Types.ObjectId
const User = require('../../models/User')
const Rental = require('../../models/Rental')

process.env.NODE_ENV = 'testing'
const app = require('../../app')

test.serial('GET /books shows all books for an authenticated user', async (t) => {
  const user = new User({
    userId: 'user123',
    tenantId: 'tenant123'
  })

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

  const findByIdStub = sinon.stub(User, 'findById').resolves(user)

  const books = [
    { title: 'Book 1', author: 'Author 1', bookstoreId: user.tenantId },
    { title: 'Book 2', author: 'Author 2', bookstoreId: user.tenantId }
  ]

  const findStub = sinon.stub(Book, 'find').resolves(books)

  const response = await supertest(app)
    .get('/books')
    .set('Authorization', `Bearer ${token}`)

  t.is(response.status, 200)
  t.deepEqual(response.body, books)
  t.true(findStub.calledOnceWithExactly({ bookstoreId: user.tenantId }))

  findStub.restore()
  findByIdStub.restore()
})

test.serial('POST /books/:bookId/rent shows the rented book and decrease its quantity by 1', async (t) => {
  const user = new User({
    userId: 'user123',
    tenantId: 'tenant123'
  })

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

  sinon.stub(User, 'findById').resolves(user)

  const books = [
    { title: 'Book 1', author: 'Author 1', bookstoreId: user.tenantId },
    { title: 'Book 2', author: 'Author 2', bookstoreId: user.tenantId }
  ]

  const findStub = sinon.stub(Book, 'find').resolves(books)

  const bookId = new ObjectId()
  const userTenantId = user.tenantId

  const book = new Book({
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    bookstoreId: userTenantId,
    quantity: 1
  })

  const startSessionStub = sinon.stub(Book, 'startSession').resolves({
    startTransaction: sinon.stub(),
    commitTransaction: sinon.stub(),
    abortTransaction: sinon.stub(),
    endSession: sinon.stub()
  })

  const rentalSaveStub = sinon.stub(Rental.prototype, 'save').callsFake(async function () {
    this._id = new ObjectId() // Set a mock rental ID
    return this
  })

  const activeRentalStub = sinon.stub(Rental, 'findOne').resolves(null)
  const findOneStub = sinon.stub(Book, 'findOne').resolves(book)
  const saveStub = sinon.stub(book, 'save').resolves(book)

  const response = await supertest(app)
    .post(`/books/${bookId}/rent`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  const responseBook = new Book(response.body)

  t.is(responseBook.title, book.title)
  t.is(responseBook.author, book.author)
  t.is(book.quantity, 0)
  t.true(saveStub.calledOnce)

  startSessionStub.restore()
  findOneStub.restore()
  activeRentalStub.restore()
  rentalSaveStub.restore()
  saveStub.restore()
  findStub.restore()
})

test.serial('POST /books/:bookId/return shows the returned book and increases its quantity by 1', async (t) => {
  const user = new User({
    userId: 'user123',
    tenantId: 'tenant123'
  })

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

  const books = [
    { title: 'Book 1', author: 'Author 1', bookstoreId: user.tenantId },
    { title: 'Book 2', author: 'Author 2', bookstoreId: user.tenantId }
  ]

  const findStub = sinon.stub(Book, 'find').resolves(books)

  const bookId = new ObjectId()
  const userTenantId = user.tenantId

  const book = new Book({
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    bookstoreId: userTenantId,
    quantity: 0
  })

  const findByIdStub = sinon.stub(Book, 'findById').resolves(book)
  const saveStub = sinon.stub(Book.prototype, 'save').resolves(book)

  const response = await supertest(app)
    .post(`/books/${bookId}/return`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)

  t.deepEqual(new Book(response.body), book)
  t.is(book.quantity, 1)
  t.true(saveStub.calledOnce)

  findStub.restore()
  findByIdStub.restore()
  saveStub.restore()
})

test.serial('POST /books/search returns books found via regex query', async (t) => {
  const user = {
    userId: 'user123',
    tenantId: 'tenant123'
  }

  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET)

  const searchQuery = {
    title: 'Book',
    author: 'Author'
  }

  const searchResults = [
    { title: 'Book 1', author: 'Author 1' },
    { title: 'Book 2', author: 'Author 2' }
  ]

  const findStub = sinon.stub(Book, 'find').resolves(searchResults)

  const response = await supertest(app)
    .post('/books/search')
    .set('Authorization', `Bearer ${token}`)
    .send(searchQuery)
    .expect(200)

  t.deepEqual(response.body, searchResults)

  t.true(findStub.calledOnceWithExactly({
    title: { $regex: searchQuery.title, $options: 'i' },
    author: { $regex: searchQuery.author, $options: 'i' }
  }))

  findStub.restore()
})
