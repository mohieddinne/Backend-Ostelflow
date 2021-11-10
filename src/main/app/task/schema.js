const { gql } = require('apollo-server-express')

// Define our schema using the GraphQL schema language
const schema = gql`
  type Task {
    id: Int
    assignedOn: String
    priority: Int
    description: String
    problem: String
    roomId: ID
    room: Room
    user: User
    timesheets(active: Boolean): [TimeSheet]
    createdBy: Int
    status: Int
    note: String
    todos: [TodoItem]
  }
  type TodoItem {
    id: Int
    name: String
    icon: String
    user: User
    tasks: Task
    checkedOn: String
    checkedBy: Int
  }
  input TodoItemInput {
    id: Int
    name: String
    icon: String
    RoomID: ID
    taskId: ID
    date: String
    checkedOn: String
    checkedBy: Int
  }
  input TaskInput {
    id: Int
    roomId: ID
    user: UserInput
    priority: Int
    createdBy: Int
    description: String
    problem: String
    assignedOn: String
    status: Int
    isAssigned: Boolean
    note: String
  }
  type TimeSheet {
    startedOn: String
    endedOn: String
    id: Int
    task: Task
    userId: Int
  }
  type TodoTemplate {
    id: Int
    name: String
    blob: String
  }
  type Break {
    startedOn: String
    endedOn: String
    breakLimit: Int
    id: Int
    UserId: Int
  }
  type ConnectionTime {
    description: String
    created_at: String
    userId: Int
    id: Int
  }

  input BreakInput {
    startedOn: String
    endedOn: String
    breakLimit: Int
  }
  input TimeSheetInput {
    roomId: Int!
    taskId: Int!
    timeSheetId: Int
    startedOn: String
    endedOn: String
  }

  input templateInput {
    name: String
    blob: String
  }
  input GRA_TaskFilter {
    date: String
  }

  extend type Query {
    graTasks(ids: [ID], TaskId: [ID], filters: GRA_TaskFilter): [Task]
    graBreaks(ids: [ID], UserId: ID): [Break]
    graTodosItems(ids: [ID], TaskId: [ID]): [TodoItem]

    myGraTasks(filters: GRA_TaskFilter): [Task]
      @hasAccess(slug: "tasks", scope: "view")
    maintainTasks(ids: [Int], filters: GRA_TaskFilter): [Task]
      @hasAccess(slug: "tasks", scope: "view")
    taskAttend(date: String, input: String, UserId: ID): [TimeSheet]
      @hasAccess(slug: "timesheet", scope: "view")
    storedTimesheetActive(id: Int): TimeSheet
    savedTodos(ids: [ID]): [TodoTemplate]
    connectionTime(UserID: Int): ConnectionTime
  }
  extend type Mutation {
    assignRooms(params: [TaskInput]): [Task]
      @hasAccess(slug: "tasks", scope: "create")
    createMaintananceTask(params: TaskInput): Task
      @hasAccess(slug: "tasks", scope: "create")
    timeSheets(data: TimeSheetInput): TimeSheet @isAuthenticated
    breaks(Breakdata: BreakInput): Break @isAuthenticated
    updateGraTasks(params: TaskInput): Boolean
    toggleTimesheet(taskId: Int!): TimeSheet @isAuthenticated
    toggleTimeSheetMaintain(taskId: Int!): TimeSheet @isAuthenticated
    updateTimesheet(id: ID!, startedOn: String, endedOn: String): Boolean
      @hasAccess(slug: "timesheet", scope: "edit")
    updateMaintananceTask(params: TaskInput): Boolean
      @hasAccess(slug: "tasks", scope: "edit")
    deleteTimesheet(id: Int!): Boolean
      @hasAccess(slug: "timesheet", scope: "delete")
    deleteMaintananceTask(id: Int!): Boolean
      @hasAccess(slug: "tasks", scope: "delete")
    createTodoItem(tododata: [TodoItemInput]): [TodoItem]
    saveTodos(data: templateInput): TodoTemplate
    chekedTodo(id: Int, isCheked: Boolean): Boolean
    deleteTodo(id: Int): Boolean
    deleteRecentTodos(taskId: ID): Boolean
  }
`

module.exports = schema
