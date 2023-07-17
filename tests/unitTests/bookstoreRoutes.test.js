const test = require('ava')
const supertest = require('supertest')
const sinon = require('sinon')
const Bookstore = require('../../models/Bookstore')

process.env.NODE_ENV = 'testing'
const app = require('../../app')

test('GET /bookstores returns all bookstores', async (t) => {
  const mockBookstores = ['bookstore1', 'bookstore2']

  const findStub = sinon.stub(Bookstore, 'find').resolves(mockBookstores)

  const response = await supertest(app).get('/bookstores')

  t.is(response.status, 200)
  t.deepEqual(response.body, mockBookstores)

  findStub.restore()
})
