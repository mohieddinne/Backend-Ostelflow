"use strict";
module.exports = (sequelize, DataTypes) => {
  const RoomType = sequelize.define(
    "RoomType",
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      value: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "room_types",
    }
  );
  RoomType.associate = function (models) {
    RoomType.hasMany(models.Room, {
      foreignKey: "type_id",
      targetKey: "id",
    });
  };
  return RoomType;
};
