import WindowMessagingConnector from './window-messaging-connector';

// Connector for a top-level page (not iframe) whose window is used as the
// messaging object
class PageMessagingConnector extends WindowMessagingConnector {
  constructor(name) {
    super(name, window);
  }
}

export default PageMessagingConnector;
