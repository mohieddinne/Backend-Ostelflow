'use strict'
module.exports = (sequelize, DataTypes) => {
  const Break = sequelize.define(
    'Break',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'User',
          key: 'id',
        },
      },
      startedOn: {
        type: DataTypes.DATE,
        field: 'started_on',
      },
      endedOn: {
        type: DataTypes.DATE,
        field: 'ended_on',
      },
    },
    {
      tableName: 'break',
    },
  )
  return Break
}
