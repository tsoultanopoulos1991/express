const User = require('./models/User')
const Booking = require('./models/Booking')
const BookingTicket = require('./models/BookingTicket')
const ProductSupplier = require('./models/ProductSupplier')

const defineModels = (sequelize) => {
  const models = {
    User: User(sequelize),
    Booking: Booking(sequelize),
    BookingTicket: BookingTicket(sequelize),
    ProductSupplier: ProductSupplier(sequelize),
  }

  Object.values(models).forEach((model) => {
    if (model.associate) model.associate(models)
  })

  return models
}

module.exports = defineModels
