import $ from 'jquery';
import min from 'lodash/math/min';
import uniqueId from 'lodash/utility/uniqueId';
import each from 'lodash/collection/each';
import delay from 'lodash/function/delay';
import debounce from 'lodash/function/debounce';
import invert from 'lodash/object/invert';

import 'jquery-ui/draggable';

const win = $(window);

function PopupIcon() {
  const elem = this.elem = $('<div id="ct-popup-icon">').append();
  const borderPadding = 6;
  let elementVisible = false;
  const positionLocalStorageKey = 'inspector-popup-position';
  let closestEdge = 'top';
  const eventNamespace = uniqueId('.popup-icon-');
  const defaultIconPosition = {
    top: borderPadding,
    right: borderPadding,
  };

  // prevent iframes and plugins from intercepting mousemove events
  const dragFix = $('<div id="ct-popup-drag-fix">').appendTo(document.body).hide();

  function storePosition() {
    if (!elementVisible) {
      // prevent bad coordinates from getting stored
      return;
    }
    if (window.localStorage) {
      const position = {
        left: elem.css('left'),
        right: elem.css('right'),
        top: elem.css('top'),
        bottom: elem.css('bottom'),
      };
      localStorage[positionLocalStorageKey] = JSON.stringify(position);
    }
  }

  function restorePosition() {
    const position = $.parseJSON(window.localStorage && localStorage[positionLocalStorageKey] || 'null');
    elem.css(position || defaultIconPosition);
  }

  function correctPosition(currentPosition = elem.position()) {
    if (!elementVisible) {
      return;
    }

    // snap to closest edge

    const winWidth = win.width();
    const winHeight = win.height();
    const distances = {
      left: currentPosition.left,
      top: currentPosition.top,
      right: winWidth - (currentPosition.left + elem.width()),
      bottom: winHeight - (currentPosition.top + elem.height()),
    };

    // calculate percentages for a (potentially) more natural snapping; can always revert to just referencing the actual distance
    // const percentDistances = {
    //   left: distances.left / winWidth,
    //   right: distances.right / winWidth,
    //   top: distances.top / winHeight,
    //   bottom: distances.bottom / winHeight,
    // };

    const oppositeEdges = {
      left: 'right',
      right: 'left',
      top: 'bottom',
      bottom: 'top',
    };

    closestEdge = min(invert(distances), function(val, key) {
      return parseFloat(key);
    });

    const finalPosition = {};
    const adjustedCurrentPosition = {};

    // snap to closest edge
    finalPosition[closestEdge] = borderPadding;

    // ensure no other values are less than the border padding - handle case of dragging into a corner
    each(distances, function(distance, edge) {
      if (distance < borderPadding) {
        // we'll animate to fix the closest edge
        finalPosition[edge] = borderPadding;
      }
    });

    // change current position to use the same positioning properties as final position, for animation purposes
    each(finalPosition, function(distance, edge) {
      adjustedCurrentPosition[edge] = distances[edge];
      adjustedCurrentPosition[oppositeEdges[edge]] = '';
    });

    elem.css(adjustedCurrentPosition)
      .animate(finalPosition, 100, function() {
        storePosition();
      });
  }

  elem.draggable({
    distance: 2,
    scroll: false,
    start: function( /* e, ui */ ) {
      dragFix.show();
    },
    stop: function(e, ui) {
      dragFix.hide();
      correctPosition(ui.position);
    },
  }).css('position', 'fixed');


  this.show = function() {
    this.elem.appendTo(document.body); // .hide().fadeIn(2000);
    elementVisible = true;
    restorePosition();
    delay(function() {
      correctPosition();
    }, 500);

    win.on('resize' + eventNamespace, debounce(function() {
      correctPosition();
    }, 500));

    elem.on('click', function() {
      $(this).triggerHandler('click');
    }.bind(this));
  };

  this.close = function() {
    this.elem.remove();
    //                .fadeOut(2000)
    //                .hide({ queue: true });
    elementVisible = false;
    win.off(eventNamespace);
    dragFix.remove();
  };

  this.getSnapEdge = function() {
    return closestEdge;
  };
}

export default PopupIcon;
