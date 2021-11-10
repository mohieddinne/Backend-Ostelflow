'use strict'
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
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
      // the action type
      activityType: {
        field: 'activity_type',
        type: DataTypes.STRING,
      },
      // contain the record that the action related to
      sourceId: {
        field: 'source_id',
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      parentId: {
        field: 'parent_id',
        type: DataTypes.INTEGER(11).UNSIGNED,
      },
      description: {
        type: DataTypes.STRING,
      },
      disabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      seen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'notifications',
    },
  )
  Notification.associate = function (models) {
    Notification.hasMany(models.Subscriber, {
      foreignKey: 'notification_id',
      targetKey: 'id',
    })
  }
  return Notification
}
