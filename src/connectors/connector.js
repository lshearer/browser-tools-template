import MessageController from '../messaging/message-controller';
import * as settings from './settings';

// This is a means of connecting to other Hudl Inspector components by providing
// various APIs. An instance of this is comparable to the `chrome` namespace for Chrome extensions.
class Connector {
  constructor(messagingConnector) {
    // This interface isn't expected to change often, but potential additions
    // include `storage`, `config`, etc.
    this.messages = new MessageController(messagingConnector);

    // Not sure we'll want to support this settings format in the future, but we
    // need it for now
    this._settings = settings;
  }
}

export default Connector;
