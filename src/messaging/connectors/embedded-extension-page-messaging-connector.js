/* global chrome:false */
import MessagingConnector from './messaging-connector';

// extension-to-extension message connector that talks to the background page for dispatching events
class EmbeddedExtensionPageConnector extends MessagingConnector {
  constructor({name, extensionId}) {
    if (!extensionId) {
      throw new Error('chromeExtensionId not defined but using extension page connector.');
    }

    super(name);

    const port = chrome.runtime.connect(extensionId, {
      name: name,
    });

    this.postMessage = function(message) {
      port.postMessage(message);
    };

    this.onMessage = function(handler) {
      port.onMessage.addListener(handler);
    };
  }
}

export default EmbeddedExtensionPageConnector;
