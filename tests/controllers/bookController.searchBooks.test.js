const test = require('ava')
const sinon = require('sinon')
const Book = require('../../models/Book')
const ObjectId = require('mongoose').Types.ObjectId
const bookController = require('../../controllers/bookController')

const books = [
  { _id: new ObjectId(), title: 'title1', author: 'author1' },
  { _id: new ObjectId(), title: 'title2', author: 'author2' }
]

let findStub

test.beforeEach(() => {
  findStub = sinon.stub(Book, 'find').resolves(books)
})

test.afterEach.always(() => {
  findStub.restore()
  sinon.reset()
})

test.serial('searchBooks returns books matching the title search criteria', async (t) => {
  const req = {
    body: { title: 'title1' }
  }

  const res = {
    json: sinon.spy()
  }

  const next = sinon.spy()

  await bookController.searchBooks(req, res, next)

  t.true(findStub.calledOnceWithExactly({ title: { $regex: 'title1', $options: 'i' } }))
  t.true(res.json.calledOnceWithExactly(books))
  t.false(next.called)
})

test.serial('searchBooks returns books matching the author search criteria', async (t) => {
  const req = {
    body: { author: 'author2' }
  }

  const res = {
    json: sinon.spy()
  }

  const next = sinon.spy()

  await bookController.searchBooks(req, res, next)

  t.true(findStub.calledOnceWithExactly({ author: { $regex: 'author2', $options: 'i' } }))
  t.true(res.json.calledOnceWithExactly(books))
  t.false(next.called)
})

test.serial('searchBooks returns error when no search criteria are provided', async (t) => {
  const req = {
    body: {}
  }

  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.spy()
  }

  const next = sinon.spy()

  await bookController.searchBooks(req, res, next)

  t.true(res.status.calledOnceWithExactly(400))
  t.true(res.json.calledOnceWithExactly({ message: 'Please provide a title or author for the search' }))
  t.false(findStub.called)
  t.false(next.called)
})

test.serial('searchBooks returns books matching both title and author search criteria', async (t) => {
  const req = {
    body: { title: 'title1', author: 'author1' }
  }

  const res = {
    json: sinon.spy()
  }

  const next = sinon.spy()

  await bookController.searchBooks(req, res, next)

  t.true(findStub.calledOnceWithExactly({
    title: { $regex: 'title1', $options: 'i' },
    author: { $regex: 'author1', $options: 'i' }
  }))
  t.true(res.json.calledOnceWithExactly(books))
  t.false(next.called)
})
