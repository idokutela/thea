/* eslint-disable no-use-before-define */

import TheaText from './TheaText';
import { insertAll } from './domUtils';
import { TRANSPARENT } from './constants';
import emptyElement from './emptyElement';
import { flatten } from './dataUtils';

function render(attrs, context) {
  const reconcileChild = oldMap =>
    (prev, current, count) => reconcileChildInt(oldMap, prev, current, count);

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
  if (!this) return mount(newChildren, context);
  if (!this.render) return revive(this, newChildren, context);

  // Reconcile children
  const { childComponents, nodeMap } = attrs.reduce(
    reconcileChild(this.nodeMap(), context),
      { childComponents: [], nodeMap: new Map(), front: this.firstChild() },
  );

  return makeComponent(nodeMap, childComponents);

  function makeComponent(nodeMap, childComponents) { // eslint-disable-line
    return {
      nodeMap() { return nodeMap; },
      firstChild() { return childComponents[0].firstChild(); },
      lastChild() { return childComponents[childComponents.length - 1].lastChild(); },
      children() { return flatten(childComponents.map(c => c.children())); },
      toString() { return childComponents.reduce((r, c) => r + c.toString(), ''); },
      render,
      unmount() {
        childComponents.forEach(c => c.unmount());
      },
    };
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

    return makeComponent(nodeMap, childComponents);
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

    return makeComponent(nodeMap, childComponents);
  }

  function reconcileChildInt(oldMap,
    { childComponents, nodeMap, front }, [renderChild, attrs, index], count) { // eslint-disable-line
    const childIndex = index === undefined ? count : index;
    let prevChild = oldMap.get(childIndex);
    let newChild;
    let shouldMove;

    if (!prevChild || prevChild.render !== renderChild) {
      newChild = renderChild(attrs, context);
      front = front === prevChild.firstChild() ? prevChild.lastChild().nextSibling : front; // eslint-disable-line
      prevChild && prevChild.unmount(); // eslint-disable-line
      prevChild = undefined;
      shouldMove = true;
    } else {
      shouldMove = prevChild.firstNode() !== front;
      newChild = prevChild.render(attrs, context);
    }
    if (shouldMove) insertAll(newChild.children, front);
    nodeMap.set(childIndex, newChild);
    childComponents.push(newChild);
    front = newChild.lastChild() && newChild.lastChild().nextSibling; // eslint-disable-line

    return { nodeMap, childComponents, front };
  }
}

render[TRANSPARENT] = true;

export default render;
