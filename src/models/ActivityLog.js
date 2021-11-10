'use strict'

module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    'ActivityLog',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        field: 'user_id',
        type: DataTypes.INTEGER(11).UNSIGNED,
        allowNull: true,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      userName: {
        field: 'user_name',
        type: DataTypes.STRING,
        allowNull: true,
      },
      userEmail: {
        field: 'user_email',
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'activity_log',
    },
  )
  ActivityLog.associate = function (models) {
    ActivityLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author',
    })
  }
  return ActivityLog
}
