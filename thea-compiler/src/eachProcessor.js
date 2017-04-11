import * as t from 'babel-types';

import makeNode, { TH } from './makeNode';
import { keyedIter, unkeyedIter } from './constants';
import extractKey from './extractKey';
import extractChildren from './extractChildren';
import getAttributes from './getAttributes';
import makeChildren from './makeChildren';

function makeMap(iterable, mapper) {
  return t.callExpression(
    t.memberExpression(t.arrayExpression([t.spreadElement(iterable)]), t.identifier('map')),
    [mapper],
  );
}

function makeKeyedNode(path, state, pragma, {
  children,
  of,
  item = t.identifier('item'),
  keyedBy = t.identifier('key'),
}) {
  const thea = TH(pragma);
  const key = t.identifier('key');
  const itemId = path.scope.generateUidIdentifier('item');
  const keyId = path.scope.generateUidIdentifier('key');

  if (of === undefined) {
    throw path.buildCodeFrameError('An “of” iterable must be specified for “each”.');
  }
  if (children.length === 0) {
    throw path.buildCodeFrameError('No children for “each”.');
  }

  const child = makeChildren(path, state, children, pragma, key);

  const innerF = t.arrowFunctionExpression([item, key], child);

  const computedChild = t.callExpression(
    innerF, [itemId, t.callExpression(keyedBy, [itemId, keyId])]);

  const mapFunction = t.arrowFunctionExpression([itemId, keyId], computedChild);

  const args = makeMap(of, mapFunction);

  return makeNode(thea(keyedIter), args, extractKey(path));
}

function makeUnkeyedNode(path, state, pragma, {
  children,
  of,
  item = t.identifier('item'),
}) {
  const thea = TH(pragma);
  if (of === undefined) {
    throw path.buildCodeFrameError('An “of” iterable must be specified for “each”.');
  }

  const child = makeChildren(path, state, children, pragma);

  const computedChild = t.arrowFunctionExpression([
    item, t.identifier('key'),
  ], child);

  const args = makeMap(of, computedChild);

  const node = makeNode(thea(unkeyedIter), args, extractKey(path));
  return node;
}

const whitelist = new Map([['of', new Set(['expression'])], ['keyedBy', new Set(['expression'])], ['item', new Set(['string'])]]);

export default (path, state, opts) => {
  if (path.node.openingElement.name.name !== 'each') return path;
  const { pragma } = opts;
  const attrs = getAttributes(path, whitelist);
  attrs.item = attrs.item ? t.inherits(t.identifier(attrs.item.value), attrs.item) : attrs.item;
  extractChildren(path, state, pragma, attrs);
  if (attrs.keyedBy) {
    if (!state.get(keyedIter)) state.set(keyedIter, () => true);
    return makeKeyedNode(path, state, pragma, attrs, pragma);
  }
  if (!state.get(unkeyedIter)) state.set(unkeyedIter, () => true);
  return makeUnkeyedNode(path, state, pragma, attrs, pragma);
};
