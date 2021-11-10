const { withFilter } = require('graphql-subscriptions')
const helpers = require('./helpers')
const roomHelpers = require('../room/helpers')
const taskHelpers = require('../task/helpers')

const Sequelize = require('sequelize')
const { Op } = Sequelize
const { User, Notification } = require('../../../models')
const resolvers = {
  CustomType: {
    __resolveType(obj) {
      if (obj.number) return 'Room'
      else return 'Task'
    },
  },
  Query: {
    async notifications(root, { ids }, ctx, info) {
      return await helpers.getNotifications(ids)
    },
    async GraNotifications(root, { ids, userId }, { user }, info) {
      return await helpers.getGraNotifications(ids, userId)
    },
  },
  Mutation: {
    async notifications(root, { data, tag }, { pubsub, user }, info) {
      const promises = []
      const { subscribers } = data
      // subscribers is required.
      const userId = user.id
      // Create the notifications , the subscibers next
      const notification = await Notification.build({
        ...data,
        userId,
        subscribers: undefined,
      }).save()
      if (!notification) throw new Error('Notification failed !')
      const _subscribers = []
      for (const subscribe of subscribers) {
        const values = subscribe.value
        console.log({ name: subscribe.name })
        switch (subscribe.name) {
          case 'users':
            {
              if (values?.length > 0) {
                const users = await User.findAll({
                  where: { id: { [Op.not]: userId } },
                  attributes: ['id'],
                })
                promises.push(helpers.saveSubscribers(notification?.id, values))
                _subscribers.push(...users)
              } else {
                // Get All users
                const users = await User.findAll({
                  where: { id: { [Op.not]: userId } },
                  attributes: ['id'],
                })
                promises.push(
                  helpers.saveSubscribers(
                    notification?.id,
                    users.map((user) => user.id),
                  ),
                )
                _subscribers.push(...users)
              }
            }
            break
          case 'roles':
            {
              if (values.length > 0) {
                const users = await User.findAll({
                  where: {
                    roleId: values,
                    id: { [Op.not]: userId },
                  },
                  attributes: ['id'],
                })

                promises.push(
                  helpers.saveSubscribers(
                    notification?.id,
                    users.map((user) => user.id),
                  ),
                )
                _subscribers.push(...users)
              }
            }
            break
          default:
        }
      }
      let _data = null
      const { sourceId } = data
      switch (tag) {
        case 'TOGGLE_DND':
          _data = await roomHelpers.updateAttr(
            { id: sourceId, [data.name]: !!data.value },
            { where: { sourceId } },
          )
          break
        case 'TOGGLE_CLEANED':
          {
            _data = await roomHelpers.updateAttr({
              id: sourceId,
              [data.name]: parseInt(data.value),
            })
          }
          break
        case 'TOGGLE_PRIORITY_GRA':
          {
            _data = await taskHelpers.updateGraTasks({
              id: sourceId,
              [data.name]: parseInt(data.value),
            })
          }
          break
        case 'TOGGLE_PRIORITY_MAINTAIN':
          {
            _data = await taskHelpers.updatemaintain({
              id: sourceId,
              [data.name]: parseInt(data.value),
            })
          }
          break
        default:
          true
      }
      const notifications = {
        ...notification?.dataValues,
        data: { ..._data?.dataValues },
      }
      pubsub.publish(tag, {
        notifications,
        subscribers: _subscribers.map((subscriber) => {
          if (!subscriber.offLine && subscriber.id !== user.id)
            return subscriber.id
        }),
      })
      return notifications
    },
    async disableNotifications(_, { ids }, { user }) {
      return helpers.disableNotifications(ids, user.id)
    },
    async markAsRead(_, { ids }, { user }) {
      return helpers.markAsRead(ids, user.id)
    },
  },
  Subscription: {
    notifications: {
      subscribe: withFilter(
        (_, __, { pubsub }) =>
          pubsub.asyncIterator([
            'TOGGLE_DND',
            'TOGGLE_CLEANED',
            'TOGGLE_PRIORITY_GRA',
            'TOGGLE_PRIORITY_MAINTAIN',
          ]),
        ({ subscribers }, args, { user }) => {
          const subscribed = subscribers.includes(user.id)
          return subscribed
        },
      ),
    },
  },
}

module.exports = resolvers
