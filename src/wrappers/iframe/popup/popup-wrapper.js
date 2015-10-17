import $ from 'jquery';
import ClickWatcher from './click-watcher';

function PopupWrapper(options) {
  const self = this;
  const iframeUrl = options.url;
  const doc = $(document);

  const eventNamespace = 'inspector-popup';
  const elem = $('<div id="ct-popup-wrapper">');
  let clickWatcher;

  const edgeToPosition = {
    top: {
      my: 'right top',
      at: 'right bottom',
    },
    bottom: {
      my: 'right bottom',
      at: 'right top',
    },
    right: {
      my: 'right top',
      at: 'left top',
    },
    left: {
      my: 'left top',
      at: 'right top',
    },
  };

  $('<iframe>').attr('src', iframeUrl).appendTo(elem);

  function close() {
    elem.fadeOut(200, function() {
      elem.remove();
    });
    if (clickWatcher) {
      clickWatcher.stop();
    }
    $(self).triggerHandler('close');
    doc.off('.' + eventNamespace);
    return self;
  }

  function show(icon) {
    const position = edgeToPosition[icon.getSnapEdge()];
    elem.appendTo(document.body).position({
      my: position.my,
      at: position.at,
      of: icon.elem,
    })
      .hide().fadeIn(200);
    clickWatcher = new ClickWatcher(elem, function() {
      close();
    });
    doc.one('scroll.' + eventNamespace, function() {
      close();
    });
    return self;
  }

  this.show = show;
  this.close = close;
}

export default PopupWrapper;
