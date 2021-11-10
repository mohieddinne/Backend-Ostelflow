'use strict'
module.exports = (sequelize, DataTypes) => {
  const GraTodoItems = sequelize.define(
    'GraTodoItems',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
      },
      icon: {
        type: DataTypes.STRING,
      },
      taskId: {
        type: DataTypes.INTEGER,
        field: 'task_id',
        references: {
          model: 'GraTask',
          key: 'id',
        },
      },

      checkedOn: {
        type: DataTypes.DATE,
        field: 'checked_on',
      },
      checkedBy: {
        type: DataTypes.INTEGER,
        field: 'checked_by',
        references: {
          model: 'User',
          key: 'id',
        },
      },
    },
    {
      tableName: 'Gra_todo_items',
    },
  )
  GraTodoItems.associate = function (models) {
    GraTodoItems.belongsTo(models.User, {
      foreignKey: 'checked_by',
      targetKey: 'id',
      as: 'user',
    })
    GraTodoItems.belongsTo(models.GraTask, {
      foreignKey: 'task_id',
      targetKey: 'id',
      as: 'tasks',
    })
  }
  GraTodoItems.sync()
  return GraTodoItems
}
