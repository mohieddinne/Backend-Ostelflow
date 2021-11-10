const {
  Room,
  GraTask,
  User,
  MaintainTask,
  TimeSheet,
  Break,
  Option,
  GraTodoItems,
  TodoTemplate,
} = require('../../../models')
const Sequelize = require('sequelize')
const { Op } = Sequelize

module.exports.taskAttend = async function (args) {
  const where = {}
  if (args.UserId) {
    where.userId = parseInt(args.UserId)
  }
  // const date = (args.date ? new Date(args.date) : new Date())
  //   .toISOString()
  //   .slice(0, 10)
  if (args?.date) {
    const date = new Date(args?.date)
    where[Op.and] = [
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
  }
  console.log({ where })
  const timeSheet = await TimeSheet.findAll({
    // where,
    // // where: {
    // //   [Op.and]: Sequelize.where(
    // //     Sequelize.col('started_on'),
    // //     'LIKE',
    // //     `${date}%`,
    // //   ),
    // //   where,
    // // },
    where: { [Op.and]: where },

    include: [
      {
        model: GraTask,
        as: 'task',

        include: [
          {
            model: Room,
            as: 'room',
          },
          {
            model: User,
            as: 'user',
          },
        ],
      },
    ],
  })
  return timeSheet
}
module.exports.ActiveTimeSheet = async function (id, user) {
  const userId = user.id
  const timesheetActive = await TimeSheet.findOne({
    where: { active: true },
    include: [
      {
        model: GraTask,
        as: 'task',
        where: { id },
        include: [
          {
            model: Room,
            as: 'room',
          },
          {
            model: User,
            as: 'user',
            where: userId,
          },
        ],
      },
    ],
  })
  return timesheetActive
}
module.exports.createGraTask = async function (params) {
  const { roomId, createdBy } = params
  if (!roomId) throw new Error('room is is required.')
  if (params.assignedOn) {
    await GraTask.destroy({
      where: { assignedOn: params.assignedOn },
    })
  }

  if (!roomId) throw new Error('room is is required.')
  const room = await Room.findOne({
    where: {
      id: roomId,
    },
  })

  if (!room) throw new Error('Room dose not exist.')
  if (!parseInt(createdBy)) throw new Error('createdBy field is required.')
  if (params.user) {
    const { email } = params.user
    if (!email) throw new Error('Email is required')
    const user = await User.findOne({ where: { email } })
    if (user) params.userId = user.id
    else
      params.userId = await User.build(params.user)
        .save()
        .then((res) => res.id)
  } // check if user who create the task exist
  if (!(await User.findOne({ where: { id: createdBy } })))
    throw new Error('Your are not allowed to create tasks.')

  return await GraTask.build(params).save()
}
// module.exports.assignNote = async function (noteDataInput) {
//   const { graTaskId, noteId, status } = noteDataInput
//   const assign = await TaskNoteRelation.create({
//     noteId,
//     graTaskId,
//     status,
//   })
//   if (assign) return true
//   else return false
// }

module.exports.createMaintainTask = async function (params, user) {
  const { roomId } = params
  if (!roomId) throw new Error('Room is is required.')
  const room = await Room.findOne({
    where: {
      id: roomId,
    },
  })
  const data = { ...params, ...{ createdBy: user.id } }
  if (!room) throw new Error('Room dose not exist.')
  // if (user) {
  //   const { email } = params.user
  //   if (!email) throw new Error('Email is required')
  //   const user = await User.findOne({ where: { email } })
  //   if (user) params.user = user.id
  //   else
  //     params.user = await User.build(params.user)
  //       .save()
  //       .then((res) => res.id)
  // }
  return await MaintainTask.build(data).save()
}

// maintenance task
module.exports.getMaintainTasks = async function (ids, filters) {
  const where = {}
  if (ids) {
    where.id = ids
  }
  if (filters?.date) {
    const date = new Date(filters.date)
    where[Op.and] = [
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
  }
  return await MaintainTask.findAll({
    where: { [Op.and]: where },
    //where,
    include: [
      {
        model: User,
        as: 'user',
      },
      {
        model: Room,
        as: 'room',
      },
      {
        model: TimeSheet,
        as: 'timesheets',
      },
    ],
  })
}
module.exports.graTodosItems = async (ids, TaskId, user) => {
  const where = {}
  const whereTAsk = {}
  if (ids) {
    where.id = ids
  }
  if (TaskId) {
    whereTAsk.id = TaskId
  }
  console.log({ TaskId })
  const data = await GraTodoItems.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
      },
      {
        model: GraTask,
        as: 'tasks',
        where: whereTAsk,
      },
    ],
  })
  return data
}
module.exports.savedTodos = async (ids, user) => {
  const where = {}
  if (ids) {
    where.id = ids
  }

  const data = await TodoTemplate.findAll({
    where,
    raw: true,
    nest: true,
  })
  return data
}
module.exports.graBreaks = async (ids, UserId, user) => {
  const where = {}
  if (ids) {
    where.id = ids
  }
  where.user_id = UserId
  where.endedOn = null

  const data = await Break.findAll({
    where,
    raw: true,
    nest: true,
    attributes: ['id', 'endedOn', 'user_id'],
  })
  return data
}

module.exports.getGraTasks = async (ids, filters, user) => {
  const where = {}

  if (ids) {
    where.roomId = ids
  }

  if (filters?.date) {
    const date = new Date(filters.date)
    where[Op.and] = [
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
  }

  if (filters?.user) {
    where.assigned_to = filters.user
  }

  return await GraTask.findAll({
    where: { [Op.and]: where },
    include: [
      {
        model: Room,
        as: 'room',
      },
      {
        model: User,
        as: 'user',
      },
      {
        model: TimeSheet,
        as: 'timesheets',
      },
      {
        model: GraTodoItems,
        as: 'todos',
      },
    ],
  })
}

module.exports.takeBreak = async function (Breakdata, userId) {
  // if break active , endon new date update this break
  // else starton new date  create new break
  //const { breakLimit } = Breakdata
  const limit = await Option.findOne({
    where: { name: 'breakLimit' },
  })
  const activeBreak = await Break.findOne({
    where: { userId, endedOn: null },
  })
  const breakLimit = parseInt(limit.value)

  if (activeBreak) {
    return await Break.update({ endedOn: new Date() }, { where: { userId } })
  } else {
    const allActiveBreak = await Break.findAndCountAll({
      where: { endedOn: null },
    })
    if (allActiveBreak.count > breakLimit)
      throw new Error('you have already reached the possible break limit')

    const newBreak = await Break.create({
      userId,
      startedOn: new Date(),
      endedOn: null,
    })

    return newBreak
  }
}
module.exports.saveTimeSheet = async function (data, userId) {
  // data validation
  const { taskId, roomId } = data
  // Check user && task

  const tasks = await GraTask.findOne({
    where: { userId, id: taskId },
  })
  if (!tasks) throw new Error('There is no task for this user')
  // check if user has an active timesheet
  const timesheetActive = await TimeSheet.findAll({
    where: { userId, active: true },
  })

  if (timesheetActive?.length > 0 && !data.endedOn)
    throw new Error('Only one task...')
  let timeSheetId = data.timeSheetId || null

  if (!timeSheetId) {
    // Create new timer for this task
    const newTimeSheet = {
      roomId,
      userId,
      graTaskId: taskId,
      startedOn: new Date(data?.startedOn) || null,
      endedOn: null,
    }
    timeSheetId = await TimeSheet.build(newTimeSheet)
      .save()
      .then((res) => res.id)
  }

  // Get active task
  const taskActive = await GraTask.findOne({
    where: { userId, id: taskId },
    include: [
      {
        model: TimeSheet,
        where: { graTaskId: taskId, userId, roomId, active: true },
      },
    ],
  })

  // Stop running tasks
  if (taskActive)
    await taskActive?.TimeSheets?.map((timeSheet) => closeTimer(timeSheet.id))

  return await toggleTimer(timeSheetId)
}

module.exports.toggleTimesheet = async function (taskId, userId) {
  // Check user && task
  console.log({ userId })
  const task = await GraTask.findOne({
    attributes: ['id'],
    where: { userId, id: taskId },
  })
  if (!task) throw new Error('There is no task for this user')

  const isbreak = await Break.findAll({
    where: { user_id: userId, endedOn: null },
    raw: true,
    nest: true,
    attributes: ['id', 'endedOn', 'user_id'],
  })
  console.log({ isbreak })
  if (isbreak.length > 0) throw new Error('user is on break Now')
  // Check if user has an active timesheet
  const ts = await TimeSheet.findOne({
    attributes: ['id'],
    where: {
      userId,
      graTaskId: task.id,
      startedOn: { [Op.not]: null },
      endedOn: { [Op.is]: null },
    },
  })

  let id = ts?.id
  if (ts?.id) {
    await ts.update(
      { endedOn: new Date() },
      { where: { userId, graTaskId: task.id } },
    )
  } else {
    await TimeSheet.update({ endedOn: new Date() }, { where: { userId } })
    const lts = await TimeSheet.create({
      userId,
      graTaskId: task.id,
      startedOn: new Date(),
      endedOn: null,
    })
    id = lts.id
  }

  return TimeSheet.findByPk(id)
}
module.exports.toggleTimeSheetMaintain = async function (taskId, userId) {
  // Check user && task

  const maintainTask = await MaintainTask.findOne({
    attributes: ['id'],
    where: { assigned_to: userId, id: taskId },
  })
  if (!maintainTask) throw new Error('There is no task for this user')

  // Check if user has an active timesheet
  const ts = await TimeSheet.findOne({
    attributes: ['id'],
    where: {
      userId,
      maintainTaskId: maintainTask.id,
      startedOn: { [Op.not]: null },
      endedOn: { [Op.is]: null },
    },
  })

  let id = ts?.id
  if (ts?.id) {
    await ts.update(
      { endedOn: new Date() },
      { where: { userId, maintainTaskId: maintainTask.id } },
    )
  } else {
    await TimeSheet.update({ endedOn: new Date() }, { where: { userId } })
    const lts = await TimeSheet.create({
      userId,
      maintainTaskId: maintainTask.id,
      startedOn: new Date(),
      endedOn: null,
    })
    id = lts.id
  }

  return TimeSheet.findByPk(id)
}
module.exports.updateTimesheet = async function (args) {
  const { id, startedOn, endedOn } = args
  await TimeSheet.update({ startedOn, endedOn }, { where: { id } })
    .then((res) => {
      console.log(res)
      return true
    })
    .catch((err) => console.log('error: ' + err))
  return false
}
module.exports.updateMaintananceTask = async function (params, user) {
  const { id, startedOn, endedOn, status, isAssigned, priority } = params
  const update = await MaintainTask.update(
    isAssigned
      ? { startedOn, endedOn, assigned_to: user.id, status, priority }
      : { startedOn, endedOn, status, priority },
    // { startedOn, endedOn, assigned_to: user.id, status },
    { where: { id } },
  )
    .then((res) => {
      return true
    })
    .catch((err) => console.log('error: ' + err))
  if (update) {
    return true
  } else return false
}
module.exports.updatemaintain = async function (params, user) {
  const { id, startedOn, endedOn, status, isAssigned, priority } = params
  const update = await MaintainTask.update(
    isAssigned
      ? { startedOn, endedOn, assigned_to: user.id, status, priority }
      : { startedOn, endedOn, status, priority },
    { where: { id } },
  )

  return update
}
module.exports.updateGraTasks = async function (params, user) {
  const { id, startedOn, endedOn, status, isAssigned, priority } = params
  const update = await GraTask.update(
    isAssigned
      ? { startedOn, endedOn, assigned_to: user.id, status, priority }
      : { startedOn, endedOn, status, priority },
    { where: { id } },
  )

  return update
}
module.exports.deleteMaintananceTask = async function (args) {
  const { id } = args
  return await MaintainTask.destroy({ where: { id } })
    .then((res) => true)
    .catch((err) => false)
}
module.exports.deleteTodo = async function (args) {
  const { id } = args
  return await GraTodoItems.destroy({ where: { id } })
    .then((res) => true)
    .catch((err) => false)
}
module.exports.deleteRecentTodos = async function (args) {
  const { taskId } = args
  console.log({ taskId })

  return await GraTodoItems.destroy({ where: { taskId } })
    .then((res) => true)
    .catch((err) => false)
}
module.exports.deleteTimesheet = async function (args) {
  const { id } = args
  return await TimeSheet.destroy({ where: { id } })
    .then((res) => true)
    .catch((err) => false)
}
module.exports.createTodoItem = async function (tododata, user) {
  const where = {}

  const { name, icon, RoomID, date, taskId } = tododata
  if (date) {
    const dateAssign = new Date(date)
    where[Op.and] = [
      Sequelize.where(
        Sequelize.fn('YEAR', Sequelize.col('assigned_on')),
        dateAssign.getFullYear(),
      ),
      Sequelize.where(
        Sequelize.fn('MONTH', Sequelize.col('assigned_on')),
        dateAssign.getMonth() + 1,
      ),
      Sequelize.where(
        Sequelize.fn('DAY', Sequelize.col('assigned_on')),
        dateAssign.getDate(),
      ),
    ]
  }
  if (taskId) {
    await GraTodoItems.destroy({ where: { taskId } })
      .then((res) => true)
      .catch((err) => false)
    console.log('passed')
  }
  // const task = await GraTask.findOne({
  //   where,
  //   include: [
  //     {
  //       model: Room,
  //       as: 'room',
  //       where: {
  //         id: parseInt(RoomID),
  //       },
  //     },
  //   ],
  // })
  const create = await GraTodoItems.create({
    name,
    icon,
    taskId,
    checkedBy: user.id,
  })

  if (create) {
    return create
  }
}
module.exports.saveTodos = async function (data) {
  const create = await TodoTemplate.create(data)
  if (create) {
    return create
  }
}
module.exports.chekedTodo = async function (id, user, isCheked) {
  if (isCheked) {
    const update = await GraTodoItems.update(
      {
        checkedOn: new Date().toISOString(),
        checkedBy: user.id,
      },
      {
        where: { id },
      },
    )
    if (update) {
      return true
    }
  } else {
    const update = await GraTodoItems.update(
      {
        checkedOn: null,
        checkedBy: null,
      },
      {
        where: { id },
      },
    )
    if (update) {
      return true
    }
  }
}

async function closeTimer(timeSheetId) {
  const timeSheet = await TimeSheet.findOne({ where: { id: timeSheetId } })
  if (!timeSheet) return false
  return (await timeSheet.update(
    { ...timeSheet, active: false, endedOn: new Date() },
    { where: { id: timeSheetId } },
  ))
    ? true
    : false
}
async function toggleTimer(timeSheetId) {
  const timeSheet = await TimeSheet.findOne({ where: { id: timeSheetId } })
  if (!timeSheet) throw new Error('Somthing went wrong !')
  return await timeSheet.update(
    { ...timeSheet, active: !timeSheet.active },
    { where: { id: timeSheetId } },
  )
}
