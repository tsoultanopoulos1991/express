module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL'
    )
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'ALTER TABLE bookings ALTER COLUMN user_id SET NOT NULL'
    )
  },
}
