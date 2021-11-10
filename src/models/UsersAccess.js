"use strict";

module.exports = (sequelize, DataTypes) => {
  const UsersAccess = sequelize.define(
    "UsersAccess",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      pageFlag: {
        type: DataTypes.BOOLEAN,
        field: "page_flag",
        defaultValue: false,
        allowNull: false,
      },
      can_view: {
        type: DataTypes.VIRTUAL,
      },
      can_view_own: {
        type: DataTypes.VIRTUAL,
      },
      can_edit: {
        type: DataTypes.VIRTUAL,
      },
      can_create: {
        type: DataTypes.VIRTUAL,
      },
      can_delete: {
        type: DataTypes.VIRTUAL,
      },
    },
    {
      tableName: "users_accesses",
    }
  );
  // If table model name is not the same as graphQl schema
  UsersAccess.gqlName = "Accesses";
  // Associations
  UsersAccess.associate = function (models) {
    models.UsersAccess.belongsToMany(models.UsersRole, {
      through: {
        model: models.UsersPrivilege,
        uniqueKey: "id",
      },
      as: "privileges",
      foreignKey: "access_id",
    });
  };
  return UsersAccess;
};
