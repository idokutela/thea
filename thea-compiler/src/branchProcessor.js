import * as t from 'babel-types';
import extractType from './extractType';
import extractChildren from './extractChildren';
import getAttributes from './getAttributes';
import makeNode, { TH } from './makeNode';
import { keyedIter } from './constants';
import makeChildren from './makeChildren';

function getType(path) {
  const node = path.node;
  if (!t.isJSXElement(node)) {
    throw path.buildCodeFrameError('Expected a JSX element.');
  }
  const type = extractType(path.get('openingElement'));
  return t.isIdentifier(type) ? type.name : t.isStringLiteral(type) ? type.value : undefined; // eslint-disable-line
}

const whitelist = new Map([['test', new Set(['expression'])]]);

function makeIf(path, state, pragma) {
  if (!path.inList) {
    throw path.buildCodeFrameError('Expected <if> to be in a list of children.');
  }
  const { test: ifCondition } = getAttributes(path, whitelist);
  const attrs = extractChildren(path, state, pragma, {});
  const node = makeChildren(path, state, attrs.children, pragma, t.numericLiteral(path.key));
  if (path.key !== path.container.length - 1) {
    return t.conditionalExpression(ifCondition, node,
      makeBranch(path.getSibling(path.key + 1), state, pragma)); // eslint-disable-line
  }
  return t.conditionalExpression(ifCondition, node, t.nullLiteral());
}

function makeDefault(path, state, pragma) {
  if (!path.inList) {
    throw path.buildCodeFrameError('Expected <default> to be a child of <branch>.');
  }
  if (path.container.length > 1 && path.key !== path.container.length - 1) {
    throw path.buildCodeFrameError('Expected <default> to be the last child in a <branch>.');
  }
  const attrs = extractChildren(path, state, pragma, {});
  const node = makeChildren(path, state, attrs.children, pragma, t.numericLiteral(path.key));
  return node;
}

function makeBranch(path, state, pragma) {
  switch (getType(path)) {
    case 'if': return makeIf(path, state, pragma);
    case 'default': return makeDefault(path, state, pragma);
    default:
      throw path.buildCodeFrameError('A branch may only have <if> and <default> children.');
  }
}

function process(path, state, pragma) {
  const type = getType(path);

  if (type !== 'branch') return path;

  if (!state.get(keyedIter)) state.set(keyedIter, () => true);

  const blankWhitelist = new Map();
  getAttributes(path, blankWhitelist);

  path.node.children = path.node.children.filter(x => t.isJSXElement(x)); // eslint-disable-line

  if (!path.node.children || !path.node.children.length) {
    throw path.buildCodeFrameError('No conditions for <branch>.');
  }

  const attrs = makeBranch(path.get('children.0'), state, pragma);

  return makeNode(TH(pragma)(keyedIter), attrs);
}

export default (path, file, { pragma }) => process(path, file, pragma);
