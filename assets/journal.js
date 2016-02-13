// Generated by CoffeeScript 1.10.0
(function() {
  var EntryStore, create, entry_store, initialize, json_request, main, mount_entries, tag, view;

  entry_store = false;

  json_request = window.Common.json_request;

  initialize = function() {
    console.log('Journal: initializing');
    if (typeof html5 !== "undefined" && html5 !== null) {
      html5.addElements('entries entry');
    }
    initialize = function() {
      return false;
    };
    return true;
  };

  mount_entries = function(root) {
    return console.log("Appending entries to", root);
  };

  view = function(datestr) {
    var date;
    date = moment(datestr, 'YYYY-MM');
    document.title = (date.format('MMM YYYY')) + " / journal";
    $("#habits-link").attr("href", "/habits#from/" + (date.format('YYYY-MM')) + "/0");
    return $.get("/journal/entries/date?date=" + datestr, function(entries) {
      console.log("View date", entries);
      return riot.mount('entries', {
        title: date.format('MMM YYYY'),
        date: date,
        entries: entries,
        mount_entries: function(root) {
          return console.log($(this.root).find('entry-days'));
        }
      });
    });
  };

  tag = function(name) {
    return $.get("/journal/entries/tag/" + name, function(entries) {
      console.log("View tag " + name);
      return riot.mount('entries', {
        title: name,
        entries: entries,
        thunk: mount_entries
      });
    });
  };

  create = function(date) {
    return $.post("/journal/new?date=" + date, function() {
      return view(moment(date, 'YYYY-MM-DD').format('YYYY-MM'));
    });
  };

  EntryStore = (function() {
    function EntryStore() {
      riot.observable(this);
      this.on('journal-update', this.journal_update);
      this.on('add-tag', this.add_tag);
      this.on('remove-tag', this.on_remove_tag);
      this.on('browse-tag', this.on_browse_tag);
    }

    EntryStore.prototype.journal_update = function(entry) {
      return $.ajax(json_request({
        url: "/journal/update",
        success: function(data) {
          return true;
        },
        data: entry
      }));
    };

    EntryStore.prototype.add_tag = function(entry_id, tag) {
      return $.post({
        url: "/journal/add-tag/" + entry_id + "/" + tag
      });
    };

    EntryStore.prototype.on_remove_tag = function(entry_id, tag) {
      return $.post({
        url: "/journal/remove-tag/" + entry_id + "/" + tag
      });
    };

    EntryStore.prototype.on_browse_tag = function(name) {
      return riot.route("tag/" + name);
    };

    return EntryStore;

  })();

  main = function() {
    var socket;
    initialize();
    entry_store = new EntryStore;
    RiotControl.addStore(entry_store);
    $("#journal-new-entry-date").datepicker({
      onSelect: function(datestr) {
        var date;
        date = moment(datestr, "MM/DD/YYYY");
        return create(date.format('YYYY-MM-DD'));
      }
    });
    riot.route(function(action, date) {
      switch (action) {
        case 'view':
          return view(date);
        case 'tag':
          return tag(date);
        case '':
          return riot.route("view/" + (moment().format('YYYY-MM')));
        default:
          return true;
      }
    });
    riot.route.base("/journal#");
    riot.route.start(true);
    if (!(window.location.hash.length > 2)) {
      riot.route("view/" + (moment().format('YYYY-MM')));
    }
    return socket = window.Common.make_socket("journal/sync", function(m) {
      var entry;
      entry = $.parseJSON(m.data);
      if ($("#entry-" + entry.ID).length) {
        return RiotControl.trigger("journal-updated", entry);
      }
    });
  };

  window.Journal = {
    initialize: initialize,
    main: main,
    entry_store: entry_store
  };

}).call(this);

//# sourceMappingURL=journal.js.map
