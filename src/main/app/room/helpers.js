const {
  Room,
  Occupant,
  RoomType,
  GraTask,

  Subscriber,
  Notification,
} = require('../../../models')
module.exports.getData = async function (ids) {
  const where = {}
  if (ids?.length > 0) where.id = ids
  const include = [
    {
      model: Occupant,
      as: 'occupants',
    },
    {
      model: RoomType,
      as: 'type',
    },
    {
      model: GraTask,
      as: 'graTasks',
    },
  ]
  const room = await Room.findAll({ where, include })
  return room
}

module.exports.create = async function (data) {
  // data validation
  const _data = {}
  const promises = []
  if (data.number) _data.number = data.number
  if (data.floor) _data.floor = data.floor
  if (data.status) _data.status = data.status
  if (data.type) _data.type_id = data.type
  const roomId = await Room.build(_data)
    .save()
    .then((res) => res.id)
  if (roomId && data?.occupants?.length > 0)
    data.occupants.map((occupant) => {
      promises.push(Occupant.build({ ...occupant, room_id: roomId }))
    })
  await Promise.all(promises.map((item) => item.save()))
  return roomId
    ? {
        ..._data,
        roomId,
      }
    : null
}

module.exports.delete = async function (roomId) {
  if (!roomId) return false
  const room = await Room.findOne({ where: { id: roomId } })
  if (!room) return false
  const occupants = await Occupant.findAll({ where: { room_id: roomId } })
  const promises = []
  occupants.map((occupant) => promises.push(occupant))
  promises.push(room)
  const resolved = await Promise.all(promises.map((item) => item.destroy()))
  return resolved ? true : false
}

module.exports.update = async function (data) {
  if (!data.id) return false
  const room = await Room.findOne({ where: { id: data.id } })
  if (!room) return false
  const occupants = await Occupant.findAll({ where: { room_id: data.id } })
  const promises = []
  // data validation
  const _data = {}
  data.type_id = data.type
  delete data.type_id
  if (data.number) _data.number = data.number
  if (data.floor) _data.floor = data.floor
  if (data.status) _data.status = data.status

  _data.dnd = data.dnd
  if (data.startAt) {
    _data.startAt = data.startAt
  } else {
    _data.startAt = null
  }
  if (data.expiresAt) {
    _data.expiresAt = data.expiresAt
  } else {
    _data.expiresAt = null
  }
  if (data.type) _data.type_id = data.type
  if (Array.isArray(occupants) && occupants.length > 0)
    for (const occupant of occupants) {
      data?.occupants?.map((item) => {
        if (item.id)
          if (occupant.id === item.id)
            promises.push(occupant.update(item, { where: { id: item.id } }))
      })
    }
  promises.push(room.update(_data, { where: { id: data.id } }))

  const resolved = await Promise.all(promises)
  return resolved ? data : null
}

module.exports.Types = async function (slugs) {
  // Build the query
  const list = await RoomType.findAll({
    attributes: ['id', 'value'],
    raw: true,
    nest: true,
  })

  return list
}
module.exports.updateAttr = async function (data) {
  const { id } = data
  if (!id) return false
  delete data.id
  const room = await Room.findOne({ where: { id } })
  const dnd = room.update({ ...room, ...data }, { where: { id } })

  return dnd
}
