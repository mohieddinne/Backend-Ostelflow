const { User, Subscriber, Notification, Room } = require('../../../models')
const Sequelize = require('sequelize')
const { Op } = Sequelize
module.exports.getNotifications = async function (ids) {
  const where = {}
  if (Array.isArray(ids) && ids.length > 0) {
    where.id = ids
  }

  const date = new Date()
  where[Op.and] = [
    Sequelize.where(
      Sequelize.fn('YEAR', Sequelize.col('created_at')),
      date.getFullYear(),
    ),
    Sequelize.where(
      Sequelize.fn('MONTH', Sequelize.col('created_at')),
      date.getMonth() + 1,
    ),
    Sequelize.where(
      Sequelize.fn('DAY', Sequelize.col('created_at')),
      date.getDate(),
    ),
  ]

  where.disabled = false

  return await Notification.findAll({
    where: { [Op.and]: where },
  })
}
module.exports.getGraNotifications = async function (ids, userId) {
  const where = {}
  if (Array.isArray(ids) && ids.length > 0) {
    where.id = ids
  }
  if (userId) {
    where.user_id = userId
  }
  where.description = { [Op.notLike]: '%start_timer%' }
  const date = new Date()
  where[Op.and] = [
    Sequelize.where(
      Sequelize.fn('YEAR', Sequelize.col('created_at')),
      date.getFullYear(),
    ),
    Sequelize.where(
      Sequelize.fn('MONTH', Sequelize.col('created_at')),
      date.getMonth() + 1,
    ),
    Sequelize.where(
      Sequelize.fn('DAY', Sequelize.col('created_at')),
      date.getDate(),
    ),
  ]

  where.disabled = false

  const notifications = await Notification.findAll({
    where: { [Op.and]: where },

    order: [['created_at', 'DESC']],
    // limit: 2,
    raw: true,
    nest: true,
  })
  console.log({ notifications })
  let IdUser = null
  let roomId = null
  if (notifications) {
    notifications.map((e) => (IdUser = e.userId))
    notifications.map((e) => (roomId = e.sourceId))
  }
  const user = await User.findOne({
    where: { id: IdUser },
    attributes: ['firstName', 'email', 'lastName', 'id'],
    raw: true,
    nest: true,
  })
  console.log({ roomId })
  const room = await Room.findOne({
    where: { id: roomId },
    attributes: ['id', 'number'],
    raw: true,
    nest: true,
  })

  return notifications.map((e) => ({ ...e, user, room }))
}
module.exports.saveSubscribers = async function (notification, ids) {
  const promises = []
  console.log({ notification })
  for (const id of ids) {
    promises.push(
      Subscriber.build({
        userId: id,
        notificationId: notification,
      }).save(),
    )
  }
  return promises
}

module.exports.markAsRead = async function (ids, userId) {
  if (!ids[0]) {
    const notifications = await Notification.findAll({
      where: { userId },
      raw: true,
      nest: true,
    })
    Notification.update({ ...notifications, seen: true }, { where: { userId } })
    return true
  } else {
    // Get notification
    const notification = await Notification.findOne({ where: { id: ids[0] } })
    notification.update(
      { ...notification, seen: true },
      { where: { id: ids[0] } },
    )

    return true
  }
}
module.exports.disableNotifications = async function (ids, userId) {
  if (!ids[0]) {
    const notifications = await Notification.findAll({
      where: { userId },
      raw: true,
      nest: true,
    })
    Notification.update(
      { ...notifications, disabled: true },
      { where: { userId } },
    )
    return true
  } else {
    // Get notification
    const notification = await Notification.findOne({ where: { id: ids[0] } })
    notification.update(
      { ...notification, disabled: true },
      { where: { id: ids[0] } },
    )

    return true
  }
}
