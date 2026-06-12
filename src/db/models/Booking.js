const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Booking = sequelize.define(
    'Booking',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reference_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      travel_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      timestamps: false,
      tableName: 'bookings',
    }
  )

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, { foreignKey: 'user_id' })
    Booking.hasMany(models.BookingTicket, { foreignKey: 'booking_id', as: 'booking_tickets' })
  }

  return Booking
}
