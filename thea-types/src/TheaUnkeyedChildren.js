import { TRANSPARENT, MOUNTED, DEBUG } from './constants';
import {
  firstChild, lastChild, isMounted,
  children, toString, unmount, mountAll, isReady,
} from './common/multiChildUtils';
import emptyElement from './emptyElement';
import { insert, insertAll, removeAll } from './dom/domUtils';
import addToUnmount from './common/unmountDaemon';

const prototype = {
  firstChild,
  lastChild,
  children,
  toString,
  unmount,
  render: TheaUnkeyedChildren, // eslint-disable-line
  isReady,
  isMounted,
};

const min = (a, b) => (a < b ? a : b);

/* eslint-disable no-plusplus */
function TheaUnkeyedChildren(attrs = [], context) {
  if (process.env.NODE_ENV !== 'production') {
    if (!Array.isArray(attrs)) {
      throw new Error('TheaUnkeyedChildren: Expected an array of children.');
    }
  }

  if (!this || !this[MOUNTED]) {
    const result = Object.create(prototype);
    if (process.env.node_env !== 'production') {
      result[DEBUG] = {
        attrs,
        context,
      };
    }
    if (attrs.length) {
      result[MOUNTED] = {
        childComponents: mountAll(this, attrs, context),
        empty: emptyElement(),
      };
      return result;
    }
    const empty = emptyElement.call(this);
    result[MOUNTED] = {
      childComponents: [empty],
      empty,
    };
    return result;
  }

  if (process.env.node_env !== 'production') {
    this.attrs = attrs;
    this.context = context;
  }

  const last = this.lastChild();
  const parent = last && last.parentNode;

  const mounted = this[MOUNTED];
  if (mounted.childComponents[0] === mounted.empty) { // if currently empty
    if (!attrs.length) return this;
    mounted.childComponents = mountAll(undefined, attrs, context);
    parent && insertAll(this.children(), mounted.empty.firstChild(), parent); // eslint-disable-line
    parent && parent.removeChild(mounted.empty.firstChild()); // eslint-disable-line
    return this;
  }

  if (!attrs.length) {
    if (parent) {
      const next = last.nextSibling;
      removeAll(this.firstChild(), last, parent);
      insert(mounted.empty.firstChild(), next, parent);
    }
    addToUnmount(mounted.childComponents);
    mounted.childComponents = [mounted.empty];
    return this;
  }

  const diff = attrs.length - mounted.childComponents.length;
  const toUpdate = min(attrs.length, mounted.childComponents.length);
  for (let i = 0; i < toUpdate; i++) {
    attrs[i][0].call(mounted.childComponents[i], attrs[i][1], context);
  }
  if (diff < 0) { // remove
    if (parent) {
      const first = mounted.childComponents[toUpdate].firstChild();
      removeAll(first, last, parent);
    }
    addToUnmount(mounted.childComponents.splice(toUpdate, -diff));
  } else if (diff > 0) {
    const toAdd = [];
    const end = parent && this.lastChild().nextSibling;
    for (let i = toUpdate; i < attrs.length; i++) {
      mounted.childComponents[i] = attrs[i][0].call(undefined, attrs[i][1], context);
      parent && Array.prototype.push.apply(toAdd, mounted.childComponents[i].children()); // eslint-disable-line
    }
    parent && insertAll(toAdd, end, parent); // eslint-disable-line
  }

  return this;
}

TheaUnkeyedChildren[TRANSPARENT] = true;

export default TheaUnkeyedChildren;
