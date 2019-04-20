export const typeDefs = `
enum TaskScope {
  DAY,
  MONTH,
  YEAR
}

type Task {
  id: Int!
  name: String!
  created_at: String!
  updated_at: String
  date: String
  status: Int
  scope: Int
  position: Int
  minutes: Int
  comment: String
  completion_rate: Int
  total_tasks: Int
  completed_tasks: Int
}

type TasksByDateResponse {
  Days: [Task]
  Month: [Task]
  Year: [Task]
}

type Query {
  tasks: [Task]
  tasksInMonth(date: String!): [Task]
  tasksInYear(date: String!): [Task]
  tasksByDate(date: String!, includeYear: Boolean!): TasksByDateResponse
}

# type TaskEvent {
#   updatedTasks: [Task]
# }

# Task events

type UpdatedTasksEvent {
  updatedTasks: [Task!]
}

type AddTaskEvent {
  sessionId: Int!
  newTask: Task!
}

union TaskEvent = UpdatedTasksEvent | AddTaskEvent

input InputTaskMinutes {
  id: Int!
  scope: Int
  minutes: Int
}

input InputTaskNew {
  name: String!
  date: String!
  scope: Int!
}

type Mutation {
  updateTask(input: InputTaskMinutes!): UpdatedTasksEvent
  addTask(sessionId: Int!, input: InputTaskNew): AddTaskEvent
  newSubscriptionSession: Int!
}

type Subscription {
  taskEvents: TaskEvent
}`
