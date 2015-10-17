// Content script. Used purely to proxy communication between Hudl page and extension pages.

// Note: the page is not communicating directly with the extension pages as outlined
// at http://developer.chrome.com/extensions/messaging.html#external-webpage because the
// externally_connectable manifest setting requires domain matches to be specified in the
// manifest file, and this would complicate allowing local dev machine names besides localhost
// (without adding them to the manifest)

// This wrapper shouldn't be necessary given the sandboxing of content scripts, but it makes refactoring with ReSharper easier
(function() {

  var channel = 'my-custom-browser-tools-message',
    port = chrome.runtime.connect({
      name: 'content-proxy'
    }),
    sender = 'content-script';

  function immediateHandleRequest(message) {
    if (message.request) {
      var request = message.request;

      function reply(data) {
        postMessageToWindow({
          sender: sender,
          response: {
            forRequest: request.id,
            data: data
          }
        });
      }

      if (request.type === 'confirm-extension-loaded') {
        reply(true);
        return true;
      }
    }
    return false;
  }

  function postMessageToWindow(message) {
    // wrap message in wrapper for filtering
    window.postMessage({
      sender: sender,
      channel: channel,
      content: message
    }, '*');
  }

  window.addEventListener('message', function(event) {
    var wrapper = event.data;
    // only listen to messages from page marked for use by this extension
    if (!wrapper || wrapper.channel !== channel || wrapper.sender === sender) return;

    var message = wrapper.content;

    if (!immediateHandleRequest(message)) {
      port.postMessage(message);
    }
  }, false);

  port.onMessage.addListener(postMessageToWindow);

  localStorage['custom-browser-tools-chrome-extension-installed'] = JSON.stringify(true);
}());
