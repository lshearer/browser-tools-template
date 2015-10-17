// Code shared between the content-loading pages (DevTools panel and popup pages)

// Loads the embedded content page into the iframe
function loadEmbeddedContentPage(pageName) {
  chrome.runtime.sendMessage({
    query: 'getContentPageUrls',
    data: {
      // pageName: pageName
    }
  }, function(urls) {
    var url = urls[pageName];
    if (!url) {
      throw new Error('URL not found for pageName. ' + JSON.stringify({
          urls: urls,
          pageName: pageName
        }));
    }

    var verbose = JSON.parse(chrome.i18n.getMessage('verbose') || 'false');
    var iframe = document.getElementsByTagName('iframe')[0];
    iframe.src = url;
    iframe.addEventListener("load", function() {
      if (verbose) {
        console.log('Embedded content page loaded: ' + url);
      }
    });
    iframe.addEventListener("error", function() {
      console.error('Embedded content page load error.')
    });
  });
}
