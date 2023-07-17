const test = require('ava')
const sinon = require('sinon')
const { ObjectId } = require('mongoose').Types
const { getAllBooks, rentBook, returnBook } = require('../../controllers/bookController')
const Book = require('../../models/Book')

process.env.NODE_ENV = 'testing'

let findByIdStub

test.afterEach.always(() => {
  sinon.restore()
})

test('getAllBooks returns all books for a specific bookstore', async (t) => {
  const books = [
    { _id: '1', title: 'Book 1', author: 'Author 1', quantity: 5, bookstoreId: '123' },
    { _id: '2', title: 'Book 2', author: 'Author 2', quantity: 3, bookstoreId: '123' }
  ]

  const tenantId = '123'

  const findStub = sinon.stub(Book, 'find').resolves(books)

  const req = {
    user: {
      tenantId
    }
  }

  const res = {
    json: sinon.spy()
  }

  const next = sinon.spy()

  await getAllBooks(req, res, next)

  t.true(findStub.calledOnceWithExactly({ bookstoreId: tenantId }))
  t.true(res.json.calledOnceWithExactly(books))
  t.false(next.called)

  findStub.restore()
})

test('rentBook decreases the quantity of a book by 1', async (t) => {
  const bookId = new ObjectId()
  const userTenantId = 'userTenant1'

  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 5,
    bookstoreId: userTenantId
  }

  const findOneAndUpdateStub = sinon.stub(Book, 'findOneAndUpdate').resolves(book)
  const startSessionStub = sinon.stub(Book, 'startSession').resolves({
    startTransaction: sinon.stub(),
    commitTransaction: sinon.stub(),
    abortTransaction: sinon.stub(),
    endSession: sinon.stub()
  })

  const req = {
    params: { id: bookId },
    user: { tenantId: userTenantId }
  }
  const res = {
    json: sinon.spy()
  }
  const next = sinon.spy()

  await rentBook(req, res, next)

  t.true(findOneAndUpdateStub.calledOnceWithExactly(
    { _id: bookId, bookstoreId: userTenantId, quantity: 1 },
    { $inc: { quantity: -1 } },
    { new: true, session: sinon.match.any }
  ))
  t.true(res.json.calledOnceWithExactly(book))
  t.false(next.called)

  findOneAndUpdateStub.restore()
  startSessionStub.restore()
})

test('race conditions are handled when multiple users attempt to rent the last copy of a book simultaneously', async (t) => {
  const bookId = new ObjectId()
  const userTenantId = 'userTenant1'

  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 1,
    bookstoreId: userTenantId
  }

  const findOneAndUpdateStub = sinon.stub(Book, 'findOneAndUpdate')
  findOneAndUpdateStub.onFirstCall().resolves(book) // Simulate the current user successfully renting the book
  findOneAndUpdateStub.onSecondCall().resolves(null) // Simulate another user attempting to rent the book

  const startSessionStub = sinon.stub(Book, 'startSession').resolves({
    startTransaction: sinon.stub(),
    commitTransaction: sinon.stub(),
    abortTransaction: sinon.stub(),
    endSession: sinon.stub()
  })

  const req = {
    params: { id: bookId },
    user: { tenantId: userTenantId }
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await Promise.all([
    rentBook(req, res, next),
    rentBook(req, res, next)
  ])

  t.true(findOneAndUpdateStub.calledTwice)
  t.true(res.status.calledWith(404))
  t.true(res.json.calledWith({ message: 'Book not found or out of stock' }))
  t.false(next.called)

  findOneAndUpdateStub.restore()
  startSessionStub.restore()
})

test('returnBook should increase the quantity of a book by 1', async (t) => {
  const bookId = '1'
  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 5,
    bookstoreId: '123',
    save: sinon.stub().resolves()
  }

  findByIdStub = sinon.stub(Book, 'findById')
  findByIdStub.withArgs(bookId).resolves(book)

  const req = {
    params: {
      id: bookId
    }
  }

  const res = {
    json: sinon.spy()
  }

  const next = sinon.spy()

  await returnBook(req, res, next)

  t.true(findByIdStub.calledOnceWithExactly(bookId))
  t.true(book.save.calledOnce)
  t.is(book.quantity, 6)

  findByIdStub.restore()
})
