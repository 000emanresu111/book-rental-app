const test = require('ava')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const app = require('../../app')
const Book = require('../../models/Book')
const sinon = require('sinon')
const User = require('../../models/User')

test('GET /books returns all books for an authenticated user', async (t) => {
  const user = {
    userId: 'user123',
    tenantId: 'tenant123'
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)

  const books = [
    { title: 'Book 1', author: 'Author 1', bookstoreId: user.tenantId },
    { title: 'Book 2', author: 'Author 2', bookstoreId: user.tenantId }
  ]

  const findByIdStub = sinon.stub(User, 'findById').resolves(user)

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
