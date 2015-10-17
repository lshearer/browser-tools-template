import WindowMessagingConnector from './window-messaging-connector';

class IframeMessagingConnector extends WindowMessagingConnector {
  constructor(name) {
    super(name, window.parent, true);
  }
}

export default IframeMessagingConnector;
