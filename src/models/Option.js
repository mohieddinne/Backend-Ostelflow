"use strict";

module.exports = (sequelize, DataTypes) => {
  const Option = sequelize.define(
    "Option",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      value: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "options",
    }
  );
  return Option;
};
