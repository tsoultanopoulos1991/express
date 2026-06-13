require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')
const { sequelize } = require('./db')

const app = express()
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'))
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', require('./routes'))

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use(require('./middleware/errorHandler'))

const PORT = process.env.PORT || 3000

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  server.on('error', (err) => {
    console.error('[startup] failed to start server:', err.message)
    process.exit(1)
  })
}

start().catch((err) => {
  console.error('[startup] failed to start server:', err.message)
  process.exit(1)
})

module.exports = app
