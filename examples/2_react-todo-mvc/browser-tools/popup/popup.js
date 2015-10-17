console.log('test from popup');

(function() {
  debugger;
  document.write(0);
  var Connector = window['custom-browser-tools-popup-connector'];
  document.write(1);
  try {
    var connector = new Connector();
    document.write(2);

    connector.messages.trigger('popup-loaded');
  } catch (e) {
    console.error(e);
  }
}());
