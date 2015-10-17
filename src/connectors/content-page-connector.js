import Connector from './connector';
import IframeMessagingConnector from '../messaging/connectors/iframe-messaging-connector';
import EmbeddedExtensionPageMessagingConnector from '../messaging/connectors/embedded-extension-page-messaging-connector';


class ToolPageConnector extends Connector {
  constructor({name}) {

    var exec = /browserToolsChromeExtensionId=(.*)/.exec(location.href);
    var extensionId = exec && exec[1];

    const messageConnector = extensionId ? new EmbeddedExtensionPageMessagingConnector({
      name,
      extensionId,
    }) : new IframeMessagingConnector(name);

    super(messageConnector);

    function redirectConsole(name, connector) {
      ['debug info warn error'].split(' ').forEach(function(method) {
        var oldMethod = console[method];

        var messagePrefix = devToolsLoggingPrefix + ' [' + connector.getName() + '] ';
        console[method] = function() {
          var args = Array.prototype.slice.call(arguments, 0);
          args.unshift(messagePrefix);
          connector.trigger('proxied-console-log', {
            method: method,
            message: args
          });

          if (oldMethod) {
            oldMethod.apply(console, arguments);
          }
        };
      });
    }

    function logErrors() {
      window.onError = (function(oldOnError) {
        return function(message, url, line, column, error) {
          console.error(message);
          if (oldOnError) {
            oldOnError(message, url, line, column, error);
          }
        };
      }(window.onError));
    }


    if (!!extensionId) {
      // TODO fix bugs here to get these messages forwarding
      // Send messages to the main page's console, mostly for easier DevTools panel debugging
      // redirectConsole(name, messageConnector);
      // logErrors();
    }

    // If we switch pages and the extension-based DevTools panel is open, let's update it to
    // the respective set of tools
    this.messages.on('page-navigated', function(e, data) {
      var urls = data.urls;
      var url;
      if (name === 'dev-tools-panel') {
        url = urls.devToolsPanel;
      } else if (name === 'popup') {
        url = urls.popup;
      }
      if (url) {
        window.location = url;
      }
    });
  }
}

export default ToolPageConnector;
