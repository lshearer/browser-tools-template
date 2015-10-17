import $ from 'jquery';
import uniqueId from 'lodash/utility/uniqueId';
import defer from 'lodash/function/defer';

const doc = $(document);

// could use a better name, but this watches for clicks outside of the given element and trigger a callback if there is one
// useful in popups and menus that should auto-hide when the user interacts with other portions of the page
function ClickWatcher(outsideOfElement, callback) {
  const self = this;
  const eventName = uniqueId('click.click-watcher');
  const container = $(outsideOfElement)[0];

  // defer binding to not trigger this during the click event that created it
  defer(function() {
    doc.on(eventName, function({target}) {
      if (container === target || $.contains(container, target)) {
        return;
      }
      callback(self);
    });
  });

  this.stop = function() {
    doc.off(eventName);
  };
}

module.exports = ClickWatcher;
