const test = require('ava')
const sinon = require('sinon')
const { getAllBooks } = require('../../controllers/bookController')
const Book = require('../../models/Book')

test('getAllBooks returns all books for a specific bookstore', async (t) => {
  const books = [
    { _id: '1', title: 'Book 1', author: 'Author 1', quantity: 5, bookstoreId: '123' },
    { _id: '2', title: 'Book 2', author: 'Author 2', quantity: 3, bookstoreId: '123' }
  ]

  const tenantId = '123'

  sinon.stub(Book, 'find').resolves(books)

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

  t.true(Book.find.calledOnce)
  t.true(Book.find.calledWithExactly({ bookstoreId: tenantId }))
  t.true(res.json.calledOnceWithExactly(books))
  t.false(next.called)

  Book.find.restore()
})
