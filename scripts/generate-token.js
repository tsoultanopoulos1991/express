require('dotenv').config()
const jwt = require('jsonwebtoken')

const userId = Number(process.argv[2] || 1)
const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })

const tokens = [
  { label: `User ${userId}`,       payload: { id: userId, role: 'user' } },
  { label: 'User 2',               payload: { id: 2,      role: 'user' } },
  { label: 'User 9999 (no record)',payload: { id: 9999,   role: 'user' } },
  { label: 'Admin',                payload: { id: 0,      role: 'admin' } },
]

const width = Math.max(...tokens.map((t) => t.label.length))

console.log('\n--- JWT Tokens ---')
tokens.forEach(({ label, payload }) => {
  console.log(`${label.padEnd(width)}  ${sign(payload)}`)
})
console.log('')
