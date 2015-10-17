function proxyConsoleMessagesToPage() {
  // Set up error and console forwarding for debugging (this only works for
  // this extension page, not for the embedded iframe page as well)

  // Adding default message for
  var prefix = chrome.i18n.getMessage('devtools_logging_prefix');
  // Use default prefix so we can ensure logging gets set up
  var devToolsLoggingPrefix = '[' + (prefix || 'My Custom Browser Tools DevTools panel') + ']';
  // Forward console messages to the main page so they will be seen
  ['log', 'debug', 'info', 'warn', 'error'].forEach(function(method) {
    console[method] = function() {
      try {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(devToolsLoggingPrefix);
        chrome.devtools.inspectedWindow.eval('console.' + method + '.apply(console, JSON.parse(unescape(\'' + escape(JSON.stringify(args)) + '\')));');
      } catch (e) {
        chrome.devtools.inspectedWindow.eval('console.error("' + devToolsLoggingPrefix + '"Logging error.");');
      }
    };
  });

  window.onerror = function(e) {
    console.error(e, ['trace:'].concat(printStackTrace({
      e: e
    })).join('\n'));
  };

  if (!prefix) {
    console.warn('Config setting "devtools_logging_prefix" not found in messages.json.');
  }
}

proxyConsoleMessagesToPage();
