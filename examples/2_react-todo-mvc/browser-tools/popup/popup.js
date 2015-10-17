(function() {
  var Connector = window['custom-browser-tools-popup-connector'];

  var connector = new Connector();

  connector.messages.trigger('popup-loaded');

}());
