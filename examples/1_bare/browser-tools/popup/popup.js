(function($) {
  var Connector = window['custom-browser-tools-popup-connector'];

  var connector = new Connector();

  connector.messages.trigger('popup-loaded');

  $('<button>').text('Spice things up!').click(function() {
    connector.messages.trigger('spice-things-up');
  }).appendTo($('<div>').appendTo('body'));

}(jQuery));
