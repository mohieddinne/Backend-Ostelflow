"use strict";
module.exports = (sequelize, DataTypes) => {
  const Occupant = sequelize.define(
    "Occupant",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      category: {
        type: DataTypes.STRING,
        fiels: "age_categorie",
      },
      count: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "occupants",
    }
  );

  return Occupant;
};
