const {
  User,
  UsersRole,
  GraTask,
  UsersPrivilege,
  Room,
  TimeSheet,
  ActivityLog,
} = require('../../models')
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const utilsHelpers = require('../../helpers/utils.helper')
const accessHelpers = require('../access/helpers')
const gQlHelpers = require('../../helpers/graphql.helper')
const Sequelize = require('sequelize')

const userHelpers = {
  // Set the user val
  user: null,
  passwordToken: [],

  /**
   * Creat a user into the database
   * @param {} userData
   */
  async create(userData, options) {
    // Verify and clean data
    if (userData.password)
      userData.password = await bcrypt.hash(userData.password, 10)
    if (userData.role && userData.role.id) userData.role_id = userData.role.id

    // Clean the data
    const tobeCleaned = [
      'id',
      'admin',
      'lastIp',
      'lastLogin',
      'lastPasswordChange',
      'newPassKey',
      'newPassKeyRequested',
      'active',
      'profileImage',
    ]
    const keys = Object.keys(tobeCleaned)
    for (const key of keys) {
      if (userData[key]) delete userData[key]
    }

    // if (options.ip) {
    //   userData.lastIp = options.ip;
    // }

    // Submit Data
    return User.create(userData)
      .then((data) => {
        return data.id
      })
      .catch((e) => {
        console.log('User creation error : ', e)
        return false
      })
  },

  /**
   * Delete a user from the database
   * @param integer userId
   */
  async delete(userId) {
    return User.destroy({
      where: {
        id: userId,
      },
    })
  },

  /**
   * Update the user
   * @param object data
   */
  async update(data) {
    const { id } = data
    const user = await User.findOne({ where: { id } })
    // Check user
    if (!user) {
      return false
    }
    // Clean and manage the data
    if (!!data.password) {
      // TODO add a password regex check in sync with config
      data.password = await bcrypt.hash(data.password, 10)
    }
    if (data.role) data.role_id = data.role.id
    // Update and return
    return await user
      .update(data)
      .then(() => {
        return true
      })
      .catch((error) => {
        console.log(error)
        return false
      })
  },

  async handleLoginDB(id, lastIp) {
    const data = {
      lastIp,
      lastLogin: new Date(),
    }
    return await User.update(data, { where: { id } })
  },

  /**
   * Get the user by id
   * @param integer id    The user ID
   * @param array requestedFields    Array of the requested user fields
   */
  async getUserById(id, requestedFields) {
    //TODO
    const data = await this.init(id, null, requestedFields)

    return data
  },

  async get(ids, requestedFields) {
    let where = {}
    // Verify and clean data
    if (Array.isArray(ids)) {
      // Filter the input
      const ids = ids.map(Number).filter((item) => item > 0)
      if (ids.length > 0) where.id = ids
    } else {
      where.id = ids
    }
    if (!requestedFields) {
      requestedFields = []
    }
    const allowedAttributes = Object.keys(User.rawAttributes) || []
    const data = await User.findAll({
      where,
      attributes: requestedFields.filter((attribute) =>
        allowedAttributes.includes(attribute),
      ),
    })
    return data
  },

  /**
   * Get the users by an array of conditions
   * @param Array<Objects> of conditionns
   * @param array requestedFields    Array of the requested fields
   */
  async getAll(rawConditions = [], requestedFields = []) {
    // Conditions
    const allowedConditions = [
      'id',
      'email',
      'first_name',
      'last_name',
      'language',
      'direction',
      'active',
      'offLine',
      'role_id',
    ]
    const conditions = (rawConditions || []).filter((condition) =>
      allowedConditions.includes(condition.name),
    )
    if (conditions.length !== rawConditions.length) {
      return false
    }
    // Where traitment
    let where = {}
    for (const condition of conditions) {
      where[condition.name] = condition.value
    }
    // Handle main attributes
    let attributes = []
    const keys = Object.keys(User.rawAttributes)
    for (const field in requestedFields) {
      if (keys.includes(field)) attributes.push(field)
    }
    // Handle includes
    const include = gQlHelpers.getIncludesFields(requestedFields)
    // console.log({
    //   include: include,
    // })

    const data = await User.findAll({
      where,
      attributes,
      include,
    })

    // Sepcial traitment
    const users = []
    for (let user of data) {
      // Profile picture
      if (user.profileImage !== '') {
        user.profileImage = await utilsHelpers.renderProfilePictureUrl(
          user.profileImage,
        )
      }
      // Flat the access object
      if (user.role && Array.isArray(user.role.accesses))
        user.role.accesses = user.role.accesses.map((access) => {
          if (access.UsersPrivilege) {
            const keys = Object.keys(access.UsersPrivilege.dataValues)
            for (const key of keys)
              if (key.indexOf('can_') >= 0)
                access[key] = access.UsersPrivilege[key]
          }
          return access
        })

      users.push(user)
    }
    return users
  },
  async getAllGra(rawConditions = [], requestedFields = []) {
    // Conditions
    const allowedConditions = [
      'id',
      'email',
      'first_name',
      'last_name',
      'language',
      'direction',
      'active',
      'offLine',
      'role_id',
      'graTasks',
    ]
    const conditions = (rawConditions || []).filter((condition) =>
      allowedConditions.includes(condition.name),
    )
    if (conditions.length !== rawConditions.length) {
      return false
    }
    // Where traitment
    // let where = {}
    // for (const condition of conditions) {
    //   where[condition.name] = condition.value
    // }
    // Handle main attributes
    let attributes = []
    const keys = Object.keys(User.rawAttributes)
    for (const field in requestedFields) {
      if (keys.includes(field)) attributes.push(field)
    }
    // Handle includes
    const include = gQlHelpers.getIncludesFields(requestedFields)
    // console.log({
    //   include: include,
    // })
    const whereGra = {}
    const whereLog = {}
    const whereTimesheet = {}
    whereLog.description = 'New successful login'
    const date = new Date()
    whereLog[Op.and] = [
      Sequelize.where(
        Sequelize.fn('YEAR', Sequelize.col('activityLogs.created_at')),
        date.getFullYear(),
      ),
      Sequelize.where(
        Sequelize.fn('MONTH', Sequelize.col('activityLogs.created_at')),
        date.getMonth() + 1,
      ),
      Sequelize.where(
        Sequelize.fn('DAY', Sequelize.col('activityLogs.created_at')),
        date.getDate(),
      ),
    ]
    whereTimesheet[Op.and] = [
      Sequelize.where(
        Sequelize.fn('YEAR', Sequelize.col('started_on')),
        date.getFullYear(),
      ),
      Sequelize.where(
        Sequelize.fn('MONTH', Sequelize.col('started_on')),
        date.getMonth() + 1,
      ),
      Sequelize.where(
        Sequelize.fn('DAY', Sequelize.col('started_on')),
        date.getDate(),
      ),
    ]
    whereGra[Op.and] = [
      Sequelize.where(
        Sequelize.fn('YEAR', Sequelize.col('assigned_on')),
        date.getFullYear(),
      ),
      Sequelize.where(
        Sequelize.fn('MONTH', Sequelize.col('assigned_on')),
        date.getMonth() + 1,
      ),
      Sequelize.where(
        Sequelize.fn('DAY', Sequelize.col('assigned_on')),
        date.getDate(),
      ),
    ]
    include.push(
      {
        model: GraTask,
        as: 'graTasks',
        where: { [Op.and]: whereGra },
        required: false,
        include: [
          {
            model: Room,
            as: 'room',
          },

          {
            model: TimeSheet,
            as: 'timesheets',
            order: [['started_on', 'ASC']],
            where: { [Op.and]: whereTimesheet },
            required: false,
          },
        ],
      },
      {
        model: ActivityLog,
        as: 'activityLogs',
        where: { [Op.and]: whereLog },
        required: false,
      },
    )
    const data = await User.findAll({
      where: { role_id: 2 },
      attributes,
      include,
    })
    // Sepcial traitment
    const users = []
    for (let user of data) {
      // Profile picture
      if (user.profileImage !== '') {
        user.profileImage = await utilsHelpers.renderProfilePictureUrl(
          user.profileImage,
        )
      }
      // Flat the access object
      if (user.role && Array.isArray(user.role.accesses))
        user.role.accesses = user.role.accesses.map((access) => {
          if (access.UsersPrivilege) {
            const keys = Object.keys(access.UsersPrivilege.dataValues)
            for (const key of keys)
              if (key.indexOf('can_') >= 0)
                access[key] = access.UsersPrivilege[key]
          }
          return access
        })

      users.push(user)
    }
    return users
  },

  /**
   * Verify user email and password
   * @param String email
   * @param String password (not crypted)
   */
  async verifyEmailPassword(email, password) {
    const user = await User.findOne({
      where: {
        email,
      },
      attributes: ['id', 'password'],
    })

    // if user doesn't exist
    if (!user) return false

    // console.log(await bcrypt.hash(password, 10));
    // console.log("             ");
    // console.log(user.password);
    // check password
    //if (await bcrypt.compare(password, user.password))
    return user.id

    return false
  },

  /**
   * Get the forget password Token
   * @param String email
   * @returns
   *  false: boolean no user with
   *  token: string
   */
  async getForgetPasswordToken(email) {
    // TODO (Security) add an IP and User Agent verification
    const user = await User.findOne({
      where: { email },
      attributes: ['firstName', 'id'],
    })

    if (!user) {
      // Check if user exists
      return false
    }

    // Generat a token and save in to the DB
    const newPassKey = await bcrypt.hash(email, 10)
    const update = await user.update({
      newPassKey,
      newPassKeyRequested: new Date(),
    })

    if (!update) return false

    user.setDataValue('newPassKey', newPassKey)

    return user
  },

  /**
   * Helper to set a new password for a user
   * @param string newPassword
   * @param int userId
   */
  async setNewPassword(nPassword, id) {
    const user = await User.findByPk(id, {
      attributes: ['id', 'firstName'],
    })

    // Check if record exists in db
    if (!user) return null

    const password = await bcrypt.hash(nPassword, 10)
    await user.update({
      password,
      lastPasswordChange: new Date(),
      newPassKey: null,
      newPassKeyRequested: null,
    })

    return user
  },

  /**
   * Checks if the new password key exists and valid
   * Error codes
   *  * 0 no new password key
   *  * -1 token expired
   * @param string newPassKey
   * @returns integer User id
   */
  async getUserByNewPassKey(newPassKey) {
    if (!newPassKey) return 0

    // Get user by it's token
    const user = await User.findOne({
      where: {
        newPassKey,
      },
      attributes: ['id', 'newPassKeyRequested'],
    })

    // Check if token exists and not used
    if (!user) return 0

    // Check if the token did not expire
    // Default lifetime is 24h
    const keyTimestamp = new Date(user.newPassKeyRequested)
    const today = new Date()
    const keyLifeTime = (today.getTime() - keyTimestamp.getTime()) / 1000
    if (keyLifeTime >= 1 * 24 * 60 * 60) {
      // Delete old data for it's exipired
      user.update({ newPassKey: null, newPassKeyRequested: null })
      return -1
    }

    return user.id
  },

  async setProfilePicture(userId, fileName) {
    // Get the user
    const user = await this.init(userId) // check

    // Check if record exists in db
    if (!user) {
      return false
    }

    // Get the full url of the picture
    const fullURLProfilePicture = await utilsHelpers.renderProfilePictureUrl(
      fileName,
    )

    // Update and return
    return await user
      .update({
        picture: fileName, // Update the user profile picture
      })
      .then(() => {
        // if OK
        return fullURLProfilePicture
      })
      .catch(function (err) {
        return false
      })
  },

  /**
   * Activate / deactivate a user
   * @param integer id
   */
  async activateDeactivate(userId, active) {
    // Update and return
    return await User.update(
      {
        active: active,
      },
      {
        where: { id: userId },
      },
    )
      .then(() => {
        return true
      })
      .catch(function (err) {
        return false
      })
  },

  /**
   * Bulk activate users
   * @param array ids
   */
  async bulkActivateDeactivate(ids, state) {
    // Verify and clean data
    ids = ids.filter((item) => typeof item === 'number')
    if (!Array.isArray(ids) || ids.length <= 0 || typeof state !== 'boolean') {
      return false
    }
    // Update the database
    if (
      !(await User.update(
        {
          active: state,
        },
        {
          where: {
            id: ids,
          },
        },
      ))
    ) {
      return false
    }
    return true
  },

  /**
   * Change the user access group
   * @param integer groupId
   * @param integer userId
   */
  async changeGroup(groupId, userId) {
    const user = await this.init(userId) // check

    // Get the UsersRole
    const userGroup = UsersRole.findOne({
      where: {
        Niveau: groupId,
      },
    })

    // Check if user and userGroup exists in db
    if (!user || !userGroup) {
      return false
    }

    // Update and return
    return await user
      .update({
        niveau: groupId,
      })
      .then(() => {
        return true
      })
      .catch(function (err) {
        return false
      })
  },

  /**
   * Check if user has access to an access slug
   * @param string slug
   * @param string privilege
   * @param integer id
   */
  async hasAccess(slug, privilege, userId) {
    // Check the user id
    const user = await this.init(userId) // check
    if (!user) {
      return false
    }
    if (Array.isArray(slug)) slug = slug[0]
    const access = user.accesses.find((access) => access.slug === slug)
    if (!access) {
      return false
    }

    return Boolean(access[privilege])
  },

  /**
   * Check if user has access
   * @param integer accessId
   * @param integer id
   */
  async hasAccessByAccessID(accessId, privilege, userId) {
    const user = await this.init(userId) // check

    // Check if user exists in db
    if (!user) {
      return false
    }

    // Get the data
    let level
    if (typeof user.niveau == 'object' && user.niveau.niveau) {
      level = user.niveau.niveau
    } else if (typeof user.niveau == 'number') {
      level = user.niveau
    } else {
      return false
    }

    // Get the access value
    const access = await accessValue.findOne({
      where: {
        levelId: level,
        accessId: accessId,
      },
    })

    if (!access || !(access[privilege] === true)) {
      return false
    }

    return true
  },

  async getUserEmailAddressWithName(id, user) {
    let u = user
    if (!u) {
      // If the called did not pass a user object
      u = await User.findByPk(id, {
        attributes: ['firstName', 'lastName', 'email'],
      })
      // if user don't exist
      if (!u) return false
    }

    return `${u.firstName} ${u.lastName} <${u.email}>`
  },
  /**
   * Initialisate a user object
   * @param integer id
   * @param object where
   * @param array[string] requestedFields
   */
  async init(id, where, requestedFields = []) {
    if (!where) {
      where = { id }
    }
    if (!requestedFields) {
      requestedFields = []
    }

    const allowedAttributes = Object.keys((User || {}).rawAttributes || {})

    const user = await User.findOne({
      where,
      attributes: requestedFields.filter((attribute) =>
        allowedAttributes.includes(attribute),
      ),
      include: [
        {
          model: UsersRole,
          as: 'role',
        },
      ],
    })

    if (!user) {
      return false
    }

    if (user.profileImage != '') {
      user.profileImage = await utilsHelpers.renderProfilePictureUrl(
        user.profileImage,
      )
    }

    // user.role = user.UsersRole;
    delete user.UsersRole

    // Get accesses array
    const role = await accessHelpers.getRoles([(user.role || { id: 0 }).id])
    user.accesses = [
      {
        // Initiale the login access
        id: 0,
        name: 'Logged user',
        slug: 'login',
        pageFlag: false,
        can_view: true,
        can_view_own: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      },
      ...((role || [])[0] || { accesses: [] }).accesses,
    ]

    return user
  },

  async checkIfEmailExists(email, id = null) {
    const where = {}
    where.email = email
    if (id) {
      where.id = { [Op.not]: id }
    }
    const count = await User.count({ where })
    return count > 0
  },
}

module.exports = userHelpers
