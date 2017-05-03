import { TRANSPARENT } from './constants';
import {
  CHILD_COMPONENTS, firstChild, lastChild,
  children, toString, unmount, mountAll,
  updateEach, fakeThis,
} from './common/multiChildUtils';
import emptyElement from './emptyElement';
import { insertAll, insert } from './dom/domUtils';

const EMPTY = Symbol('empty');

const prototype = {
  firstChild,
  lastChild,
  children,
  toString,
  unmount,
  render: TheaUnkeyedChildren, // eslint-disable-line
};

const min = (a, b) => (a < b ? a : b);

/* eslint-disable no-plusplus */
function TheaUnkeyedChildren(attrs = [], context) {
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
      result[CHILD_COMPONENTS] = mountAll(this, attrs, context);
      result[EMPTY] = emptyElement();
      return result;
    }
    result[CHILD_COMPONENTS] = [emptyElement.call(this)];
    result[EMPTY] = result[CHILD_COMPONENTS][0];
    return result;
  }

  this.attrs = attrs;
  this.context = context;

  const last = this.lastChild();
  const parent = last && last.parentNode;

  if (this[CHILD_COMPONENTS][0] === this[EMPTY]) { // if currently empty
    if (!attrs.length) return this;
    this[CHILD_COMPONENTS] = mountAll(undefined, attrs, context);
    parent && insertAll(this.children(), this[EMPTY].firstChild(), parent); // eslint-disable-line
    this[EMPTY].unmount();
    return this;
  }

  if (!attrs.length) {
    if (parent) {
      const first = this.firstChild();
      const after = this.lastChild().nextSibling;
      while (first.nextSibling !== after) {
        parent.removeChild(first.nextSibling);
      }
      parent.removeChild(first);
      insert(this[EMPTY].firstChild(), after, parent);
    }
    for (let i = 0; i < this[CHILD_COMPONENTS].length; i++) {
      this[CHILD_COMPONENTS][i].unmount();
    }
    this[CHILD_COMPONENTS] = [this[EMPTY]];
    return this;
  }

  const diff = attrs.length - this[CHILD_COMPONENTS].length;
  const toUpdate = min(attrs.length, this[CHILD_COMPONENTS].length);
  const childComponents = [];
  for (let i = 0; i < toUpdate; i++) {
    childComponents[i] = attrs[i][0].call(this[CHILD_COMPONENTS][i], attrs[i][1], context);
  }
  if (diff < 0) { // remove
    for (let i = toUpdate; i < this[CHILD_COMPONENTS].length; i++) {
      this[CHILD_COMPONENTS][i].unmount();
    }
  } else if (diff > 0) {
    const toAdd = [];
    const end = parent && this.lastChild().nextSibling;
    for (let i = toUpdate; i < attrs.length; i++) {
      childComponents[i] = attrs[i][0].call(undefined, attrs[i][1], context);
      parent && Array.prototype.push.apply(toAdd, childComponents[i].children()); // eslint-disable-line
    }
    parent && insertAll(toAdd, end, parent); // eslint-disable-line
  }
  this[CHILD_COMPONENTS] = childComponents;

  return this;
}

TheaUnkeyedChildren[TRANSPARENT] = true;

export default TheaUnkeyedChildren;
