/* eslint-disable no-use-before-define */

import TheaText from './TheaText';
import { insertAll } from './dom/domUtils';
import { TRANSPARENT } from './constants';
import emptyElement from './emptyElement';
import flatten from './util/flatten';
import forEach from './util/forEach';

const NODE_MAP = Symbol.for('node mape');
const CHILD_COMPONENTS = Symbol.for('child components');

const noNullChildren = t => (t !== null) && (t !== undefined) &&
    (t !== true) && (t !== false);

const normaliseChild = (t) => {
  if (Array.isArray(t)) return t;
  return [TheaText, String(t)];
};

function render(attrs, context) {
  const reconcileChild = function reconcileChild(oldMap, parentNode) {
    return reconcileChildInt.bind(undefined, oldMap, parentNode);
  };

  // Normalise children
  let newChildren = attrs;
  if (!Array.isArray(attrs)) {
    newChildren = [attrs];
  } else if (attrs.length && typeof attrs[0] === 'function') {
    newChildren = [attrs];
  }
  newChildren = newChildren
    .filter(noNullChildren)
    .map(normaliseChild);
  if (newChildren.length === 0) {
    newChildren = [[emptyElement]];
  }

  // Deal with the two special cases
  if (!this) return mount(newChildren);
  if (!this.unmount) return revive(this, newChildren);

  // Reconcile children
  const { childComponents, nodeMap } = newChildren.reduce(
    reconcileChild(this.nodeMap(), this.firstChild() && this.firstChild().parentNode),
      { childComponents: [], nodeMap: new Map(), front: this.firstChild() },
  );
  forEach(this.nodeMap().values(), x => x.unmount());

  return updateState.call(this, nodeMap, childComponents);

  function updateState(nodeMap, childComponents) { // eslint-disable-line
    const result = this || {
      nodeMap() { return this[NODE_MAP]; },
      firstChild() { return this[CHILD_COMPONENTS][0].firstChild(); },
      lastChild() { return this[CHILD_COMPONENTS][this[CHILD_COMPONENTS].length - 1].lastChild(); },
      children() { return flatten(this[CHILD_COMPONENTS].map(c => c.children())); },
      toString() { return this[CHILD_COMPONENTS].reduce((r, c) => r + c.toString(), ''); },
      unmount() {
        this[CHILD_COMPONENTS].forEach(c => c.unmount());
      },
      render,
    };
    result[NODE_MAP] = nodeMap;
    result[CHILD_COMPONENTS] = childComponents;
    return result;
  }

  function revive(node, children) {
    function reviveChild(
      { nodeMap, childComponents, firstNode }, [renderChild, childAttrs, index], count,
    ) {
      const childIndex = index === undefined ? count : index;
      const newChild = renderChild.call(firstNode, childAttrs, context);
      nodeMap.set(childIndex, newChild);
      childComponents.push(newChild);
      return {
        nodeMap,
        childComponents,
        firstNode: newChild.lastChild().nextSibling,
      };
    }
    const { nodeMap, childComponents } = children.reduce( // eslint-disable-line
      reviveChild, { nodeMap: new Map(), childComponents: [], firstNode: node });

    return updateState(nodeMap, childComponents);
  }

  function mount(children) {
    function mountChild({ nodeMap, childComponents }, [renderChild, childAttrs, index], count) {
      const newChild = renderChild(childAttrs, context);
      const childIndex = index === undefined ? count : index;
      nodeMap.set(childIndex, newChild);
      childComponents.push(newChild);
      return { nodeMap, childComponents };
    }
    const { nodeMap, childComponents } = children.reduce( // eslint-disable-line
      mountChild, { nodeMap: new Map(), childComponents: [] });

    return updateState(nodeMap, childComponents);
  }

  function reconcileChildInt(oldMap, parentNode,
    { childComponents, nodeMap, front }, [renderChild, attrs, index], count) { // eslint-disable-line
    const childIndex = index === undefined ? count : index;
    let prevChild = oldMap.get(childIndex);
    let newChild;
    let shouldMove;

    if (!prevChild || prevChild.render !== renderChild) {
      newChild = renderChild(attrs, context);
      if (prevChild) {
        front = front === prevChild.firstChild() ? (prevChild.lastChild() && prevChild.lastChild().nextSibling) : front; // eslint-disable-line
      }
      prevChild && prevChild.unmount(); // eslint-disable-line
      prevChild = undefined;
      shouldMove = true;
    } else {
      shouldMove = prevChild.firstChild() !== front;
      newChild = prevChild.render(attrs, context);
    }
    if (shouldMove && parentNode) {
      insertAll(newChild.children(), front, parentNode);
    }
    nodeMap.set(childIndex, newChild);
    oldMap.delete(childIndex);
    childComponents.push(newChild);
    front = newChild.lastChild() && newChild.lastChild().nextSibling; // eslint-disable-line

    return { nodeMap, childComponents, front };
  }
}

render[TRANSPARENT] = true;

export default render;
