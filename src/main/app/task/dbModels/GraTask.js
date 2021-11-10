'use strict'
module.exports = (sequelize, DataTypes) => {
  const GraTask = sequelize.define(
    'GraTask',
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

      priority: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      createdBy: {
        field: 'created_by',
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
      },
      roomId: {
        type: DataTypes.INTEGER,
        // allowNull: true,
        field: 'room_id',
        references: {
          model: 'Room',
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'assigned_to',
        references: {
          model: 'User',
          key: 'id',
        },
      },
    },
    {
      tableName: 'gra_tasks',
    },
  )
  GraTask.associate = function (models) {
    GraTask.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      targetKey: 'id',
      as: 'user',
    })
    GraTask.hasMany(models.TimeSheet, {
      foreignKey: 'gra_task_id',
      targetKey: 'id',
      as: 'timesheets',
    })
    GraTask.belongsTo(models.Room, {
      foreignKey: 'room_id',
      targetKey: 'id',
      as: 'room',
    })
    GraTask.hasMany(models.GraTodoItems, {
      foreignKey: 'task_id',
      targetKey: 'id',
      as: 'todos',
    })
  }
  return GraTask
}
