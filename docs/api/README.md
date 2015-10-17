# API docs

The browser tools API is still relatively small, but there are a few key items you'll need to be aware of.


## Loader
An instance of the loader is exported by the module in `loader.js`. It provides access to a connector for the webapp. Because the bulk of the browser tools are lazy-loaded, access to the connector and its API must be contained within the `onLoaded` callback.

#### `loader.init(config)`
Initializes the loader with a given configuration. This starts listening for the keyboard shortcut to toggle the browser tools (iframe fallback) or loads the connector and content immediately if the Chrome extension is installed.

##### `config` properties
- `paths` - An object containing several URL paths. All paths are interpreted in respect to the webapp page itself.
  - `scripts` - This contains the path to the `dist` directory output by the build process of this repo's content. This is used to point to scripts that need to be lazy-loaded.
  - `devToolsPanel` - This is the path to load your custom DevTools panel page. This should be page- or domain-relative to ensure there are not cross-domain issues.
  - `popup` - This is the path to load your custom popup page. This should be page- or domain-relative to ensure there are not cross-domain issues.
  }

#### `loader.onLoaded(callback)`
This is triggered when the browser tools have been activated and the connector has been loaded. `callback` has a signature of `function(connector){}`, where connector is an API connector.

#### `loader.onLoadStart(callback)`
This is triggered when the inspector is activated, but not necessarily loaded yet. It can be used to lazy-load additional resources onto the webapp's page that can be used for a richer on-page experience without the additional page weight on normal webapp usage. `callback` is called with no arguments.


## API Connector
An API connector (or just connector) provides access to the actual browser tools APIs. Each component (the webapp page, popup content page, and DevTools panel page) all interact via connectors that have the same API.

_Note: This API is fairly minimal at the moment, but is intended to be expanded with additional shared components like `storage` and `config`._

### `messages`
E.g., `connector.messages`

Access to the messaging API, the core means of interacting between components. The API supports broadcasted pub/sub events, as well as an async request/response format. Messages are broadcast to all other listening connectors (i.e., you cannot specify a specific target or page for each message). Any data passed will be serialized/deserialized as JSON.

#### `messages.on(name, handler)`
Subscribes to events with the given `name`. `handler` has a signature of `function(e, data){}` where `e` is the entire message object (can be generally ignored) and `data` is any additional data included with the event.

#### `messages.trigger(name [, data])`
Publishes a message with the given `name`. Optionally, additional data can be passed to the handler functions.

#### `messages.handleRequest(name, handler)`
Registers a handler for requests of the given `name`. These names do not collide with pub/sub event names. `handler` has a signature of `function(data, respond){}`, where `data` is optional data passed with the request and `respond` is an async callback function that should be called with a single argument, the response data.

_Note: If multiple handlers are registered for the same request `name`, the first to respond will be used._

#### `messages.request(name [, data, options])`
Sends a request with the given `name` and returns a Promise to be resolved with the response data. An optional `data` object can be included with the request. `options` can be included to alter request behavior.
- `options` properties
  - `timeout` - The amount of time to wait for a response before rejecting with a timeout, in milliseconds. Defaults to `5000`.
