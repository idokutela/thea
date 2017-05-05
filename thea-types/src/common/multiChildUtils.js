import addToUnmount from './unmountDaemon';
import { removeAll } from '../dom/domUtils';

export const CHILD_COMPONENTS = Symbol('thea/child_components');


export function firstChild() {
  return this[CHILD_COMPONENTS].length ?
    this[CHILD_COMPONENTS][0].firstChild() : undefined;
}

export function lastChild() {
  return this[CHILD_COMPONENTS].length ?
    this[CHILD_COMPONENTS][this[CHILD_COMPONENTS].length - 1].lastChild() :
    undefined;
}

/* eslint-disable no-shadow, no-plusplus */
export function children() {
  const childComponents = this[CHILD_COMPONENTS];
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
  addToUnmount(this[CHILD_COMPONENTS]);
}

export function updateEach(component, children, context) {
  const childComponents = component[CHILD_COMPONENTS];
  for (let i = 0; i < childComponents.length; i++) {
    childComponents[i] = children[i][0].call(childComponents[i], children[i][1], context);
  }
}

export function toString() {
  const childComponents = this[CHILD_COMPONENTS];
  let result = '';
  for (let i = 0; i < childComponents.length; i++) {
    result += childComponents[i].toString();
  }
  return result;
}

/* eslint-enable no-shadow */
export function fakeThis(childComponents) {
  return {
    [CHILD_COMPONENTS]: childComponents,
  };
}
