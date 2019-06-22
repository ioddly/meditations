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
  tasksByDate(date: String!, includeYear: Boolean!): TasksByDateResponse
}

# Task events

type UpdatedTasksEvent {
  sessionId: String!
  updatedTasks: [Task!]
}

type TaskPositionEvent {
  sessionId: String!
  id: Int!
  # old position
  oldPosition: Int!
  oldDate: String!
  # new position
  newPosition: Int!
  newDate: String!
}

type AddTaskEvent {
  sessionId: String!
  newTask: Task!
}

# updated task order
type UpdatedTaskOrder {
  id: String!
  date: String!
  position: Int!
}

type UpdatedOrderEvent {
  sessionId: String!
  updates: [UpdatedTaskOrder]
}

input InputTaskMinutes {
  id: Int!
  scope: Int
  minutes: Int
}

input InputTaskCycleStatus {
  id: Int!
  status: Int!
}

input InputTaskNew {
  name: String!
  date: String!
  scope: Int!
}

input InputTaskPosition {
  id: Int!
  date: String!
  position: Int!
}

type Mutation {
  updateTask(input: InputTaskMinutes!): UpdatedTasksEvent
  addTask(input: InputTaskNew): AddTaskEvent
  updateTaskMinutes(input: InputTaskMinutes!): UpdatedTasksEvent
  updateTaskStatus(input: InputTaskCycleStatus!): UpdatedTasksEvent
  updateTaskPosition(sessionId: String!, input: InputTaskPosition!): UpdatedTasksEvent
}

type Subscription {
  taskEvents: UpdatedTasksEvent
  addTask: AddTaskEvent
}`
