require('dotenv').config()
const express = require('express')
const { sequelize } = require('./db')

const app = express()
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000

const start = async () => {
  await sequelize.sync()
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start()

module.exports = app
