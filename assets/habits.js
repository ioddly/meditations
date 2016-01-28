// Generated by CoffeeScript 1.10.0
(function() {
  var Scope, Status, TaskStore, browse, current_bucket, current_date, initialize, json_request, main, task_store;

  current_date = false;

  current_bucket = false;

  task_store = false;

  json_request = window.Common.json_request;

  Scope = {
    bucket: 0,
    day: 1,
    month: 2,
    year: 3,
    wrap: 4,
    bucketp: function(scope) {
      return scope === Scope.bucket || scope > Scope.year;
    }
  };

  Status = {
    unset: 0,
    complete: 1,
    incomplete: 2,
    wrap: 3
  };

  TaskStore = (function() {
    function TaskStore() {
      var command, remount, self;
      riot.observable(this);
      self = this;
      self.on('comment-update', function(task, comment) {
        return $.ajax(json_request({
          url: "/habits/comment-update",
          success: function() {
            return false;
          },
          data: comment
        }));
      });
      self.on('task-new', function(scope, task_name, date) {
        return $.ajax(json_request({
          url: "/habits/new",
          success: function() {
            return self.mount_scope(scope.scope, date);
          },
          data: {
            name: task_name,
            scope: scope.scope,
            date: date.format("YYYY-MM-DDTHH:mm:ssZ")
          }
        }));
      });
      command = function(path, thunk) {
        return function(task) {
          var req;
          req = {
            type: "POST",
            url: path,
            data: JSON.stringify(task),
            contentType: "application/json; charset=UTF-8",
            success: thunk(task)
          };
          return $.ajax(req);
        };
      };
      self.on('task-delete', command('/habits/delete', function(task) {
        return function() {
          $("#task-" + task.ID).remove();
          return riot.update();
        };
      }));
      self.on('task-update', command('/habits/update', function() {
        return function() {
          return true;
        };
      }));
      remount = function(task) {
        return function() {
          return self.mount_scope(task.scope, task.date);
        };
      };
      self.on('task-order-up', command('/habits/order-up', remount));
      self.on('task-order-down', command('/habits/order-down', remount));
    }

    TaskStore.prototype.mount_scope = function(scope, date, mount) {
      var fetch, fetch_date, ref, self;
      self = this;
      fetch = null;
      if (Scope.bucketp(scope)) {
        return $.get("/habits/in-bucket/" + scope, function(result) {
          var tasks;
          console.log(result);
          scope = result["scope"];
          tasks = result["tasks"];
          return result = riot.mount("#scope-bucket", {
            date: date,
            scope: scope.ID,
            tasks: tasks,
            title: scope["Name"]
          });
        });
      } else {
        if (typeof date === 'string') {
          date = moment.utc(date);
        } else {
          date = date.clone();
        }
        fetch_date = date.clone();
        ref = (function() {
          switch (scope) {
            case Scope.day:
              return ["day", fetch_date, "#scope-day-" + (date.format('DD'))];
            case Scope.month:
              return ["month", fetch_date.date(1), "#scope-month"];
            case Scope.year:
              return ["year", fetch_date.date(1).month(0), "#scope-year"];
          }
        })(), fetch = ref[0], fetch_date = ref[1], mount = ref[2];
        return $.get("/habits/in-" + fetch + "?date=" + (fetch_date.format('YYYY-MM-DD')), function(tasks) {
          var result;
          tasks = tasks || [];
          return result = riot.mount(mount, {
            date: date,
            scope: scope,
            tasks: tasks
          });
        });
      }
    };

    return TaskStore;

  })();

  initialize = function() {
    console.log('Habits: initializing');
    if (typeof html5 !== "undefined" && html5 !== null) {
      html5.addElements('scope task scope-days');
    }
    task_store = new TaskStore();
    window.Habits.task_store = task_store;
    RiotControl.addStore(task_store);
    initialize = function() {
      return false;
    };
    return true;
  };

  browse = function(from, bucket) {
    var today;
    console.log('Browsing from', from);
    today = moment();
    from = moment(from, 'YYYY-MM');
    $("#journal-link").attr("href", "/journal#view/" + (from.format('YYYY-MM')));
    document.title = (from.format('MMM YYYY')) + " / habits";
    current_date = from.clone();
    current_bucket = parseInt(bucket);
    task_store.mount_scope(Scope.month, from);
    task_store.mount_scope(Scope.year, from);
    task_store.mount_scope(current_bucket, from);
    return riot.mount("scope-days", {
      thunk: function() {
        var check, date, next, results;
        date = 1;
        results = [];
        while (date <= from.daysInMonth()) {
          next = from.clone().date(date);
          if (next > today) {
            check = next.clone();
            if (!(check.subtract(4, 'hours') < today)) {
              break;
            }
          }
          task_store.mount_scope(Scope.day, next);
          results.push(date += 1);
        }
        return results;
      }
    });
  };

  main = function() {
    var socket, task_near;
    console.log('Habits: installing router');
    initialize();
    RiotControl.on("change-date", function(forward, scope) {
      var date;
      date = scope.date.clone().date(1);
      date[forward ? 'add' : 'subtract'](1, scope.scope === Scope.month ? 'months' : 'years');
      return riot.route("from/" + (date.format('YYYY-MM')) + "/" + (current_bucket || 0));
    });
    RiotControl.on("change-bucket", function(bucket) {
      return riot.route("from/" + (current_date.format('YYYY-MM')) + "/" + bucket);
    });
    riot.route(function(action, date, bucket) {
      switch (action) {
        case 'from':
          return browse(date, bucket);
        case '':
          return riot.route("from/" + (moment().format('YYYY-MM')) + "/0");
        default:
          return console.log("Unknown action", riot.route.query(), action, date, bucket);
      }
    });
    riot.route.base('/habits#');
    riot.route.start(true);
    if (!(window.location.hash.length > 1)) {
      riot.route("from/" + (moment().format('YYYY-MM')) + "/0");
    }
    task_near = function(task, date2) {
      var date1;
      date1 = moment.utc(task.date);
      return ((task.scope === Scope.month || task.scope === Scope.day) && date1.month() === date2.month() && date1.year() === date2.year()) || (task.scope === Scope.year && date1.year() === date2.year()) || Scope.bucketp(task.scope);
    };
    socket = false;
    return socket = window.Common.make_socket("habits/sync", function(m) {
      var date, task;
      task = $.parseJSON(m.data);
      date = moment.utc(task.date);
      if (task_near(task, current_date)) {
        return task_store.mount_scope(task.scope, date);
      }
    });
  };

  window.Habits = {
    Scope: Scope,
    Status: Status,
    initialize: initialize,
    task_store: task_store,
    main: main
  };

}).call(this);

//# sourceMappingURL=habits.js.map
