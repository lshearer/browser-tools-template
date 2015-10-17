(function($) {
  var toolsLoader = window['custom-browser-tools-loader'];

  toolsLoader.init({
    paths: {
      scripts: '../../dist/',
      // Paths are in context of the host page (not this file). These are probably best
      // as host-relative (e.g., `/browser-tools/popup`), but this allows for more flexibility
      // in demo file structure
      devToolsPanel: 'browser-tools/tools-panel',
      popup: 'browser-tools/popup'
    }
  });

  toolsLoader.onLoaded(function(tools) {
    tools.messages.on('popup-loaded', function(e) {
      console.debug('popup loaded');
    });
  });
}(jQuery));
