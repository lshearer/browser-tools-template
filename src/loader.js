/* global VERSION */
import Skeleton from './loader/skeleton';

const skeleton = new Skeleton();

// Include some easily-accessible/readable version number for sanity checking during debug
if (Object.defineProperties) { // Feature inference for IE8 compat issue
  Object.defineProperty(skeleton, '__version', {
    get: function() {
      console.warn('__version should not be accessed programatically, only during debugging.');
      return VERSION;
    },
  });
}

export default skeleton;
