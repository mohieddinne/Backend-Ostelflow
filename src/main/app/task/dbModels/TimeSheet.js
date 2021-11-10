'use strict'
module.exports = (sequelize, DataTypes) => {
  const TimeSheet = sequelize.define(
    'TimeSheet',
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
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'room_id',
        references: {
          model: 'Room',
          key: 'id',
        },
      },
      graTaskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'gra_task_id',
        references: {
          model: 'GraTask',
          key: 'id',
        },
      },
      maintainTaskId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'maintain_task_id',
        references: {
          model: 'MaintainTask',
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
      active: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      tableName: 'timesheets',
    },
  )
  TimeSheet.associate = function (models) {
    TimeSheet.belongsTo(models.GraTask, {
      foreignKey: 'gra_task_id',
      targetKey: 'id',
      as: 'task',
    })
    TimeSheet.belongsTo(models.MaintainTask, {
      foreignKey: 'maintain_task_id',
      targetKey: 'id',
      as: 'maintain_task',
    })
  }
  return TimeSheet
}
