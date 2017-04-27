import { TRANSPARENT } from './constants';
import {
  CHILD_COMPONENTS, firstChild, lastChild,
  children, toString, unmount, mountAll,
  updateEach, fakeThis,
} from './common/multiChildUtils';
import emptyElement from './emptyElement';
import { insertAll } from './dom/domUtils';

const EMPTY = Symbol('empty');

const prototype = {
  firstChild,
  lastChild,
  children,
  toString,
  unmount,
  render, // eslint-disable-line
};

function render(attrs = [], context) {
  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(attrs)) {
      throw new Error('TheaUnkeyedChildren: Expected an array of children.');
    }
  }

  if (!this || !this.unmount) {
    const result = Object.create(prototype);
    result.attrs = attrs;
    result.context = context;
    if (attrs.length) {
      result[CHILD_COMPONENTS] = mountAll.call(this, attrs, context);
      return result;
    }
    result[CHILD_COMPONENTS] = [emptyElement.call(this)];
    result[EMPTY] = result[CHILD_COMPONENTS][0];
    return result;
  }

  this.attrs = attrs;
  this.context = context;

  const last = this.lastChild();
  const next = last && last.nextSibling;
  const parent = last && last.parentNode;

  if (this[CHILD_COMPONENTS][0] === this[EMPTY]) { // if currently empty
    if (!attrs.length) return this;
    this.unmount();
    this[CHILD_COMPONENTS] = [];
  }

  // Find the common part of each array, and the remainders
  const commonComponents = this[CHILD_COMPONENTS].slice(0, attrs.length);
  const commonChildren = attrs.slice(0, commonComponents.length);
  const toRemove = this[CHILD_COMPONENTS].slice(commonComponents.length);
  const toAdd = attrs.slice(commonChildren.length);

  // unmount any extra mounted components
  toRemove.length && unmount.call(fakeThis(toRemove)); // eslint-disable-line

  // Mount any new components
  const newComponents = mountAll(toAdd, context);

  if (newComponents.length) {
    const newNodes = children.call(fakeThis(newComponents)); // sneaky use of children
    parent && insertAll(newNodes, next, parent); // eslint-disable-line
  }

  // Update the common components
  this[CHILD_COMPONENTS] = commonComponents;
  updateEach.call(this, commonChildren, context);
  this[CHILD_COMPONENTS] = this[CHILD_COMPONENTS].concat(newComponents);

  if (!this[CHILD_COMPONENTS].length) { // if it becomes empty insert the empty node
    this[EMPTY] = this[EMPTY] || emptyElement();
    this[CHILD_COMPONENTS] = [this[EMPTY]];
    parent && insertAll([this[EMPTY].firstChild()], next, parent); // eslint-disable-line
  }
  return this;
}

render[TRANSPARENT] = true;

export default render;
