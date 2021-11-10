const { ApolloError } = require('apollo-server-express')
const { ApolloServer } = require('apollo-server-express')
const jsonwebtoken = require('jsonwebtoken')
const utlsHlprs = require('../../helpers/utils.helper')
const mailHelper = require('../../helpers/email.helper')
const i18nHelper = require('../../helpers/i18n.helper')
const { requestedFields } = require('../../helpers/graphql.helper')
const userHelpers = require('./helpers')
const graphqlFields = require('graphql-fields')
const { signIn, signUp } = require('../../validators/user')
const { createActivityLog } = require('../core/activity-logs/helpers')
const { config } = require('winston')
const { checkEmailValid } = require('../../helpers/utils.helper')
const { User } = require('../../models')

const resolvers = {
  Upload: ApolloServer.GraphQLUpload,

  Query: {
    // fetch the profile of currently authenticated user
    async me(_, args, { user, ip }, information) {
      // Get the user
      const requestedAttr = requestedFields(information)
      const attributes = {
        id: null,
        active: null,
        ...(requestedAttr.user || {}),
      }
      const users = await userHelpers.getAll(
        [{ name: 'id', value: user.id }],
        attributes,
      )
      const loggedUser = users[0]

      if (!loggedUser) {
        const error = user ? 'NOT_AUTHENTICATED' : 'BAD_USER_PASSWORD'
        throw new ApolloError(i18nHelper.__(error), error)
      }

      // Get the user if active
      if (!loggedUser.active) {
        const error = 'USER_DEACTIVATED'
        throw new ApolloError(i18nHelper.__(error), error)
      }

      userHelpers.handleLoginDB(loggedUser.id, ip)

      return loggedUser
    },

    async getUserById(_, args, { user }, info) {
      // make sure user is logged in
      if (!user) {
        const error = 'NOT_AUTHENTICATED'
        throw new ApolloError(i18nHelper.__(error), error)
      }

      // Autorisation
      const access = await userHelpers.hasAccess('users', 'can_view', user.id)
      if (!access) {
        throw new ApolloError(i18nHelper.__('GRANT_ERROR'), 'GRANT_ERROR')
      }

      // Get user the returns it
      const requestedFiels = Object.keys(graphqlFields(info) || {} || {})
      const data = await userHelpers.getUserById(args.id, requestedFiels)

      return data
    },

    // Get users by ids
    async users(_, { conditions }, { user }, information) {
      // make sure user is logged in
      if (!user) {
        const error = 'NOT_AUTHENTICATED'
        throw new ApolloError(i18nHelper.__(error), error)
      }

      // Autorisation
      const access = await userHelpers.hasAccess('users', 'can_view', user.id)
      if (!access) {
        throw new ApolloError(i18nHelper.__('GRANT_ERROR'), 'GRANT_ERROR')
      }

      // Get user the returns it
      const attributes = requestedFields(information)
      return await userHelpers.getAll(conditions, attributes)
    },
    async GraUsers(_, { conditions }, { user }, information) {
      // make sure user is logged in

      // Get user the returns it
      const attributes = requestedFields(information)
      return await userHelpers.getAllGra(conditions, attributes)
    },
  },

  Mutation: {
    /**
     * Sign-up a user
     * @author Mohamed Kharrat - Tekru Technologies
     * @param {*} _
     * @param {*} args
     */
    async signup(_, { data }, { ip }) {
      // Check for bad request
      const keys = Object.keys(data)
      const unallowedAttrbs = ['id', 'role', 'active', 'admin']
      const badRequest = !!keys.find((key) => unallowedAttrbs.includes(key))
      if (badRequest) {
        createActivityLog(
          `Someone trying to create an account with this email(${data.email}) but he encountered problems `,
        )
        throw new ApolloError('BAD_REQUEST')
      }

      // Data validation
      await signUp.validateAsync(data, { abortEarly: false })

      // Check for email
      const users = await userHelpers.getAll(
        [{ name: 'email', value: data.email }],
        { id: null },
      )

      if (users.length > 0) {
        createActivityLog(
          `An existing user (${data.email}) trying to create an account `,
        )
        throw new ApolloError('EMAIL_EXISTS')
      }

      // Store data
      const uID = await userHelpers.create(data, { ip })
      if (!uID) {
        createActivityLog(
          `Somthing wrong when trying to save: (${data.email}) `,
        )
        throw new ApolloError('server_error', 'error_creating_user')
      }

      // Verify email server
      const mailTransporter = await mailHelper.createTransport()
      const verify = await mailTransporter.verify()
      if (!verify) {
        createActivityLog(`Invalid email : (${data.email}) `)
        throw new ApolloError('MAIL_SERVER_ERROR')
      }

      // Get data
      const [from, userSubject, adminSubject, adminEmail] = await Promise.all([
        mailHelper.getNoReplyEmail(),
        mailHelper.renderEmailSubject('user_signup_request_subject'),
        mailHelper.renderEmailSubject('admin_user_signup_request_subject'),
        utlsHlprs.getOption('admin_email'),
      ])
      const userEmailTo = `${data.firstName} ${data.lastName} <${data.email}>`

      // Notify user
      const userOptions = {
        from,
        to: userEmailTo,
        subject: userSubject,
        template: 'user_signup_request',
        context: {
          name: data.firstName,
        },
      }
      const adminOptions = {
        from,
        to: adminEmail,
        subject: adminSubject,
        template: 'user_signup_request_admin',
        context: { ...data, adminLink: 'http://' },
      }

      const sendMail = async (options) => {
        try {
          const info = await mailTransporter.sendMail(options)
          const nodemailer = require('nodemailer')
          console.log({
            ...info,
            url: 'Preview URL: ' + nodemailer.getTestMessageUrl(info),
          })
          return true
        } catch (error) {
          console.log({ error })
        }
      }
      createActivityLog(`Trying to send  email to: (${data.email}) `)
      const validEmail = await Promise.all([
        sendMail(userOptions),
        // sendMail(adminOptions),
      ])
      if (validEmail.length > 0) {
        createActivityLog(`Email successfully sended to  : (${data.email}) `)
        const defaultRole = await userHelpers.defaultRoleId(uID) // role user
        if (!defaultRole) {
          logger.info(
            'Create  the default  Role Utilisateur in tbl users_roles.user still unable until You do it',
          )
          return true
        }
        await userHelpers.activateDeactivate(uID, true)
        return true
      }
      return false
    },

    /**
     * Login function
     * Uses token or Email and Password
     * @author Mohamed Kharrat - Tekru Technologies
     * @param {*} _
     * @param {*} args Function arguments
     * @param {*} param2
     */
    async login(_, { email, password }, { user, ip }, information) {
      const requestedAttr = requestedFields(information)

      // Get the user ID
      let uID = null
      if (!user) {
        uID = await userHelpers.verifyEmailPassword(email, password)
      } else if (user && user.id) {
        uID = user.id
      }
      if (!uID) {
        createActivityLog(`Failed login attempt (login: ${email})`)
        const error = user ? 'NOT_AUTHENTICATED' : 'BAD_USER_PASSWORD'
        throw new ApolloError(error, error)
      }

      // Get the user
      const attributes = {
        id: null,
        active: null,
        ...(requestedAttr.user || {}),
      }

      const users = await userHelpers.getAll(
        [{ name: 'id', value: uID }],
        attributes,
      )

      const loggedUser = users[0]
      loggedUser.update(
        { ...loggedUser, offLine: false },
        { where: { id: loggedUser.id } },
      )
      if (!loggedUser) {
        createActivityLog(`Failed login attempt (login: ${email})`)
        const error = user ? 'NOT_AUTHENTICATED' : 'BAD_USER_PASSWORD'
        throw new ApolloError(i18nHelper.__(error), error)
      }

      // Get the user if active
      if (!loggedUser.active) {
        createActivityLog(`Disabled user (login: ${email}) tries to connect`)
        const error = 'USER_DEACTIVATED'
        throw new ApolloError(i18nHelper.__(error), error)
      }
      // Generate the Json Web Token
      const token = jsonwebtoken.sign(
        {
          id: loggedUser.id,
          email: loggedUser.email,
        },
        global.config.jwt_secret,
        {
          expiresIn: global.config.sessionDuration,
        },
      )

      // Save user login data
      userHelpers.handleLoginDB(loggedUser.id, ip)
      createActivityLog(`New successful login`, loggedUser)
      return {
        token,
        user: loggedUser,
      }
    },

    /**
     * Logout user
     * @author Bilel - Tekru Technologies
     */
    async logout(root, args, { user }, info) {
      // Set user off Line
      const connected = await User.findOne({ where: { id: user.id } })
      if (!connected) return false
      const offLine = await connected.update(
        { ...connected, offLine: true },
        { where: { id: user.id } },
      )
      return offLine ? true : false
    },

    async user(_, { data, operation }, { user }) {
      // Autorisation
      let privilege = ''
      if (operation && operation === 'delete') {
        privilege = 'can_delete'
      } else if (data.id) {
        privilege = 'can_edit'
        operation = 'update'
      } else {
        privilege = 'can_create'
        operation = 'create'
      }
      let handling = false,
        checkIfEmailExists
      switch (operation) {
        case 'delete':
          handling = await userHelpers.delete(data.id)
          break
        case 'create':
          const validEmail = checkEmailValid(data.email)
          if (!validEmail) {
            throw new ApolloError(
              i18nHelper.__('INPUT_ERROR'),
              'EMAIL_FORM_INVALID',
            )
          }
          checkIfEmailExists = await userHelpers.checkIfEmailExists(data.email)
          if (checkIfEmailExists) {
            throw new ApolloError(
              i18nHelper.__('INPUT_ERROR'),
              'EMAIL_ALREADY_IN_USE',
            )
          }
          delete data.id
          handling = await userHelpers.create(data)
          break
        case 'update':
          if (data.email) {
            const validEmail = checkEmailValid(data.email)
            if (!validEmail) {
              throw new ApolloError(
                i18nHelper.__('INPUT_ERROR'),
                'EMAIL_FORM_INVALID',
              )
            }
            checkIfEmailExists = await userHelpers.checkIfEmailExists(
              data.email,
              data.id,
            )
            if (checkIfEmailExists) {
              throw new ApolloError(
                i18nHelper.__('INPUT_ERROR'),
                'EMAIL_ALREADY_IN_USE',
              )
            }
          }
          handling = await userHelpers.update(data)
          break
        default:
          break
      }
      return handling
    },

    // Forget the password handler
    async forgetPassword(_, { email }) {
      // Verify email server
      const mailTransporter = await mailHelper.createTransport()
      if (!(await mailTransporter.verify())) {
        throw new ApolloError(
          i18nHelper.__('MAIL_SERVER_ERROR'),
          'MAIL_SERVER_ERROR',
        )
      }

      // TODO (Security) add an IP and User Agent verification
      const user = await userHelpers.getForgetPasswordToken(email)

      if (!user) {
        // Check if user exists
        throw new ApolloError(i18nHelper.__('NO_USER_FOUND'), 'NO_USER_FOUND')
      }
      createActivityLog('Forget password request', user)

      const resetlink = utlsHlprs.fromUrl(
        'auth/reset-password/' + user.newPassKey,
      )

      return await Promise.all([
        mailHelper.getNoReplyEmail(),
        userHelpers.getUserEmailAddressWithName(user.id),
        mailHelper.renderEmailSubject('PWD_FORGET_SUBJECT'),
      ])
        .then(async (values) => {
          const [from, to, subject] = values
          // Get the email node modules
          const options = {
            from,
            to,
            subject,
            template: 'forgetpassword',
            context: {
              name: user.firstName,
              resetlink,
            },
          }
          try {
            const info = await mailTransporter.sendMail(options)
            const nodemailer = require('nodemailer')
            console.log({
              ...info,
              url: 'Preview URL: ' + nodemailer.getTestMessageUrl(info),
            })
            return true
          } catch (error) {
            console.log({ error })
            throw new ApolloError('SERVER_ERROR')
          }
        })
        .catch((error) => {
          console.log({ error })
          throw new ApolloError('SERVER_ERROR')
        })
    },

    async resetPassword(_, { token, newpassword }) {
      // Check if token exists and not used
      const uID = await userHelpers.getUserByNewPassKey(token)
      if (uID <= 0) {
        const error = uID === -1 ? 'token_expired' : 'token_error'
        throw new ApolloError(error)
      }

      // Update the password
      const user = await userHelpers.setNewPassword(newpassword, uID)
      if (!user) throw new ApolloError('SERVER_ERROR')
      createActivityLog('reset password request', user)

      // Get mail transport
      const mailTransporter = await mailHelper.createTransport()
      const mailVerification = await mailTransporter.verify()
      if (!mailVerification) throw new ApolloError('MAIL_SERVER_ERROR')

      return await Promise.all([
        mailHelper.getNoReplyEmail(),
        userHelpers.getUserEmailAddressWithName(user.id),
        mailHelper.renderEmailSubject('PWD_RESTED_SUBJECT'),
      ])
        .then(async (values) => {
          const [from, to, subject] = values
          // Get the email node modules
          const options = {
            from,
            to,
            subject,
            template: 'resetpassword',
            context: {
              name: user.firstName,
            },
          }
          try {
            const info = await mailTransporter.sendMail(options)
            const nodemailer = require('nodemailer')
            console.log({
              ...info,
              url: 'Preview URL: ' + nodemailer.getTestMessageUrl(info),
            })
            return true
          } catch (error) {
            console.log({ error })
            throw new ApolloError('MAIL_SERVER_ERROR')
          }
        })
        .catch((error) => {
          console.log({ error })
          throw new ApolloError('MAIL_SERVER_ERROR')
        })
    },

    /**
     * Change the user password
     * @param oldpassword String
     * @param newpassword String
     * @param newpassword2 String
     */
    async updateMyPassword(
      _,
      { oldpassword, newpassword, newpassword2 },
      { user },
    ) {
      // Make sure user is logged in
      if (!user) {
        throw new ApolloError(
          i18nHelper.__('NOT_AUTHENTICATED'),
          'NOT_AUTHENTICATED',
        )
      }

      // Check if the two passwords are the same
      if (
        newpassword == '' ||
        newpassword != newpassword2 ||
        newpassword == oldpassword
      ) {
        throw new ApolloError(
          i18nHelper.__('PASSWORDS_NOT_OK'),
          'PASSWORDS_NOT_OK',
        )
      }

      // Get the employee by the token email
      if (!(await userHelpers.verifyEmailPassword(user.email, oldpassword))) {
        throw new ApolloError(
          i18nHelper.__('OLD_PASSWORD_NOT_OK'),
          'OLD_PASSWORD_NOT_OK',
        )
      }

      console.log('user is' + JSON.stringify(user))
      // Update the password
      user = await userHelpers.setNewPassword(newpassword, user.id)
      if (!user) {
        throw new ApolloError(i18nHelper.__('SERVER_ERROR'), 'SERVER_ERROR')
      }
      return true
    },

    async updateProfilePicture(_, { file }, { user }) {
      // Upload the file
      const { mimetype } = await file
      const today = new Date()
      const mimeType_temp = mimetype.split('/')
      const picture = await utlsHlprs.uploadFile({
        destination: config.folders.upload_user,
        file: file,
        allowedFileMime: ['image/jpeg', 'image/jpg', 'image/png'],
        savedFileName:
          '' +
          today.getFullYear() +
          ('0' + (today.getMonth() + 1)).slice(-2) +
          today.getDate() +
          '-' +
          today.getTime() +
          '-' +
          user.id +
          '.' +
          mimeType_temp[1],
      })

      if (!picture) {
        console.error('[CatuServer] Error saving the file.')
        throw new ApolloError(i18nHelper.__('SERVER_ERROR'), 'SERVER_ERROR')
      }

      return await utlsHlprs.renderProfilePictureUrl(picture)
    },

    async setProfilePicture(_, { file }, { user }) {
      // Make sure user is logged in
      if (!user) {
        throw new ApolloError(
          i18nHelper.__('NOT_AUTHENTICATED'),
          'NOT_AUTHENTICATED',
        )
      }
      // Upload the file
      const { mimetype } = await file
      const today = new Date()
      const mimeType_temp = mimetype.split('/')
      const newProfilePicture = await utlsHlprs.uploadFile({
        destination: config.folders.upload_user,
        file: file,
        allowedFileMime: ['image/jpeg', 'image/jpg', 'image/png'],
        savedFileName:
          '' +
          today.getFullYear() +
          ('0' + (today.getMonth() + 1)).slice(-2) +
          today.getDate() +
          '-' +
          today.getTime() +
          '-' +
          user.id +
          '.' +
          mimeType_temp[1],
      })

      if (!newProfilePicture) {
        console.error('[CatuServer] Error saving the file.')
        throw new ApolloError(i18nHelper.__('SERVER_ERROR'), 'SERVER_ERROR')
      }
      // Update the DB
      const picutreUrl = await userHelpers.setProfilePicture(
        user.id,
        newProfilePicture,
      )
      if (!picutreUrl) {
        console.error('[CatuServer] Error updating the profile in DB.')
        throw new ApolloError(i18nHelper.__('SERVER_ERROR'), 'SERVER_ERROR')
      }
      return picutreUrl
    },
    async toggleUserActivation(_, { id, active }, { user }) {
      console.log('toggleUserActivation : ')
      try {
        const access = await userHelpers.hasAccess('users', 'can_edit', user.id)
        if (!access) {
          console.log('cant toogleUserActivation')
          return false
        }
        await userHelpers.activateDeactivate(id, active)
        return true
      } catch (e) {
        console.log('error while trying to toggle user acivation')
        console.log(e)
        return false
      }
      return false
    },

    /**
     * Check access
     */
    async userHasAccess(_, { accessSlug }, { user }) {
      // Make sure user is logged in
      if (!user) {
        throw new ApolloError(
          i18nHelper.__('NOT_AUTHENTICATED'),
          'NOT_AUTHENTICATED',
        )
      }

      // Get the employee by the token email
      if (!(await userHelpers.hasAccess(accessSlug, user.id))) {
        return false
      }

      return true
    },
  },
}

module.exports = resolvers
