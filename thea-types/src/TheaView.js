import { TRANSPARENT, MOUNTED, DEBUG } from './constants';
import {
  firstChild, lastChild,
  children, toString, unmount, mountAll,
  updateEach,
  isReady, isMounted,
} from './common/multiChildUtils';

const prototype = {
  firstChild,
  lastChild,
  children,
  toString,
  render: TheaView, // eslint-disable-line
  unmount,
  isReady,
  isMounted,
};

/**
 * The basic fixed-child view. A transparent view that assumes that
 * it always has the same child component structure.
 */
function TheaView(attrs = [], context) {
  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(attrs)) {
      throw new TypeError('TheaView: Expected an array of children.');
    }
    if (!attrs.length) {
      throw new Error('TheaView: a view must have children.');
    }
    if (!Array.isArray(attrs[0])) {
      throw new TypeError('TheaView: Expected an array of children.');
    }
  }

  if (!this || !this[MOUNTED]) { // first render
    const retval = Object.create(prototype);
    retval[MOUNTED] = { childComponents: mountAll(this, attrs, context) };
    if (process.env.node_env !== 'production') {
      retval[DEBUG] = { attrs, context };
    }
    return retval;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (attrs.length !== this[MOUNTED].childComponents.length) {
      throw new Error('The child types do not match up. Views must have a consistent structure.');
    }
    // Question: should I also check the actual child structure?
    this[DEBUG] = { attrs, context };
  }

  updateEach(this, attrs, context);

  return this;
}

TheaView[TRANSPARENT] = true;

export default TheaView;
