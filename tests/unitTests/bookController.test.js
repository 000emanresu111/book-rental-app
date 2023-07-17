const test = require('ava')
const sinon = require('sinon')
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
  const bookId = '1'
  const book = { _id: bookId, title: 'Book 1', author: 'Author 1', quantity: 5, bookstoreId: '123', save: sinon.stub().resolves() }

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

  await rentBook(req, res, next)

  t.true(findByIdStub.calledOnceWithExactly(bookId))
  t.true(book.save.calledOnce)
  t.is(book.quantity, 4)
  t.true(res.json.calledOnceWithExactly(book))
  t.false(next.called)

  findByIdStub.restore()
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

  findByIdStub.restore()

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
