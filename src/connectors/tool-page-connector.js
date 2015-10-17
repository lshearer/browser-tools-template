import Connector from './connector';
import IframeMessagingConnector from '../messaging/connectors/iframe-messaging-connector';
import EmbeddedExtensionPageMessagingConnector from '../messaging/connectors/embedded-extension-page-messaging-connector';

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

class ToolPageConnector extends Connector {
  constructor({name, extensionId = null}) {

    // const messageConnector = extensionId ? new EmbeddedExtensionPageMessagingConnector({
    //   name,
    //   extensionId,
    // }) : new IframeMessagingConnector(name);

    let isInExtension;
    // If the parent document can be accessed, the pages must be the same protocol, which
    // would exclude an iframe (http://) inside of an extension page (chrome://).
    try {
      window.parent.document;
      isInExtension = false;
    } catch (e) {
      isInExtension = true;
    }

    const messageConnector = isInExtension ? new PageMessagingConnector(name) : new IframeMessagingConnector(name);
    super(messageConnector);

    console.log('usingExtension:' + isInExtension);

    if (isInExtension) {
      // Send messages to the main page's console, mostly for easier DevTools panel debugging
      redirectConsole(name, messageConnector);
      logErrors();
    }
  }
}

export default ToolPageConnector;
