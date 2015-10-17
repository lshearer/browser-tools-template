(function(root) {

  function ChangesTracker(options) {
    var messages = options.connector.messages;
    var elem = options.elem;


    var awyiss = $('<div id="awyiss">').appendTo('body').hide();
    var getTodosButton = $('<button>').text('Get Todos').appendTo(elem);
    var trackChangesButton = $('<button>').text('Track Changes').appendTo(elem);
    var clearButton = $('<button>').text('Clear').appendTo(elem);

    var list = $('<ul>').appendTo(elem);

    function diffTodos(oldTodos, newTodos) {
      if (oldTodos.length === newTodos.length) {
        // No changes
        return null;
      }

      if (newTodos.length > oldTodos.length) {
        // Todo added
        return {
          added: newTodos.filter(function(newTodo) {
            return !oldTodos.some(function(oldTodo) {
                return newTodo.id === oldTodo.id;
              });
          })
        };

      } else {
        // Todo removed
        return {
          removed: oldTodos.filter(function(oldTodo) {
            return !newTodos.some(function(newTodo) {
                return oldTodo.id === newTodo.id;
              });
          })
        };
      }
    }

    getTodosButton.click(function() {
      messages.request('current-todos').then(function(todos) {
        var messages = todos.map(function(todo) {
          return todo.title;
        }).join(', ');

        $('<li>').text('current todos: ' + (messages || '(empty)')).appendTo(list);
      });
    });

    trackChangesButton.click(function() {
      trackChangesButton.prop('disabled', true);


      function logChange(actionName, todos) {
        var description = todos.map(function(todo) {
          return todo.title;
        }).join(', ');

        $('<li>').text(actionName + ': ' + description).appendTo(list);
      }

      messages.request('current-todos').then(function(todos) {

        var previousTodos = todos;

        // Start logging all changes
        messages.on('todos-updated', function(e, data) {
          var todos = data.todos;

          var changes = diffTodos(previousTodos, todos);

          if (changes) {
            var message;
            if (changes.added) {
              logChange('todo added', changes.added);
            } else if (changes.removed) {
              logChange('todo removed', changes.removed);
            }
          }

          previousTodos = todos;

          var hasBreadcrumbs = data.todos.some(function(todo) {
            return /breadcrumbs/i.test(todo.title);
          });

          awyiss.toggle(hasBreadcrumbs);
        });
      });
    });

    clearButton.click(function() {
      list.empty();
    });
  }

  root.ChangesTracker = ChangesTracker;
}(this));
