import Connector from './connector';
import PageMessagingConnector from '../messaging/connectors/page-messaging-connector';

class PageConnector extends Connector {
  constructor({paths}) {
    super(new PageMessagingConnector('app'));

    function getFullUrl(partialPath) {
      var link = document.createElement('a');
      link.href = partialPath;
      return link.href;
    }

    this.messages.handleRequest('content-page-urls', function(data, respond) {
      respond({
        popup: getFullUrl(paths.popup),
        devToolsPanel: getFullUrl(paths.devToolsPanel),
      });
    });

    this.messages.on('proxied-console-log', function(e, log) {
      console[log.method].apply(console, log.args);
    });

  }

  extensionLoaded() {
    return this.messages.request('confirm-extension-loaded', null, {
      timeout: 1000,
    });
  }

}

export default PageConnector;
