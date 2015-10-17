import ToolPageConnector from './tool-page-connector';

class DevToolsPanelConnector extends ToolPageConnector {
  constructor({extensionId = null} = {}) {
    super({
      name: 'dev-tools-panel',
      extensionId,
    });
  }
}

export default DevToolsPanelConnector;
