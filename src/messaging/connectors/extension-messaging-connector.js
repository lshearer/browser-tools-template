/* global chrome:false */
import MessagingConnector from './messaging-connector';

// Extension-to-extension message connector that talks to the background page for dispatching events
class ExtensionMessagingConnector extends MessagingConnector {

  constructor(name) {
    super(name);
    this._port = chrome.extension.connect({
      name: name,
    });
  }

  postMessage(message) {
    this._port.postMessage(message);
  }

  onMessage(handler) {
    this._port.onMessage.addListener(handler);
  }
}

export default ExtensionMessagingConnector;
