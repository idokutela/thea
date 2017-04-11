import * as t from 'babel-types';

import makeNode, { TH } from './makeNode';
import { view, map, keyedIter, unkeyedIter } from './constants';
import extractKey from './extractKey';
import extractChildren from './extractChildren';
import getAttributes from './getAttributes';


function makeKeyedNode({
  children,
  of,
  item = t.identifier('item'),
  keyedBy = t.identifier('key'),
}, pragma, path) {
  const thea = TH(pragma);
  const key = t.identifier('key');
  if (of === undefined) {
    throw path.buildCodeFrameError('An “of” iterable must be specified for “each”.');
  }
  if (children.length === 0) {
    throw path.buildCodeFrameError('No children for “each”.');
  }

  const child = makeNode(thea(view), t.arrayExpression(children), key);

  const innerF = t.functionExpression(null, [
    item, key,
  ], t.blockStatement([t.returnStatement(child)]));

  const computedChild = t.callExpression(
    innerF, [item, keyedBy]);

  const mapFunction = t.arrowFunctionExpression([item, key], computedChild);

  const mappedChildren = t.callExpression(thea(map), [of, mapFunction]);

  const args = mappedChildren;

  return makeNode(thea(keyedIter), args, extractKey(path));
}

function makeUnkeyedNode({
  children,
  of,
  item = t.identifier('item'),
}, pragma, path) {
  const thea = TH(pragma);
  if (of === undefined) {
    throw path.buildCodeFrameError('An “of” iterable must be specified for “each”.');
  }
  let child;
  if (children.length === 0) {
    throw path.buildCodeFrameError('No children for “each”.');
  }
  if (children.length === 1) {
    child = children[0];
  } else {
    const attrsObject = t.arrayExpression(children);
    child = makeNode(thea(view), attrsObject);
  }

  const computedChild = t.functionExpression(null, [
    item, t.identifier('key'),
  ], t.blockStatement([t.returnStatement(child)]));

  const mappedChildren = t.callExpression(thea(map), [of, computedChild]);

  const args = mappedChildren;

  const node = makeNode(thea(unkeyedIter), args, extractKey(path));
  return node;
}

const whitelist = new Map([['of', new Set(['expression'])], ['keyedBy', new Set(['expression'])], ['item', new Set(['string'])]]);

export default opts => (path, file) => {
  if (path.node.openingElement.name.name !== 'each') return path;
  const { pragma } = opts;
  const attrs = getAttributes(path, whitelist);
  attrs.item = attrs.item ? t.inherits(t.identifier(attrs.item.value), attrs.item) : attrs.item;
  extractChildren(path, opts, attrs);
  if (attrs.keyedBy) {
    if (!file.get('thea_keyed')) file.set('thea_keyed', () => true);
    return makeKeyedNode(attrs, pragma, path);
  }
  if (!file.get('thea_unkeyed')) file.set('thea_unkeyed', () => true);
  return makeUnkeyedNode(attrs, pragma, path);
};
