const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
    },
    {
      timestamps: false,
      tableName: 'users',
    }
  )

  User.associate = (models) => {
    User.hasMany(models.Booking, { foreignKey: 'user_id' })
  }

  return User
}
