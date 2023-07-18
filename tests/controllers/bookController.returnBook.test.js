const test = require('ava')
const sinon = require('sinon')
const { returnBook } = require('../../controllers/bookController')
const Book = require('../../models/Book')

process.env.NODE_ENV = 'testing'

let findByIdStub

test.afterEach.always(() => {
  sinon.restore()
})

test.serial('returnBook should increase the quantity of a book by 1', async (t) => {
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

test.serial('returnBook should respond with 404 if book is not found', async (t) => {
  const bookId = '1'

  findByIdStub = sinon.stub(Book, 'findById')
  findByIdStub.withArgs(bookId).resolves(null)

  const req = {
    params: {
      id: bookId
    }
  }

  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }

  const next = sinon.spy()

  await returnBook(req, res, next)

  t.true(findByIdStub.calledOnceWithExactly(bookId))
  t.true(res.status.calledOnceWith(404))
  t.true(res.json.calledOnceWith({ message: 'Book not found' }))
  t.false(next.called)

  findByIdStub.restore()
})

test.serial('returnBook should handle errors and call next middleware', async (t) => {
  const bookId = '1'
  const error = new Error('Something went wrong')

  findByIdStub = sinon.stub(Book, 'findById')
  findByIdStub.withArgs(bookId).throws(error)

  const req = {
    params: {
      id: bookId
    }
  }

  const res = {}

  const next = sinon.spy()

  await returnBook(req, res, next)

  t.true(findByIdStub.calledOnceWithExactly(bookId))
  t.true(next.calledOnceWith(error))

  findByIdStub.restore()
})
