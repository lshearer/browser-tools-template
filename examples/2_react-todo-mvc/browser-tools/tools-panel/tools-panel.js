(function($) {
  // Grab a reference to the respective connector class
  var Connector = window['custom-browser-tools-dev-tools-panel-connector'];
  var ChangesTracker = window.ChangesTracker;

  // Instantiate the connector
  var connector = new Connector();

  var tracker = new ChangesTracker({
    connector: connector,
    elem: $('#track-changes')
  });

}(jQuery));
