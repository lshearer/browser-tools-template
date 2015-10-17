import ToolPageConnector from './tool-page-connector';

class PopupConnector extends ToolPageConnector {
  constructor({extensionId = null}) {
    super({
      name: 'popup',
      extensionId,
    });
  }
}

export default PopupConnector;
