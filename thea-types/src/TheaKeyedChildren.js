/* eslint-disable no-use-before-define */

import TheaText from './TheaText';
import { insertAll, insert, removeAll } from './dom/domUtils';
import { TRANSPARENT } from './constants';
import emptyElement from './emptyElement';
import isInBrowser from './dom/isInBrowser';
import {
  EMPTY, CHILD_COMPONENTS, firstChild, lastChild, children as getChildren,
  unmount as unmountRaw, toString, mountAll,
} from './common/multiChildUtils';
import addToUnmount from './common/unmountDaemon';

/*
 * This is the most complicated component. It performs
 * a full child subtree diff, a la react.
 *
 * TOC:
 *  - REGULARISING FUNCTIONS : utilities to make sure the list
 *      of children is regular,
 *  - PROTOYPE : the render prototype,
 *  - MOUNT : deals with mounting children
 *  - RECONCILE : the heart of the component: reconciles children
 *  - RENDER FUNCTION : the actual renderer
 */

export const CHILDREN = Symbol.for('children');

/*
 * REGULARISING FUNCTIONS : utilities to make sure the list
 *      of children is regular,
 */
const noNullChildren = t => (t !== null) && (t !== undefined) &&
    (t !== true) && (t !== false);

const normaliseChild = (t) => {
  if (Array.isArray(t)) return t;
  return [TheaText, String(t)];
};

const normaliseChildren = (children) => {
  let result = children;
  if (!Array.isArray(children)) {
    result = [children];
  } else if (typeof children[0] === 'function') {
    result = [children];
  }
  result = result
    .filter(noNullChildren)
    .map(normaliseChild);
  /* if (result.length === 0) {
    result = [[emptyElement]];
  }*/
  return result;
};

/*
 * PROTOTYPE : the render prototype,
 */
const prototype = {
  firstChild,
  lastChild,
  children: getChildren,
  render: TheaKeyedChildren, // eslint-disable-line
  toString,
  unmount: unmountRaw,
};

// The special case when there are no children to reconcile
/* eslint-disable no-param-reassign, no-plusplus, no-unused-expressions */
function clearAllChildren(component, children) {
  const oldChildren = component[CHILDREN];
  const last = component.lastChild();
  const parent = last && last.parentNode;
  const childComponents = component[CHILD_COMPONENTS];
  let insertionPoint;

  if (children.length) return false;
  if (!oldChildren.length) return childComponents;
  if (parent) {
    const first = component.firstChild();
    insertionPoint = last.nextSibling;
    removeAll(first, last, parent);
  }
  addToUnmount(childComponents);

  component[EMPTY] = component[EMPTY] || emptyElement();
  component[CHILD_COMPONENTS] = [component[EMPTY]];
  insert(component[EMPTY].firstChild(), insertionPoint, parent);
  return component[CHILD_COMPONENTS];
}

// The special case when all children are to be added
function addAllChildren(component, children, context) {
  const oldChildren = component[CHILDREN];
  const front = component.firstChild();
  const parent = front && front.parentNode;
  if (oldChildren.length) return false;

  component[CHILD_COMPONENTS] = mountAll(undefined, children, context);
  parent && insertAll(component.children(), front, parent); // eslint-disable-line
  component[EMPTY] && component[EMPTY].unmount();
  return component[CHILD_COMPONENTS];
}

function reconcileComponents(component, oldNode, newNode, parent, context, unmountQueue) {
  if (oldNode[0] !== newNode[0]) {
    const newComponent = newNode[0].call(undefined, newNode[1], context);
    if (parent) {
      const first = component.firstChild();
      insertAll(newComponent.children(), first, parent);
      removeAll(first, component.lastChild(), parent);
    }
    unmountQueue.push(component);
    return newComponent;
  }
  return newNode[0].call(component, newNode[1], context);
}

function reconcileAndMove(component, oldNode, newNode, parent,
  context, insertionPoint, unmountQueue) {
  if (newNode[0] !== oldNode[0]) {
    const newComponent = newNode[0].call(undefined, newNode[1], context);
    if (parent) {
      insertAll(newComponent.children(), insertionPoint, parent);
      removeAll(component.firstChild(), component.lastChild(), parent);
    }
    unmountQueue.push(component);
    return newComponent;
  }
  if (!parent) {
    return newNode[0].call(component, newNode[1], context);
  }

  const front = component.firstChild();
  const back = component.lastChild().nextSibling;
  while (front.nextSibling !== back) {
    parent.removeChild(front.nextSibling);
  }
  parent.removeChild(front);
  component = newNode[0].call(component, newNode[1], context);
  insertAll(component.children(), insertionPoint, parent);
  return component;
}

// General reconciliation
function reconcileGenerally(component, children, context) {
  const oldChildren = component[CHILDREN];
  const oldChildComponents = component[CHILD_COMPONENTS];
  const childComponents = [];
  const first = component.firstChild();
  const parent = first && first.parentNode;
  const unmountQueue = [];

  let oldFrontIndex = 0;
  let newFrontIndex = 0;
  let oldBackIndex = oldChildren.length - 1;
  let newBackIndex = children.length - 1;
  let oldKey;
  let newKey;
  const getKey = (array, index) => (array[index] && array[index][2]) || index;

/* eslint-disable no-sequences, no-cond-assign */
  while (oldFrontIndex <= oldBackIndex && newFrontIndex <= newBackIndex) {
    while (
      newKey = getKey(children, newFrontIndex),
      oldKey = getKey(oldChildren, oldFrontIndex),
      newFrontIndex <= newBackIndex &&
      oldFrontIndex <= oldBackIndex &&
      oldKey === newKey
    ) {
      childComponents[newFrontIndex] = reconcileComponents(
        oldChildComponents[oldFrontIndex],
        oldChildren[oldFrontIndex],
        children[newFrontIndex],
        parent,
        context,
        unmountQueue,
      );

      oldFrontIndex += 1;
      newFrontIndex += 1;
    }

    while (
      newKey = getKey(children, newBackIndex),
      oldKey = getKey(oldChildren, oldBackIndex),
      oldBackIndex >= oldFrontIndex &&
      newBackIndex >= newFrontIndex &&
      newKey === oldKey
    ) {
      childComponents[newBackIndex] = reconcileComponents(
        oldChildComponents[oldBackIndex],
        oldChildren[oldBackIndex],
        children[newBackIndex],
        parent,
        context,
        unmountQueue,
      );
      oldBackIndex -= 1;
      newBackIndex -= 1;
    }

    if (oldFrontIndex > oldBackIndex || newFrontIndex > newBackIndex) break;

    newKey = getKey(children, newFrontIndex);
    oldKey = getKey(oldChildren, oldBackIndex);

    if (newKey === oldKey) {
      const childComponent = oldChildComponents[oldBackIndex];
      const insertionPoint = parent && (childComponents[newFrontIndex - 1] ?
        childComponents[newFrontIndex - 1].lastChild().nextSibling : parent.firstChild);
      childComponents[newFrontIndex] = reconcileAndMove(
        childComponent,
        oldChildren[oldBackIndex],
        children[newFrontIndex],
        parent,
        context,
        insertionPoint,
        unmountQueue,
      );
      oldBackIndex -= 1;
      newFrontIndex += 1;
    }

    newKey = getKey(children, newBackIndex);
    oldKey = getKey(oldChildren, oldFrontIndex);

    if (newKey === oldKey && oldFrontIndex !== oldBackIndex && newFrontIndex !== newBackIndex) {
      const childComponent = oldChildComponents[oldFrontIndex];
      const insertionPoint = parent && childComponents[newBackIndex + 1] &&
        childComponents[newBackIndex + 1].firstChild();
      childComponents[newBackIndex] = reconcileAndMove(
        childComponent,
        oldChildren[oldFrontIndex],
        children[newBackIndex],
        parent,
        context,
        insertionPoint,
        unmountQueue,
      );
      oldFrontIndex += 1;
      newBackIndex -= 1;
    }

    newKey = getKey(children, newFrontIndex);
    oldKey = getKey(oldChildren, oldFrontIndex);
    if (newKey !== oldKey) break;
  }
  /* eslint-enable no-sequences, no-cond-assign */

  // If we just have nodes to add or remove remaining
  if (oldFrontIndex > oldBackIndex) {
    if (newFrontIndex > newBackIndex) {
      addToUnmount(unmountQueue);
      return childComponents;
    }
    const insertionPoint = parent && childComponents[newFrontIndex - 1].lastChild().nextSibling;
    let nodesToInsert = [];
    while (newFrontIndex <= newBackIndex) {
      const childNode = children[newFrontIndex];
      const newComponent = childNode[0].call(undefined, childNode[1], context);
      childComponents[newFrontIndex] = newComponent;
      nodesToInsert = parent && nodesToInsert.concat(newComponent.children());
      newFrontIndex += 1;
    }
    parent && insertAll(nodesToInsert, insertionPoint, parent);
    addToUnmount(unmountQueue);
    return childComponents;
  }
  if (newFrontIndex > newBackIndex) {
    if (parent) {
      const front = oldChildComponents[oldFrontIndex].firstChild();
      const back = oldChildComponents[oldBackIndex].lastChild();
      removeAll(front, back, parent);
    }
    Array.prototype.push.apply(unmountQueue, oldChildComponents.slice(oldFrontIndex));
    addToUnmount(unmountQueue);
    return childComponents;
  }

  // Now we're done with cheap gains
  const oldMap = new Map();

  for (let i = oldFrontIndex; i <= oldBackIndex; i++) {
    oldKey = getKey(oldChildren, i);
    oldMap.set(oldKey, i);
  }

  let front = parent &&
    oldChildComponents[oldFrontIndex].firstChild();

  for (let i = newFrontIndex; i <= newBackIndex; i++) {
    const childNode = children[i];
    newKey = getKey(children, i);
    const oldChildIndex = oldMap.get(newKey);
    if (oldChildIndex !== undefined) {
      const childComponent = oldChildComponents[oldChildIndex];
      if (childComponent.firstChild() !== front) {
        childComponents[i] = reconcileAndMove(
          childComponent,
          oldChildren[oldChildIndex],
          children[i],
          parent,
          context,
          front,
          unmountQueue,
        );
      } else {
        childComponents[i] = reconcileComponents(
          childComponent,
          oldChildren[oldChildIndex],
          children[i],
          parent,
          context,
          unmountQueue,
        );
      }
      oldMap.delete(newKey);
    } else {
      childComponents[i] = childNode[0].call(undefined, childNode[1], context);
      parent && insertAll(childComponents[i].children(), front, parent);
    }
    front = childComponents[i].lastChild() && childComponents[i].lastChild().nextSibling;
  }


  const toDelete = [...oldMap.values()];
  for (let i = 0; i < toDelete.length; i++) {
    const childToDelete = oldChildComponents[toDelete[i]];
    if (parent) {
      front = childToDelete.firstChild();
      const back = childToDelete.lastChild();
      removeAll(front, back, parent);
    }
    unmountQueue.push(childToDelete);
  }

  addToUnmount(unmountQueue);
  return childComponents;
}

/*
 * RECONCILE: reconciling child lists. The heart of the component.
 */
function reconcileChildren(component, children, context) {
  component[CHILD_COMPONENTS] =
    clearAllChildren(component, children, context) ||
    addAllChildren(component, children, context) ||
    reconcileGenerally(component, children, context);
}
/* eslint-enable no-param-reassign */

let activeTimeout;

function retainActiveElement() {
  if (activeTimeout || !isInBrowser) return;
  const activeElement = document.activeElement;
  activeTimeout = setTimeout(function resetFocus() { // eslint-disable-line
    if (activeElement) {
      activeElement.focus();
    }
    activeTimeout = undefined;
  });
}

/*
 * RENDER FUNCTION : the actual renderer
 */

function TheaKeyedChildren(attrs, context) {
  // Was called newChildren
  const children = normaliseChildren(attrs);

  // Mount if necessary
  if (!this || !this.unmount) {
    const childrenToMount = children.length ?
      children : [[emptyElement]];
    const childComponents = mountAll(this, childrenToMount, context);
    const result = Object.create(prototype);
    result.attrs = attrs;
    result.context = context;
    result[CHILD_COMPONENTS] = childComponents;
    result[CHILDREN] = children;
    result[EMPTY] = children.length === 0 && childComponents[0];
    return result;
  }

  this.attrs = attrs;
  this.context = context;

  retainActiveElement();
  reconcileChildren(this, children, context);
  this[CHILDREN] = children;

  return this;
}

TheaKeyedChildren[TRANSPARENT] = true;

export default TheaKeyedChildren;
