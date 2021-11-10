const helpers = require('./helpers')
const { maintainTask, task, timeSheet } = require('./validators')

const resolvers = {
  Task: {
    async timesheets(parent, { active }, ctx, info) {
      let data = parent.timesheets
      if (!data) {
        // fetch the data
      }
      if (active) {
        return data?.filter((item) => {
          return item.startedOn !== null && item.endedOn === null
        })
      }
      return data
    },
  },
  Query: {
    async graTasks(root, { ids, filters }, { user }, ctx, info) {
      return helpers.getGraTasks(ids, filters, user)
    },
    async graTodosItems(root, { ids, TaskId }, { user }, ctx, info) {
      return helpers.graTodosItems(ids, TaskId, user)
    },
    async myGraTasks(root, { filters }, { user }, ctx, info) {
      return helpers.getGraTasks(null, { ...filters, user: user.id })
    },
    async maintainTasks(root, { ids, filters }, ctx, info) {
      return helpers.getMaintainTasks(ids, filters)
    },
    async taskAttend(root, args, ctx, info) {
      return helpers.taskAttend(args)
    },
    async storedTimesheetActive(root, { id }, { user }, info) {
      return helpers.ActiveTimeSheet(id, user)
    },
    async savedTodos(root, { id }, { user }, info) {
      return helpers.savedTodos(id, user)
    },
    async graBreaks(root, { ids, UserId }, { user }, info) {
      return helpers.graBreaks(ids, UserId, user)
    },
  },
  Mutation: {
    async assignRooms(_, { params }, ctx, info) {
      // await task.validateAsync(params, { abortEarly: false });
      const result = params.map((e) => helpers.createGraTask(e))
      return await result
    },

    async createMaintananceTask(_, { params }, { user }, ctx, info) {
      // await maintainTask.validateAsync(params, {
      //   abortEarly: false,
      // })
      return await helpers.createMaintainTask(params, user)
    },
    async updateMaintananceTask(_, { params }, { user }, ctx, info) {
      // await maintainTask.validateAsync(params, {
      //   abortEarly: false,
      // })
      return await helpers.updateMaintananceTask(params, user)
    },
    async updateGraTasks(_, { params }, { user }, ctx, info) {
      // await maintainTask.validateAsync(params, {
      //   abortEarly: false,
      // })
      return await helpers.updateGraTasks(params, user)
    },
    async timeSheets(_, { data }, { user }, info) {
      // await timeSheet.validateAsync(data, { abortEarly: false })
      return await helpers.saveTimeSheet(data, user.id)
    },
    async saveTodos(_, { data }, { user }, info) {
      // await timeSheet.validateAsync(data, { abortEarly: false })
      return await helpers.saveTodos(data)
    },
    async breaks(_, { Breakdata }, { user }, info) {
      // await timeSheet.validateAsync(data, { abortEarly: false })
      return await helpers.takeBreak(Breakdata, user.id)
    },
    async toggleTimesheet(_, { taskId }, { user }, info) {
      console.log({ userId: user.id })
      return await helpers.toggleTimesheet(taskId, user.id)
    },
    async toggleTimeSheetMaintain(_, { taskId }, { user }, info) {
      return await helpers.toggleTimeSheetMaintain(taskId, user.id)
    },
    async updateTimesheet(_, args, ctx, info) {
      return await helpers.updateTimesheet(args)
    },
    async deleteTimesheet(_, args, ctx, info) {
      return await helpers.deleteTimesheet(args)
    },
    async deleteMaintananceTask(_, args, ctx, info) {
      return await helpers.deleteMaintananceTask(args)
    },
    async deleteTodo(_, args, ctx, info) {
      return await helpers.deleteTodo(args)
    },
    async deleteRecentTodos(_, args, ctx, info) {
      return await helpers.deleteRecentTodos(args)
    },
    async createTodoItem(_, { tododata }, { user }, ctx, info) {
      // await maintainTask.validateAsync(params, {
      //   abortEarly: false,
      // })
      const result = await Promise.all(
        tododata.map(
          (e) => (console.log({ e }), helpers.createTodoItem(e, user)),
        ),
      )
      return await result
    },
    async chekedTodo(_, { id, isCheked }, { user }, ctx, info) {
      // await maintainTask.validateAsync(params, {
      //   abortEarly: false,
      // })
      return await helpers.chekedTodo(id, user, isCheked)
    },
  },
}

module.exports = resolvers
