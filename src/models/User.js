'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER(11).UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      email: DataTypes.STRING,
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
      },
      password: DataTypes.STRING,
      profileImage: {
        type: DataTypes.STRING,
        field: 'profile_image',
      },
      language: {
        type: DataTypes.STRING(8),
        defaultValue: 'fr-CA',
        allowNull: true,
      },
      direction: {
        type: DataTypes.STRING(3),
        defaultValue: null,
        allowNull: true,
      },
      admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      offLine: {
        field: 'off_line',
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        field: 'role_id',
      },
      lastIp: {
        type: DataTypes.STRING(128),
        field: 'last_ip',
      },
      lastLogin: {
        type: DataTypes.DATE,
        field: 'last_login',
      },
      lastPasswordChange: {
        type: DataTypes.DATE,
        field: 'last_password_change',
      },
      newPassKey: {
        type: DataTypes.STRING,
        field: 'new_pass_key',
      },
      newPassKeyRequested: {
        type: DataTypes.DATE,
        field: 'new_pass_key_requested',
      },
      phoneNumber: {
        field: 'phone_number',
        type: DataTypes.INTEGER(8),
      },
    },
    {
      tableName: 'users',
    },
  )
  User.associate = function (models) {
    User.belongsTo(models.UsersRole, {
      as: 'role',
      foreignKey: 'role_id',
      targetKey: 'id',
    })
    User.hasMany(models.TimeSheet, {
      foreignKey: 'user_id',
      targetKey: 'id',
    })
    User.hasMany(models.GraTodoItems, {
      foreignKey: 'checked_by',
      targetKey: 'id',
    })

    User.hasMany(models.Break, {
      foreignKey: 'user_id',
      targetKey: 'id',
    })
    User.hasMany(models.GraTask, {
      foreignKey: 'assigned_to',
      targetKey: 'id',
      as: 'graTasks',
    })
    User.hasMany(models.ActivityLog, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'activityLogs',
    })
  }

  return User
}
