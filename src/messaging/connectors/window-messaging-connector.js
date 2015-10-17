import $ from 'jquery';
import MessagingConnector from './messaging-connector';

// identifier to filter out messages posted by other scripts
const channel = 'my-custom-browser-tools-message';

// <summary>Base for page messaging connectors that use two-way messaging via window.postMessage and window.onMessage.</summary>
class WindowMessagingConnector extends MessagingConnector {
  constructor(senderName, messagingWindow /* , ignoreContentScript*/ ) {
    super(senderName);
    const incomingMessageCallbacks = $.Callbacks();

    $(messagingWindow).on('message', function(e) {
      const wrapper = e.originalEvent.data;

      // only listen to messages from page marked for use by this extension
      if (!wrapper || wrapper.channel !== channel || wrapper.sender === senderName) return;

      const message = wrapper.content;
      if (!message) {
        console.error('Empty message received');
        return;
      }

      incomingMessageCallbacks.fire(message);
    });


    this.postMessage = function(message) {
      messagingWindow.postMessage({
        sender: senderName,
        channel: channel,
        content: message,
      }, '*');
    };

    this.onMessage = incomingMessageCallbacks.add;
  }
}
export default WindowMessagingConnector;
