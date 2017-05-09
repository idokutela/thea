import addToUnmount from './unmountDaemon';
import { removeAll } from '../dom/domUtils';
import { MOUNTED } from '../constants';

export { isMounted } from './singleChildUtils';

export function firstChild() {
  return this[MOUNTED].childComponents.length ?
    this[MOUNTED].childComponents[0].firstChild() : undefined;
}

export function lastChild() {
  return this[MOUNTED].childComponents.length ?
    this[MOUNTED].childComponents[this[MOUNTED].childComponents.length - 1].lastChild() :
    undefined;
}

/* eslint-disable no-shadow, no-plusplus */
export function children() {
  const childComponents = this[MOUNTED].childComponents;
  const result = [];
  for (let i = 0; i < childComponents.length; i++) {
    const cs = childComponents[i].children();
    for (let j = 0; j < cs.length; j++) {
      result.push(cs[j]);
    }
  }
  return result;
}

export function mountAll(node, children, context) {
  const childComponents = [];
  if (node) {
    let first = node;
    for (let i = 0; i < children.length; i++) {
      childComponents[i] = children[i][0].call(first, children[i][1], context);
      first = childComponents[i].lastChild();
      first = first && first.nextSibling;
    }
    return childComponents;
  }
  for (let i = 0; i < children.length; i++) {
    childComponents[i] = children[i][0].call(undefined, children[i][1], context);
  }
  return childComponents;
}

export function unmount(isDangling) {
  const first = this.firstChild();
  const parent = first && first.parentNode;
  const attached = !isDangling && parent;
  if (attached) {
    removeAll(first, this.lastChild(), parent);
  }
  addToUnmount(this[MOUNTED].childComponents);
  this[MOUNTED].childComponents = undefined;
  this[MOUNTED] = undefined;
}

export function updateEach(component, children, context) {
  const childComponents = component[MOUNTED].childComponents;
  for (let i = 0; i < childComponents.length; i++) {
    childComponents[i] = children[i][0].call(childComponents[i], children[i][1], context);
  }
}

export function toString() {
  const childComponents = this[MOUNTED].childComponents;
  let result = '';
  for (let i = 0; i < childComponents.length; i++) {
    result += childComponents[i].toString();
  }
  return result;
}

export function isReady() {
  return Promise
    .all(this[MOUNTED].childComponents.map(x => x.isReady()))
    .reduce((r, x) => r && x, true);
}
