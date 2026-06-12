const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const BookingTicket = sequelize.define(
    'BookingTicket',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id',
        },
      },
      ticket_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: false,
      tableName: 'booking_tickets',
    }
  )

  BookingTicket.associate = (models) => {
    BookingTicket.belongsTo(models.Booking, { foreignKey: 'booking_id' })
  }

  return BookingTicket
}
