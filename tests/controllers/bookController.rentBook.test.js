const test = require('ava')
const sinon = require('sinon')
const { ObjectId } = require('mongoose').Types
const { getAllBooks, rentBook } = require('../../controllers/bookController')
const Book = require('../../models/Book')
const Rental = require('../../models/Rental')

process.env.NODE_ENV = 'testing'

test.afterEach.always(() => {
  sinon.restore()
})

test.serial('getAllBooks returns all books for a specific bookstore', async (t) => {
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

test.serial('rentBook decreases the quantity of a book by 1', async (t) => {
  const bookId = new ObjectId()
  const userTenantId = 'userTenant1'

  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 5,
    bookstoreId: userTenantId
  }

  const findOneStub = sinon.stub(Book, 'findOne').resolves(book)
  const findOneAndUpdateStub = sinon.stub(Book, 'findOneAndUpdate').resolves(book)
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

  const activeRentalStub = sinon.stub(Rental, 'findOne').resolves(null) // Mock no active rental

  const req = {
    params: { id: bookId },
    user: { tenantId: userTenantId, _id: 'user1' } // Mock the user ID
  }
  const res = {
    json: sinon.spy()
  }
  const next = sinon.spy()

  await rentBook(req, res, next)

  t.true(findOneStub.calledOnceWithExactly({ _id: bookId, bookstoreId: userTenantId }))
  t.true(activeRentalStub.calledOnceWithExactly({
    userId: req.user._id,
    bookId: book._id,
    returnDate: null
  }))
  t.true(rentalSaveStub.calledOnce) // Verify that the rental was saved
  t.true(res.json.calledOnceWithExactly(book))
  t.false(next.called)

  findOneStub.restore()
  findOneAndUpdateStub.restore()
  startSessionStub.restore()
  rentalSaveStub.restore()
  activeRentalStub.restore()
})

test.serial('user cannot rent a book if all copies are rented out', async (t) => {
  const bookId = new ObjectId()
  const userTenantId = 'userTenant1'

  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 0,
    bookstoreId: userTenantId
  }

  const findOneStub = sinon.stub(Book, 'findOne').resolves(book)

  findOneStub.withArgs({ _id: bookId, bookstoreId: userTenantId }).resolves(book)

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

  await rentBook(req, res, next)

  t.true(findOneStub.calledOnceWithExactly({ _id: bookId, bookstoreId: userTenantId }))
  t.true(res.status.calledOnceWith(400))
  t.true(res.json.calledOnceWith({ message: 'Book out of stock' }))
  t.false(next.called)

  findOneStub.restore()
  startSessionStub.restore()
})

test.serial('user cannot rent more than one copy of the same book at the same time', async (t) => {
  const bookId = new ObjectId()
  const userTenantId = 'userTenant1'

  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 5,
    bookstoreId: userTenantId
  }

  const findOneStub = sinon.stub(Book, 'findOne').resolves(book)
  const findOneAndUpdateStub = sinon.stub(Book, 'findOneAndUpdate').resolves(book)
  const activeRentalStub = sinon.stub(Rental, 'findOne')
  activeRentalStub.resolves({}) // Simulate an active rental for the same user

  const startSessionStub = sinon.stub(Book, 'startSession').resolves({
    startTransaction: sinon.stub(),
    commitTransaction: sinon.stub(),
    abortTransaction: sinon.stub(),
    endSession: sinon.stub()
  })

  const req = {
    params: { id: bookId },
    user: { tenantId: userTenantId, _id: 'user1' } // Mock the user ID
  }
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }
  const next = sinon.spy()

  await rentBook(req, res, next)

  t.true(findOneStub.calledOnceWithExactly({ _id: bookId, bookstoreId: userTenantId }))
  t.true(activeRentalStub.calledOnceWithExactly({ userId: 'user1', bookId, returnDate: null }))
  t.true(res.status.calledWith(400))
  t.true(res.json.calledWith({ message: 'User already has an active rental for this book' }))
  t.false(next.called)

  findOneStub.restore()
  findOneAndUpdateStub.restore()
  activeRentalStub.restore()
  startSessionStub.restore()
})

test.serial('race conditions are handled when multiple users attempt to rent the last copy of a book simultaneously', async (t) => {
  const bookId = new ObjectId()
  const userTenantId = 'userTenant1'

  const book = {
    _id: bookId,
    title: 'Book 1',
    author: 'Author 1',
    quantity: 1,
    bookstoreId: userTenantId
  }

  const findOneStub = sinon.stub(Book, 'findOne')
  findOneStub.onFirstCall().resolves(book) // Simulate the book being found
  findOneStub.onSecondCall().resolves(null) // Simulate the book not being found

  const findOneAndUpdateStub = sinon.stub(Book, 'findOneAndUpdate')
  findOneAndUpdateStub.onFirstCall().resolves(book) // Simulate the current user successfully renting the book
  findOneAndUpdateStub.onSecondCall().resolves(null) // Simulate another user attempting to rent the book

  const activeRentalStub = sinon.stub(Rental, 'findOne')
  activeRentalStub.onFirstCall().resolves(null) // Simulate no active rental for the current user
  activeRentalStub.onSecondCall().resolves({}) // Simulate an active rental for another user

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

  t.true(findOneStub.calledTwice)
  t.true(res.status.calledWith(404))
  t.true(findOneAndUpdateStub.calledOnce)
  t.true(activeRentalStub.calledOnce)

  findOneStub.restore()
  findOneAndUpdateStub.restore()
  activeRentalStub.restore()
  startSessionStub.restore()
  sinon.assert.called(res.json)
})
