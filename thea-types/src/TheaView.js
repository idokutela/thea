import { TRANSPARENT } from './constants';
import {
  CHILD_COMPONENTS, firstChild, lastChild,
  children, toString, unmount, mountAll,
  updateEach,
} from './common/multiChildUtils';

const prototype = {
  firstChild,
  lastChild,
  children,
  toString,
  render, // eslint-disable-line
  unmount,
};

/**
 * The basic fixed-child view. A transparent view that assumes that
 * it always has the same child component structure.
 */
function render(attrs = [], context) {
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

  if (!this || !this.unmount) { // first render
    const retval = Object.create(prototype);
    retval[CHILD_COMPONENTS] = mountAll.call(this, attrs, context);
    retval.attrs = attrs;
    retval.context = context;
    return retval;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (attrs.length !== this[CHILD_COMPONENTS].length) {
      throw new Error('The child types do not match up. Views must have a consistent structure.');
    }
    // Question: should I also check the actual child structure?
  }

  this.attrs = children;
  this.context = context;
  updateEach.call(this, attrs, context);

  return this;
}

render[TRANSPARENT] = true;

export default render;
