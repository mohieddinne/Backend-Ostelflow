"use strict";

module.exports = (sequelize, DataTypes) => {
  const UsersPrivilege = sequelize.define(
    "UsersPrivilege",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "UsersRole",
          key: "id",
        },
      },
      access_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "UsersAccess",
          key: "id",
        },
      },
      pageFlag: {
        type: DataTypes.BOOLEAN,
        field: "page_flag",
        defaultValue: false,
      },
      can_view: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_view_own: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_edit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "users_privileges",
    }
  );

  return UsersPrivilege;
};
