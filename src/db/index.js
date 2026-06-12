const { Sequelize } = require('sequelize')
const defineModels = require('./defineModels')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
)

const models = defineModels(sequelize)

module.exports = { sequelize, ...models }
