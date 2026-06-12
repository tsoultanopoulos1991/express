const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clio Muse Tours API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            reference_code: { type: 'string' },
            travel_date: { type: 'string', format: 'date' },
            deleted_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        BookingTicket: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            booking_id: { type: 'integer' },
            ticket_code: { type: 'string' },
            used_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/docs/*.js'],
}

module.exports = swaggerJsdoc(options)
