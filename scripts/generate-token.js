require('dotenv').config()
const jwt = require('jsonwebtoken')

const userId = process.argv[2] || 1

const userToken = jwt.sign({ id: Number(userId), role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' })
const user2Token = jwt.sign({ id: 2, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' })
const nonExistentUserToken = jwt.sign({ id: 9999, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' })
const adminToken = jwt.sign({ id: 0, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })

console.log(`User ID:           ${userId}`)
console.log(`User token:        ${userToken}`)
console.log(`User 2 token:      ${user2Token}`)
console.log(`Non-existent user: ${nonExistentUserToken}`)
console.log(`Admin token:       ${adminToken}`)
