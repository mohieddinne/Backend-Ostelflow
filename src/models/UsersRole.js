"use strict";

module.exports = (sequelize, DataTypes) => {
  const UsersRole = sequelize.define(
    "UsersRole",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
    },
    {
      tableName: "users_roles",
    }
  );
  // If table model name is not the same as graphQl schema
  UsersRole.gqlName = "Role";
  // Associations
  UsersRole.associate = function (models) {
    models.UsersRole.belongsToMany(models.UsersAccess, {
      through: {
        model: models.UsersPrivilege,
        foreignKey: "access_id",
      },
      foreignKey: "role_id",
      as: "accesses",
    });
  };
  return UsersRole;
};
