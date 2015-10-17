import $ from 'jquery';
import throttle from 'lodash/function/throttle';

import 'jquery-ui/resizable';

import './panel.scss';

const win = $(window);

// using manual template because this currently is lazy-loaded and not built but hbs is expecting it to be included already
function toolsPanelWrapperTemplate(data) {
  return `<div id="ct-tools-panel-wrapper">
  <div class="resize-wrapper">
    <div class="ui-resizable-handle ui-resizable-n"></div>
    <iframe src="${data.url}"></iframe>
    <div id="iframe-drag-fix"></div>
  </div>
</div>`;
}

function ToolsPanel(options) {
  const self = this;
  const iframeUrl = options.url;
  let elementToPad;
  let oldMargin;
  const cssProperty = 'paddingBottom';

  const elem = $(toolsPanelWrapperTemplate({
    url: iframeUrl,
  }));

  const resizableWrapper = elem.find('.resize-wrapper');

  // mask iframe to prevent capturing of mousemove events when resizing quickly
  const dragFix = elem.find('#iframe-drag-fix').hide();

  function onResize() {
    if (!elementToPad.length) {
      console.error('no element to pad');
      return;
    }
    elementToPad.css(cssProperty, (oldMargin || 0) + resizableWrapper.height());
  }
  function show() {
    // prepending tool panel so it is before the popup elements in the DOM so they are positioned on top of it. there
    // doesn't appear a fix using just z-indexes (something with the fixed positioning)
    elem.prependTo(document.body);
    // this resizing could be better; depends heavily on CSS of individual pages, though
    elementToPad = $(document.body);
    //            elementToPad = $(_.find(elem.siblings().get().reverse(), function(element) {
    //                element = $(element);
    //                return element.is(':visible') && !/absolute|fixed/.test(element.css('position'));
    //            }));
    if (elementToPad.length) {
      // this is relying on only pixel-based margins
      oldMargin = parseInt(elementToPad.css(cssProperty), 10) || 0;
    }
    onResize();
    return self;
  }

  function close() {
    // detach so the draggable setup doesn't get destroyed
    elem.detach();
    if (elementToPad.length) {
      elementToPad.css(cssProperty, oldMargin);
      elementToPad = $();
    }
    return self;
  }

  resizableWrapper.resizable({
    handles: {
      n: '.ui-resizable-handle',
    },
    start: function() {
      dragFix.show();
      resizableWrapper.resizable('option', 'maxHeight', win.height() - 24);
    },
    stop: function() {
      dragFix.hide();
      resizableWrapper.css('width', '');
    },
    resize: throttle(onResize, 200),
    minHeight: 12,
  });

  this.show = show;
  this.close = close;
}

export default ToolsPanel;
