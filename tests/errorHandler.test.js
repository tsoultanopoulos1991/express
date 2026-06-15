const errorHandler = require('../src/middleware/errorHandler')

const mockRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

describe('errorHandler', () => {
  it('maps a foreign key violation to a clean 422 (e.g. booking for a non-existent user)', () => {
    const res = mockRes()

    errorHandler({ name: 'SequelizeForeignKeyConstraintError', message: 'FK detail' }, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ error: 'Referenced record does not exist' })
  })

  it('uses the error status when provided', () => {
    const res = mockRes()

    errorHandler({ status: 404, message: 'Not found' }, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' })
  })

  it('falls back to 500 for unexpected errors', () => {
    const res = mockRes()

    errorHandler({ message: 'boom' }, {}, res, () => {})

    expect(res.status).toHaveBeenCalledWith(500)
  })
})
