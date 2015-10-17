(function() {
  try {
    // Grab a reference to the respective connector class
    var Connector = window['custom-browser-tools-dev-tools-panel-connector'];

    // Instantiate the connector
    var connector = new Connector();

    connector.messages.on('spice-things-up', function() {
      $('<img src="../images/cat-party.gif">').appendTo('body');
    });

  } catch (e) {
    document.write('error:' + e);
  }
}());
