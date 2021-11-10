const { gql } = require('apollo-server-express')

// Define our schema using the GraphQL schema language
const schema = gql`
  type User {
    id: Int
    email: String
    firstName: String
    lastName: String
    profileImage: String
    language: String
    direction: String
    active: Boolean
    role: Role
    lastIp: String
    lastLogin: String
    lastPasswordChange: String
    admin: Boolean
    phoneNumber: Int
    graTasks: [Task]
    activityLogs: [ActivityLog]
  }

  input UserInput {
    id: Int
    email: String
    firstName: String
    lastName: String
    profileImage: String
    language: String
    direction: String
    role: RoleInput
    active: Boolean
    admin: Boolean
    password: String
  }

  input ConditionsInput {
    name: String
    value: [String]
  }

  type LoginData {
    token: String
    user: User
  }

  extend type Query {
    me: User @isAuthenticated
    users(conditions: [ConditionsInput]): [User]
      @hasAccess(slug: "users", scope: "view")
    GraUsers(conditions: [ConditionsInput]): [User]

    getUserById(id: Int!): User
  }

  extend type Mutation {
    signup(data: UserInput): Int
    login(email: String, password: String): LoginData
    logout: Boolean @isAuthenticated
    user(data: UserInput!, operation: String): Boolean
      @hasAccess(slug: "users", scope: "edit")
    toggleUserActivation(id: Int!, active: Boolean): Boolean
    forgetPassword(email: String!): Boolean
    resetPassword(token: String!, newpassword: String!): Boolean
    updateMyPassword(
      oldpassword: String!
      newpassword: String!
      newpassword2: String!
    ): Boolean @isAuthenticated

    setProfilePicture(file: Upload!, userId: Int): String @isAuthenticated
    updateProfilePicture(file: Upload!): String @isAuthenticated
    userHasAccess(accessSlug: String!): Boolean @isAuthenticated
  }
`

module.exports = schema
