process.env.NODE_ENV = 'testing'

const test = require('ava')
const sinon = require('sinon')
const { getAllBookstores } = require('../../controllers/bookstoreController')
const Bookstore = require('../../models/Bookstore')

test('getAllBookstores returns all bookstores', async (t) => {
  const bookstores = [
    { _id: '1', name: 'Bookstore 1' },
    { _id: '2', name: 'Bookstore 2' }
  ]

  sinon.stub(Bookstore, 'find').resolves(bookstores)
  const req = {}
  const res = {
    json: sinon.spy()
  }

  const next = sinon.spy()

  await getAllBookstores(req, res, next)

  t.true(Bookstore.find.calledOnce)
  t.true(res.json.calledOnceWithExactly(bookstores))
  t.false(next.called)

  Bookstore.find.restore()
})
