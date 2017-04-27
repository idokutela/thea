import { TRANSPARENT } from './constants';
import forEach from './util/forEach';
import {
  CHILD_COMPONENTS, firstChild, lastChild,
  children, toString, unmount, mountAll,
} from './common/multiChildUtils';

/* eslint-disable no-shadow */
function update(children, context) {
  const updateChild = ([child, attrs], i) => child.call(this[CHILD_COMPONENTS][i], attrs, context);
  forEach(children, updateChild);
  return this[CHILD_COMPONENTS];
}
/* eslint-enable */

const prototype = {
  firstChild,
  lastChild,
  children,
  toString,
  render, // eslint-disable-line
  unmount,
  update,
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
    return retval;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (attrs.length !== this[CHILD_COMPONENTS].length) {
      throw new Error('The child types do not match up. Views must have a consistent structure.');
    }
    // Question: check more carefully?
  }

  update.call(this, attrs, context);
  return this;
}

render[TRANSPARENT] = true;

export default render;
