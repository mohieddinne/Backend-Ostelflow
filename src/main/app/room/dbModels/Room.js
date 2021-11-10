'use strict'
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    'Room',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      floor: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      attendance: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      dnd: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      startAt: {
        type: DataTypes.DATE,
        field: 'start_reservation',
        allowNull: true,
      },

      expiresAt: {
        type: DataTypes.DATE,
        field: 'end_reservation',
        allowNull: true,
      },
    },
    {
      tableName: 'rooms',
    },
  )
  Room.associate = function (models) {
    Room.hasMany(models.Occupant, {
      as: 'occupants',
      foreignKey: 'room_id',
      targetKey: 'id',
    })

    Room.hasMany(models.GraTask, {
      as: 'graTasks',
      foreignKey: 'room_id',
      targetKey: 'id',
    })
    Room.hasMany(models.MaintainTask, {
      foreignKey: 'room_id',
      targetKey: 'id',
    })
    Room.hasMany(models.TimeSheet, {
      as: 'maintainTasks',
      foreignKey: 'room_id',
      targetKey: 'id',
    })
    Room.belongsTo(models.RoomType, {
      as: 'type',
      foreignKey: 'type_id',
      targetKey: 'id',
    })
  }
  return Room
}
