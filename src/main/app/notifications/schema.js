const { gql } = require('apollo-server-express')

// Define our schema using the GraphQL schema language
const schema = gql`
  union CustomType = Room | Task

  enum NotificationTag {
    TOGGLE_DND
    TOGGLE_CLEANED
    TOGGLE_PRIORITY_GRA
    TOGGLE_PRIORITY_MAINTAIN
  }
  type Notification {
    id: ID
    userId: Int
    activityType: String
    description: String
    sourceId: Int
    parentId: Int
    data: CustomType
    seen: Boolean
    user: User
    room: Room
    created_at: String
  }
  input SubscriberInput {
    name: String
    value: [Int]
  }
  input NotificationInput {
    userId: Int
    activityType: String
    sourceId: Int
    parentId: Int
    subscribers: [SubscriberInput]
    description: String
    name: String
    value: String
  }

  extend type Query {
    notifications(ids: [Int]): [Notification] @isAuthenticated
    GraNotifications(ids: [Int], userId: Int): [Notification] @isAuthenticated
  }
  extend type Mutation {
    notifications(data: NotificationInput, tag: NotificationTag): Notification
      @isAuthenticated
    disableNotifications(ids: [Int]): Boolean @isAuthenticated
    markAsRead(ids: [Int]): Boolean @isAuthenticated
  }
  extend type Subscription {
    notifications: Notification
  }
`

module.exports = schema
