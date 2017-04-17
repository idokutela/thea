/* eslint-disable no-use-before-define */

import TheaText from './TheaText';
import { insertAll } from './dom/domUtils';
import { TRANSPARENT } from './constants';
import emptyElement from './emptyElement';
import flatten from './util/flatten';
import forEach from './util/forEach';

function render(attrs, context) {
  const reconcileChild = function reconcileChild(oldMap, parentNode) {
    return reconcileChildInt.bind(undefined, oldMap, parentNode);
  };

  // Normalise children
  let newChildren = attrs;
  if (!Array.isArray(attrs)) {
    newChildren = [[TheaText, attrs]];
  } else if (attrs.length && !Array.isArray(attrs[0])) {
    newChildren = [attrs];
  } else if (attrs.length === 0) {
    newChildren = [[emptyElement]];
  }

  // Deal with the two special cases
  if (!this) return mount(newChildren);
  if (!this.unmount) return revive(this, newChildren);

  // Reconcile children
  const { childComponents, nodeMap } = attrs.reduce(
    reconcileChild(this.nodeMap(), this.firstChild() && this.firstChild().parentNode),
      { childComponents: [], nodeMap: new Map(), front: this.firstChild() },
  );
  forEach(this.nodeMap().values(), x => x.unmount());

  return updateState.call(this, nodeMap, childComponents);

  function updateState(nodeMap, childComponents) { // eslint-disable-line
    return Object.assign(this || {}, {
      nodeMap() { return nodeMap; },
      firstChild() { return childComponents[0].firstChild(); },
      lastChild() { return childComponents[childComponents.length - 1].lastChild(); },
      children() { return flatten(childComponents.map(c => c.children())); },
      toString() { return childComponents.reduce((r, c) => r + c.toString(), ''); },
      unmount() {
        childComponents.forEach(c => c.unmount());
      },
      render,
    });
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
