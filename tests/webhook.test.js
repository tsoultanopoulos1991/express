// Integration tests for the webhook HTTP layer (validator → controller → errorHandler).
// Redis is stubbed (the validator imports SLOT_STARTS from availabilityService) and the
// service is mocked, so no real DB/Redis is touched.
jest.mock('../src/redis', () => ({}))
jest.mock('../src/services/webhookService', () => ({ handleCreated: jest.fn() }))

const express = require('express')
const request = require('supertest')
const webhookRoutes = require('../src/routes/webhook')
const errorHandler = require('../src/middleware/errorHandler')
const { handleCreated } = require('../src/services/webhookService')

const app = express()
app.use(express.json())
app.use('/api/v1/webhook', webhookRoutes)
app.use(errorHandler)

const today = new Date().toISOString().split('T')[0]

const validPayload = {
  event_id: 'evt-1',
  event: 'created',
  supplier_id: 1,
  supplier_product_code: 'PROD-EXT-001',
  booking: { reference_code: 'REF-1', travel_date: today, slot_start: '09:00' },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/v1/webhook', () => {
  it('processes a valid created event and returns 201', async () => {
    handleCreated.mockResolvedValue({ id: 5 })

    const res = await request(app).post('/api/v1/webhook').send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body).toEqual({ message: 'Booking created', booking_id: 5 })
  })

  it('acknowledges unknown event types with 200 without processing them', async () => {
    const res = await request(app).post('/api/v1/webhook').send({
      event_id: 'evt-2',
      event: 'cancelled',
      supplier_id: 1,
      supplier_product_code: 'PROD-EXT-001',
    })

    expect(res.status).toBe(200)
    expect(handleCreated).not.toHaveBeenCalled()
  })

  it('rejects a malformed payload (missing booking fields) with 400', async () => {
    const res = await request(app).post('/api/v1/webhook').send({
      event_id: 'evt-3',
      event: 'created',
      supplier_id: 1,
      supplier_product_code: 'PROD-EXT-001',
      // booking omitted
    })

    expect(res.status).toBe(400)
    expect(handleCreated).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON with 400', async () => {
    const res = await request(app)
      .post('/api/v1/webhook')
      .set('Content-Type', 'application/json')
      .send('{ "event": "created" ') // malformed JSON

    expect(res.status).toBe(400)
    expect(handleCreated).not.toHaveBeenCalled()
  })
})
