import Connector from './connector';
import PageMessagingConnector from '../messaging/connectors/page-messaging-connector';

class PageConnector extends Connector {
  constructor({paths}) {
    super(new PageMessagingConnector('app'));

    var pageUrls = {
      popup: paths.popup,
      devToolsPanel: paths.devToolsPanel,
    };

    this.messages.handleRequest('content-page-urls', function(data, respond) {
      respond(pageUrls);
    });

    this.messages.trigger('page-navigated', {
      urls: pageUrls
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
