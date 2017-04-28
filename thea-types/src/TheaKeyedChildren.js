/* eslint-disable no-use-before-define */

import TheaText from './TheaText';
import { insertAll, insert } from './dom/domUtils';
import { TRANSPARENT } from './constants';
import emptyElement from './emptyElement';
import reduce from './util/reduce';
import moveEntry from './util/moveEntry';
import isInBrowser from './dom/isInBrowser';
import {
  CHILD_COMPONENTS, firstChild, lastChild, children as getChildren,
  unmount as unmountRaw, toString, mountAll, fakeThis,
} from './common/multiChildUtils';

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

export const NODE_MAP = Symbol.for('node map');
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
  if (result.length === 0) {
    result = [[emptyElement]];
  }
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
  unmount() {
    this[NODE_MAP] = undefined;
    unmountRaw.call(this);
  },
};

/*
 * MOUNT : mounting children
 */
const makeNodeMap = children => reduce(children, (nodeMap, node, i) => {
  const key = node[2] || i;
  if (process.env.node_env !== 'production') {
    if (typeof node.key === 'number') {
      console.warn('It is a bad idea to key children with numbers. It easily leads to collisions.'); // eslint-disable-line
    }
    if (nodeMap.get(node.key)) {
      throw new Error(`Duplicate key!
The keys you set on children are not unique.
A common cause is setting some keys to numeric values, and having these collide with array indices.`);
    }
  }
  nodeMap.set(key, i);
  return nodeMap;
}, new Map());

function mountChildren(children, context) {
  return {
    nodeMap: makeNodeMap(children),
    childComponents: mountAll.call(this, children, context),
  };
}

/*
 * RECONCILE: reconciling child lists. The heart of the component.
 */

// QUESTION: is it better to remove all nodes to be deleted first,
// or afterwards?
// The first approach means doing a scan and looking for misses before
// reconciling, the second means that if something is to be deleted,
// there will be lots of pointless DOM reorganisation.
//
// For now, I choose a hybrid: I make a map of all new nodes,
// and if the front misses, I check for
function reconcileChildren(children, context) {
  const nodeMap = makeNodeMap(children);
  let childComponents = [];
  const oldNodeMap = this[NODE_MAP];
  const oldChildComponents = this[CHILD_COMPONENTS];
  const oldChildren = this[CHILDREN];
  const parent = isInBrowser && this.firstChild().parentNode;

  let oldIndex = 0;
  let index = 0;
  const frag = parent && document.createDocumentFragment();
  let front = parent && this.firstChild();

  // Go through the old and new children lists
  // updating children if they share keys.
  //
  // if there is a key miss, deal with it.
  while (index < children.length && oldIndex < oldChildren.length) {
    const key = children[index][2] || index;
    const oldKey = oldChildren[oldIndex][2] || oldIndex;

    if (key !== oldKey) { // Either a node must be added, deleted or moved
      if (!nodeMap.has(oldKey)) { // remove old element
        front = parent && oldChildComponents[oldIndex].lastChild().nextSibling;
        oldChildComponents[oldIndex].unmount();
        oldIndex += 1;
      } else if (!oldNodeMap.has(key)) { // add new element
        const [child, attrs] = children[index];
        childComponents[index] = child(attrs, context);
        parent && insertAll(childComponents[index].children(), undefined, frag); // eslint-disable-line
        index += 1;
      } else { // the bad case: something needs to be moved
        const displacedIndex = oldNodeMap.get(key);

        parent && insertAll(oldChildComponents[displacedIndex].children(), undefined, frag); // eslint-disable-line
        moveEntry(oldChildren, displacedIndex, oldIndex);
        moveEntry(oldChildComponents, displacedIndex, oldIndex);

        // let the next reconcile deal with updating
      }
    } else {
      const [oldChild] = oldChildren[oldIndex];
      const [child, attrs] = children[index];

      // Shift the front to the next position.
      // A tiny bit tricky: it's possible the old child component has already been moved,
      // it's on the doc frag, and its next sibling is null. In that case, the current front is
      // already the correct front.
      const newFront = parent && (oldChildComponents[oldIndex].lastChild().nextSibling || front);

      if (oldChild !== child) {
        childComponents[index] = child(attrs, context);
        parent && insertAll(childComponents[index].children(), undefined, frag); // eslint-disable-line
        oldChildComponents[oldIndex].unmount();
      } else {
        if (frag && frag.firstChild) {
          insert(frag, front, parent);
        }
        childComponents[index] = child.call(oldChildComponents[oldIndex], attrs, context);
      }
      index += 1;
      oldIndex += 1;
      front = newFront;
    }
  }

  // Now deal with any remainders
  if (oldIndex < oldChildren.length) { // Need to remove a bunch
    const toRemove = oldChildComponents.slice(oldIndex);
    unmountRaw.call(fakeThis(toRemove));
  } else if (index < children.length) { // Need to add a bunch
    const newComponents = mountAll(children.slice(index), context);
    parent && insertAll(getChildren.call(fakeThis(newComponents)), undefined, frag); // eslint-disable-line
    childComponents = childComponents.concat(newComponents);
  }

  if (parent && frag.firstChild) { // Make sure to add any remaining children
    insert(frag, front, parent);
  }

  this[CHILDREN] = children;
  this[NODE_MAP] = nodeMap;
  this[CHILD_COMPONENTS] = childComponents;
}

/*
 * RENDER FUNCTION : the actual renderer
 */

function TheaKeyedChildren(attrs, context) {
  // Was called newChildren
  const children = normaliseChildren(attrs);

  // Mount if necessary
  if (!this || !this.unmount) {
    const { nodeMap, childComponents } = mountChildren.call(this, children, context);
    const result = Object.create(prototype);
    result.attrs = attrs;
    result.context = context;
    result[CHILD_COMPONENTS] = childComponents;
    result[NODE_MAP] = nodeMap;
    result[CHILDREN] = children;
    return result;
  }

  this.attrs = attrs;
  this.context = context;

  const activeElement = isInBrowser && document.activeElement; // Make sure focus is stored
  reconcileChildren.call(this, children, context);

  isInBrowser &&                          // eslint-disable-line
  activeElement && activeElement.focus(); // and focus restored if a node is moved

  return this;
}

TheaKeyedChildren[TRANSPARENT] = true;

export default TheaKeyedChildren;
