'use strict'
module.exports = (sequelize, DataTypes) => {
  const TodoTemplate = sequelize.define(
    'TodoTemplate',
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

      blob: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: 'todo_template',
    },
  )

  return TodoTemplate
}
