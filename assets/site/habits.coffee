# habits.coffee - habits code

task_store = false
Scope =
  day: 0
  month: 1
  year: 2
  bucket: 3

Status =
  unset: 0
  complete: 1
  incomplete: 2
  wrap: 3

jsonRequest = (data) ->
  ret = $.extend({type: "POST", contentType: "application/json; charset=UTF-8"}, data)
  if ret.data.comment.id == 0
    delete ret.data.comment
  ret.data = JSON.stringify(ret.data)
  return ret

class TaskStore
  mount_scope: (scope, date, mount) ->
    self = this
    fetch = null

    if typeof date == 'string'
      date = moment.utc(date)
    else
      date = date.clone()

    fetch_date = date.clone()

    [fetch, fetch_date, mount] = switch scope
      when Scope.day then ["day", fetch_date, "#scope-day-#{date.format('DD')}"]
      when Scope.month then ["month", fetch_date.date(1), "#scope-month"]
      when Scope.year then ["year", fetch_date.date(1).month(0), "#scope-year"]
      when Scope.bucket then ["bucket", fetch_date, "#scope-bucket"]

    $.get "/habits/tasks/in-#{fetch}?date=#{fetch_date.format('YYYY-MM-DD')}", (tasks) ->
      tasks = tasks or []
      title = switch
        when scope == Scope.day then date.format('Do')
        when scope == Scope.month then date.format('MMMM')
        when scope == Scope.year then date.format('YYYY')
        when scope == Scope.bucket then "Bucket"
      result = riot.mount mount, { date: date, scope: scope, tasks: tasks, title: title }

  constructor: ->
    riot.observable(this)

    self = this

    self.on 'comment-update', (task, comment) ->
      $.post 'habits/comment/update', comment, (saved_comment) ->
        self.trigger 'comment-updated', task, saved_comment

    self.on 'task-new', (scope, task_name, date) ->
      $.ajax jsonRequest
        url: "habits/tasks/new"
        success: () ->
          self.mount_scope scope.scope, date
        data:
          name: task_name
          scope: scope.scope
          date: date.format "YYYY-MM-DDTHH:mm:ssZ"
        
    # Run a command that changes a task, then remount in order to display changes
    remount = (path) ->
      (task) ->
        req = 
          type: "POST"
          url: path
          data: JSON.stringify(task)
          contentType: "application/json; charset=UTF-8"
          success: () ->
            self.mount_scope task.scope, task.date
        $.ajax(req)

    self.on 'task-delete', remount('/habits/tasks/delete')
    self.on 'task-order-down', remount('/habits/tasks/order-down')
    self.on 'task-order-up', remount('/habits/tasks/order-up')
    self.on 'task-update', remount('/habits/tasks/update')

# Navigation

initialize = () ->
  console.log 'Habits: initializing'
  if html5?
    html5.addElements('scope task scope-days')

  task_store = new TaskStore()
  window.Habits.task_store = task_store
  RiotControl.addStore(task_store)

browse_from = (from) ->
  console.log('Browsing from', from)
  today = moment()
  from = moment(from, 'YYYY-MM')
  document.title = "#{from.format('MMM YYYY')} / habits"
  current_date = from.clone()

  task_store.mount_scope Scope.month, from
  task_store.mount_scope Scope.year, from
  #task_store.mount_scope Scope.bucket, from

  # Allow days up to the current date
  # Note: Day <scope> tags must be mounted only after the <scope-days> tag is, thus we pass it a function for doing what we want
  riot.mount("scope-days", {
    thunk: () ->
      date = 1
      while date <= from.daysInMonth()
        next = from.clone().date(date)
        if next > today
          check = next.clone()
          unless check.subtract(4, 'hours') < today 
            break
        task_store.mount_scope Scope.day, next
        date += 1
  })

main = () ->
  console.log 'Habits: installing router'

  initialize()
  current_date = false

  # Install Router
  RiotControl.on "change-date", (forward, scope) ->
    riot.route.exec (action, date) ->
      date = scope.date.clone().date(1)
      date[if forward then 'add' else 'subtract'](1, if scope.scope == Scope.month then 'months' else 'years')
      riot.route "from/#{date.format('YYYY-MM')}"

  riot.route.start(true)
  
  riot.route((action, rest) ->
    switch action
      when 'from' then browse_from(rest)
      else console.log "Unknown action", action)

  riot.route("from/2016-01")

  # Setup websocket
  task_near = (task, date2) ->
    date1 = moment.utc(task.date)
    # only compare down to months because we don't browse by the day
    # Sorry.
    return ((task.scope == Scope.month or task.scope == Scope.day) and date1.month() == date2.month() and 
      date1.year() == date2.year()) or
      (task.scope == Scope.year and date1.year() == date2.year()) or
      task.scope == Scope.bucket

  socket = false
  make_socket = () ->
    url = "ws://#{window.location.hostname}:#{window.location.port}/habits/sync"
    socket = new WebSocket url
    socket.onopen = (m) ->
      console.log "Connected to #{url} websocket"
    socket.onmessage = (m) ->
      console.log "Socket message #{m}"
      task = $.parseJSON(m.data)
      # No need to refresh if task is not in the current scope
      date = moment.utc(task.date)
      console.log task_near(task, current_date), task, current_date
      if task_near(task, current_date)
        task_store.mount_scope task.scope, date
    # Reconnect to socket on failure for development re-loading
    #socket.onclose = () ->
    #  setTimeout(() ->
    #    socket = make_socket()
    #    console.log 'Lost websocket connection, retrying in 10 seconds'
    #  , 10000)
  socket = make_socket()

# Export variables
window.Habits =
  Scope: Scope,
  Status: Status,
  initialize: initialize,
  task_store: task_store
  main: main