require('dotenv').config()
const express = require('express')

const app = express()
app.use(express.json())

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = app
