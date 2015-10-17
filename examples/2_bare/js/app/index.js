define(function(require) {
  var $ = require('jquery');
  var inspector = require('hudl-inspector-loader');
  inspector.init({
    paths: {
      scripts: '../dist/',
      devToolsPanel: 'tool-panel.html',
      popup: 'popup.html'
    }
  });

  $(function() {
    $('<div>index script!</div>').appendTo('body');
  });
});
