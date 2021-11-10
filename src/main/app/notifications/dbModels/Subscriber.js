'use strict'
module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define(
    'Subscriber',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      // the user who create the action (author_id)
      userId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
      notificationId: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: false,
        field: 'notification_id',
        references: {
          model: 'Notification',
          key: 'id',
        },
      },
    },
    {
      tableName: 'subscribers',
    },
  )

  return Subscriber
}
