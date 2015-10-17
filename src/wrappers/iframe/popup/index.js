import $ from 'jquery';
import PopupIcon from './popup-icon';
import PopupWrapper from './popup-wrapper';

import './popup.scss';
import 'jquery-ui/position';

const win = $(window);

function Popup(options) {
  const popupIcon = new PopupIcon();
  let popupWrapper;

  $(popupIcon).on('click', function() {
    if (!popupWrapper) {
      popupWrapper = new PopupWrapper(options).show(popupIcon);
      popupIcon.elem.addClass('selected');
      $(popupWrapper).one('close', function() {
        popupWrapper = null;
        popupIcon.elem.removeClass('selected');
      });
    }
  });
  win.on('resize', function() {
    if (popupWrapper) {
      popupWrapper.close();
    }
  });
  popupIcon.elem.on('dragstart', function() {
    if (popupWrapper) {
      popupWrapper.close();
    }
  });

  this.show = function() {
    popupIcon.show();
  };

  this.close = function() {
    if (popupWrapper) {
      popupWrapper.close();
    }
    popupIcon.close();
  };
}

export default Popup;
