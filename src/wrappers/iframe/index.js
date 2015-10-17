import $ from 'jquery';
import Popup from './popup';
import ToolsPanel from './dev-tools-panel';
import PageMessagingConnector from '../../messaging/connectors/page-messaging-connector';
import MessageController from '../../messaging/message-controller';

class IFrameWrapper {
  constructor({paths}) {
    let toolsPanel; // = new ToolsPanel({ url: '/inspector/toolsPanel' }),
    let popup; // = new Popup({ url: '/inspector/popup' }),
    let isShown = false;

    const $this = $(this);
    const messaging = new MessageController(new PageMessagingConnector('iframe-wrapper'));

    function triggerEvent(name) {
      $this.triggerHandler(name);
    }

    function show() {
      toolsPanel = new ToolsPanel({
        url: paths.devToolsPanel, // '/inspector/toolsPanel'
      });
      popup = new Popup({
        url: paths.popup, // '/inspector/popup'
      });

      popup.show();
      toolsPanel.show();
      isShown = true;
      triggerEvent('show');
    }

    function hide() {
      if (toolsPanel) {
        toolsPanel.close();
        toolsPanel = null;
      }
      if (popup) {
        popup.close();
        popup = null;
      }
      isShown = false;
      triggerEvent('hide');
    }

    function toggle() {
      (isShown ? hide : show)();
    }

    messaging.on('toggle-browser-tools', function() {
      toggle();
    });

    this.show = show;
    this.hide = hide;
    this.on = $this.on.bind($this);
  }
}

export default IFrameWrapper;
