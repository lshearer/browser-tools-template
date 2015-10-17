## Getting started

To use the browser tools in a webapp, there are four basic components required:
1. Including the loader script within your webapp and initializing it.
2. Creating a content page to be displayed as the popup.
3. Creating a content page to be displayed as the DevTools panel.

In addition to these snippets, browse the examples to see how the components are included. Note that the examples (including these snippets)
try to be relatively simple, so no script loader/compiler/bundler is used in them. However, the browser tools core scripts
are exported as UMD files, so they can be easily imported as _either_ globals or as RequireJS/Webpack/Browserify-compatible modules.

### Initializing the loader

First, the `loader.js` file must be imported (the exported UMD modules are not committed to git and can be generated using `gulp watch` or `npm start`).
```html
<html>
<head>
  <title>Browser tools package example</title>
</head>
<body>
  This is an extremely boring page.

  <!-- Initialize browser tools loader -->
  <script src="../../dist/loader.js"></script>
  <script src="browser-tools/init.js"></script>

  <script src="js/app/index.js"></script>
</body>
</html>

```

Then, the loader must be initialized

```js
// browser-tools/init.js
(function(){
  // Using this in a standard, global export context. The default prefix for each component is `custom-browser-tools-`.
  // This grabs a reference to the loader, which lazy-loads more content on demand.
  var tools = window["custom-browser-tools-loader"];

  // The loader must be initialized with a configuration
  tools.init({
    paths: {
      // This is the path to the `dist` directory for this repo, respective to your webpage
      scripts: '../../dist/',

      // These paths are for the content pages. They are also respective to your webpage, and can be relative or absolute, although
      // it's recommended that they are not full absolute paths in order to ensure that your webapp and content pages are served
      // from the same domain for cross-domain issues, as well as allowing for prod vs. test vs. local environments.
      devToolsPanel: 'browser-tools/tools-panel',
      popup: 'browser-tools/popup'
    }
  });

  tools.onLoaded(function(connector){
    console.log('The browser tools are loaded and ready to interact with!');
  });
});
```

### Creating the content pages

How the content pages are served is up to you. However, they should live on the same domain as your webapp. Within the content pages, you'll need to load the respective "connector" to access the browser tools API.

#### Popup initialization

```html
<!-- browser-tools/popup/index.html -->
<html>
<head>
  <title>Browser tools example</title>
</head>
<body>
  Popup stuff!

  <!-- Load browser tools connector -->
  <script src="../../../../dist/popup-connector.js"></script>
  <script src="popup.js"></script>
</body>
</html>
```

```js
// popup.js

// Retrieve the connector class (globals style)
var Connector = window['custom-browser-tools-popup-connector'];

// Instantiate the connector
var connector = new Connector();

// Start interacting with the API

connector.trigger('popup-loaded', {someData: 'I\'m here! Let\'s get this party started!!!'};;

connector.on('some-page-event', function(e, data){
  console.log('The page is doing something!');
});

connector.handleRequest('popup-thing', function(data, respond){
  respond(thePopupThing);
});

```

#### DevTools panel initialization

The DevTools panel initialization is nearly the same as that for the popup; the only changes are the module path and names.

```html
...
  <!-- Load browser tools connector -->
  <script src="../../../../dist/dev-tools-panel-connector.js"></script>
...
```

```js
...
// Retrieve the connector class (globals style)
var Connector = window['custom-browser-tools-dev-tools-panel-connector'];

// Instantiate the connector
var connector = new Connector();
...

```

### Using the API
Once the webapp page and content pages are set up, you can start adding features and interactivity using the browser tools' [API](api).
