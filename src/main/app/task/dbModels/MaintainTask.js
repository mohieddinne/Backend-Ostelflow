'use strict'
module.exports = (sequelize, DataTypes) => {
  const MaintainTask = sequelize.define(
    'MaintainTask',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      assignedOn: {
        type: DataTypes.DATE,
        field: 'assigned_on',
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      priority: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      problem: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
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
    },
    {
      tableName: 'maintenance_tasks',
    },
  )
  MaintainTask.associate = function (models) {
    MaintainTask.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      targetKey: 'id',
      as: 'user',
    })
    MaintainTask.belongsTo(models.Room, {
      foreignKey: 'room_id',
      targetKey: 'id',
      as: 'room',
    })
    MaintainTask.hasMany(models.TimeSheet, {
      foreignKey: 'maintain_task_id',
      targetKey: 'id',
      as: 'timesheets',
    })
  }

  return MaintainTask
}
