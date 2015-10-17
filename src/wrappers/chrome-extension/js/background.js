// This is the page that runs in the background, beginning when the extension is installed. It will serve as
// the central hub for messaging between other extension pages.

function getMySitesFilterCriteria() {

  var localDevHosts = chrome.i18n.getMessage('site_local_dev_hosts');
  if (!localDevHosts) {
    throw new Error('Missing messages.json key "site_local_dev_hosts".');
  }
  var siteHostSuffixes = chrome.i18n.getMessage('site_host_suffixes');
  if (!siteHostSuffixes) {
    throw new Error('Missing messages.json key "site_host_suffixes".');
  }

  var urlFilters = [];

  localDevHosts.split(',').forEach(function(hostAndPort) {
    var results = /(.*):(\d*)/.exec(hostAndPort);
    var host = results[1];
    var port = results[2];
    if (!port) {
      throw new Error('"site_local_dev_hosts" setting must include port numbers.');
    }

    urlFilters.push({
      hostEquals: host,
      ports: [parseInt(port)]
    });
  });

  siteHostSuffixes.split(',').forEach(function(hostSuffix) {
    urlFilters.push({
      hostSuffix: hostSuffix
    });
  });
  return {
    url: urlFilters
  };
}

chrome.webNavigation.onCommitted.addListener(function(details) {
  console.debug('webnavigation oncommitted', details.url, details);
}, {});

// Show the page action for pages on my website
chrome.webNavigation.onCommitted.addListener(function(details) {
  // TODO allow configuring exclusion patterns to filter out unwanted subdomains, etc.

  // For my website pages, show the page action and dynamically inject the content script
  chrome.pageAction.show(details.tabId);
  chrome.tabs.executeScript(details.tabId, {
    file: 'js/content.js',
    runAt: 'document_start'
  });
}, getMySitesFilterCriteria());

// This is the first process, so we'll use it to manage all messaging connections

// Track all connected ports
// Note: this can be stored as a global variable because the event page will not be closed until all ports have been closed
var activeTabId = null;
var ports = [];
var portToTabId = {};

chrome.tabs.onActivated.addListener(function(activeInfo) {
  activeTabId = activeInfo.tabId;
});


function broadcastMessage(msg, originatingPort) {
  // Broadcast message back to all other ports associated with the same tab

  // If originatingPort is null (internal call from background page), assume active tab
  var currentTabId = originatingPort ? portToTabId[originatingPort.portId_] : activeTabId;
  ports.forEach(function(p) {
    // don't send back to same port
    if (p === originatingPort) return;

    // only post to ports with same tabId
    var tabId = portToTabId[p.portId_];
    if (tabId === currentTabId) {
      console.debug('echoing message: ', originatingPort, msg, p);
      p.postMessage(msg);
    }
  });
}

var onMessageHandlers = [];

function onBroadcastingPortConnected(port) {
  port.onMessage.addListener(function(msg) {
    broadcastMessage(msg, port);
    onMessageHandlers.forEach(function(handler) {
      handler(msg);
    });
  });

  port.onDisconnect.addListener(function() {
    // remove port from list
    ports = ports.filter(function(val) {
      return val !== port;
    });
    delete portToTabId[port.portId_]
    ;
  });
  ports.push(port);
  portToTabId[port.portId_] = activeTabId;
}

// Listen for persistent connections from webpages (e.g., iframe embedded in popup and DevTools panel)
chrome.runtime.onConnectExternal.addListener(onBroadcastingPortConnected);

// Listen for persistent connections from extension pages
chrome.runtime.onConnect.addListener(onBroadcastingPortConnected);

// Listen to single-instance messages from extension pages. These are used for requesting
// data that is otherwise unaccessible.
chrome.runtime.onMessage.addListener(function(message, sender, respond) {
  if (!message) {
    throw new Error('Unexpected empty message.');
  }

  if (message.query === 'getContentPageUrl') {
    getContentPageUrl(message.data.pageName, respond);
    // Keep the channel open for an async response
    return true;
  } else if (message.query === 'getContentPageUrls') {
    getContentPageUrls(respond);
    // Keep the channel open for an async response
    return true;
  } else {
    console.error('Unexpected message.', message);
  }
});

// Get the full URL for a content page to display in an embedded iframe
// TODO - make these configurable through extension options or by requesting data from the webpage, instead of
// pulling from i18n messages.json data that is compiled into the extension and can't be changed once published.
function getContentPageUrl(pageName, callback) {
  getActiveTabHost(function(host) {
    var extensionId = chrome.runtime.id;
    var messagesKey = (pageName + '-path').replace(/-/g, '_');
    var path = chrome.i18n.getMessage(messagesKey);
    if (!path) {
      throw new Error('Could not find path for pageName. Looking for key "' + messagesKey + '" in messages.json.');
    }
    if (!/^\//.test(path)) {
      throw new Error('Content page path must be host-relative, e.g., "/path/to/content/page". Path:' + path);
    }
    path = path.replace('{extensionId}', extensionId);
    var src = host + path;
    callback(src);
  });
}

function getActiveTabHost(callback) {
  chrome.tabs.query({
    active: true
  }, function(tabs) {
    console.debug('background tabs query. tabs.length:', tabs.length, tabs);

    var activeTab = tabs[0];
    if (!activeTab) {
      throw new Error('Active tab not found. Expecting an active tab.');
    }
    var host = /(https?:\/\/.*?)\//.exec(activeTab.url)[1];
    if (!host) {
      throw new Error('Unexpected URL. Cannot parse host.');
    }
    callback(host);
  });
}

function getContentPageUrls(callback) {
  sendRequest('content-page-urls', null, callback);
}

var internalRequestId = 0;
function sendRequest(type, data, callback) {
  // Create unique ID
  var requestId = 'background-internal-' + (++internalRequestId);

  // Send request message to all ports
  broadcastMessage({
    sender: 'background-internal',
    request: {
      id: requestId,
      type: type,
      data: data
    },
  }, null);

  // Create a handler callback to check all incoming messages for the response
  var responseTempMessageHandler = function(msg) {
    if (msg.response && msg.response.forRequest === requestId) {
      // Handler is a response for this request
      onMessageHandlers = onMessageHandlers.filter(function(handler) {
        return handler !== responseTempMessageHandler;
      });
      // Stop listening to incoming messages
      callback(msg.response.data);
    }
  };

  // Start using the response handler
  onMessageHandlers.push(responseTempMessageHandler);
}
