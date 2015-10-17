class MessagingConnector {
  constructor(name) {
    if (!name) {
      throw new Error('No name specified for messaging connector.');
    }

    this._name = name;
  // TODO ensure interface requirements on instantiation
  }

  getName() {
    return this._name;
  }
}

export default MessagingConnector;
