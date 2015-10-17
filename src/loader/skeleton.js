/* global __webpack_public_path__:true */
// TODO - remove keymaster dependency and just do raw JavaScript to lessen dependencies in the skeleton
import keymaster from 'keymaster';
import CallbackQueue from '../util/callback-queue';
import { shortcutKeys } from '../connectors/settings';

const lazyLoadTimeout = 5000;

const extensionInstalledStorageKey = 'hudl-inspector-chrome-extension-installed';
const inspectorActiveStorageKey = 'hudl-inspector-active';

function processConfig(config) {
  if (!config || !config.paths || !config.paths.scripts) {
    throw new Error('Expecting configuration with `paths.scripts` property set to the ' +
      'path of the `hudl-inspector/dist` directory, as viewed from the browser.');
  }

  // http://webpack.github.io/docs/configuration.html#output-publicpath
  // set public path so scripts can be properly lazy-loaded
  __webpack_public_path__ = config.paths.scripts; // eslint-disable-line camelcase

  return config;
}

class Skeleton {
  constructor() {
    const onLoadedCallbacks = new CallbackQueue();
    const onLoadStartCallbacks = new CallbackQueue();

    let inspectorIsActive = false;
    let useExtension = false;
    let inspectorIsActivated = false;

    function init(config) {
      function activateInspector() {
        if (inspectorIsActivated) return;

        inspectorIsActivated = true;

        onLoadStartCallbacks.resolve(callback => callback());

        function loadPageConnector() {
          return new Promise(function(resolve, reject) {
            require.ensure([], function() {
              const PageConnector = require('../connectors/page-connector');
              const pageConnector = new PageConnector({
                paths: config.paths,
              });

              onLoadedCallbacks.resolve(callback => callback(pageConnector));

              resolve(pageConnector);
            }, 'page-connector');
            setTimeout(() => reject(new Error(`Timeout: Failed to load page connector within ${lazyLoadTimeout} ms.`)),
              lazyLoadTimeout);
          });
        }

        function initIFrameWrapper() {
          return new Promise(function(resolve, reject) {
            require.ensure([], function() {
              const IFrameWrapper = require('../wrappers/iframe');

              const wrapper = new IFrameWrapper({
                paths: config.paths,
              });
              let isActive = false;

              function toggle() {
                wrapper[isActive ? 'hide' : 'show']();
              }

              function updateIsActive(isActiveValue) {
                isActive = isActiveValue;
                if (window.localStorage) {
                  localStorage[inspectorActiveStorageKey] = JSON.stringify(isActive);
                }
              }

              wrapper.on({
                show: updateIsActive.bind(null, true),
                hide: updateIsActive.bind(null, false),
              });

              // open and save state
              toggle();
              keymaster(shortcutKeys.toggleIFrame, () => toggle());

              resolve();
            }, 'iframe-wrapper');
            setTimeout(() => reject(new Error(`Timeout: Failed to load iframe wrapper within ${lazyLoadTimeout} ms.`)),
              lazyLoadTimeout);
          });
        }
        if (useExtension) {
          // just load main and then verify that the extension is active
          loadPageConnector().then(function(pageConnector) {
            return pageConnector.extensionLoaded().catch(function() {
              console.warn('Expecting extension to be active. Falling back to iframe wrapper.');

              if (window.localStorage) {
                delete localStorage[extensionInstalledStorageKey]
                ;
              }

              return initIFrameWrapper();
            });
          });
        } else {
          // no extension, just skip right to the iframe wrapper
          Promise.all([loadPageConnector(), initIFrameWrapper()])
            .catch(function(err) {
              console.error(err);
              console.error('Failed to load Hudl Inspector with iframe wrapper.');
            });
        }
      }

      if (window.localStorage) {
        const extensionInstalled = localStorage[extensionInstalledStorageKey];
        if (extensionInstalled && JSON.parse(extensionInstalled)) {
          useExtension = true;
        }
        const inspectorActive = localStorage[inspectorActiveStorageKey];
        if (inspectorActive && JSON.parse(inspectorActive)) {
          inspectorIsActive = true;
        }
      }

      if (inspectorIsActive || useExtension) {
        activateInspector();
      } else {
        // listen for shortcut to load full inspector code and wrappers
        keymaster(shortcutKeys.toggleIFrame, function() {
          activateInspector();
        });
      // hotkeys(doc).on('keydown', shortcutKeys, activateInspector);
      }
    }

    this.init = config => init(processConfig(config));
    this.onLoadStart = onLoadStartCallbacks.add;
    this.onLoaded = onLoadedCallbacks.add;
  }
}

export default Skeleton;
