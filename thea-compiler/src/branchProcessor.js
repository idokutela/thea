import * as t from 'babel-types';
import extractType from './extractType';
import extractChildren from './extractChildren';
import getAttributes from './getAttributes';
import makeNode, { TH } from './makeNode';
import { view, keyedIter } from './constants';

function getType(path) {
  const node = path.node;
  if (!t.isJSXElement(node)) {
    throw path.buildCodeFrameError('Expected a JSX element.');
  }
  const type = extractType(path.get('openingElement'));
  return t.isIdentifier(type) ? type.name : t.isStringLiteral(type) ? type.value : undefined; // eslint-disable-line
}

const whitelist = new Map([['test', new Set(['expression'])]]);

const hasKey = node => t.isJSXElement(node) &&
  node.openingElement.attributes.reduce((r, a) => r || (t.isJSXAttribute(a) && a.name.name === 'key'), false);

const makeChildren = (path, children, pragma, key) => {
  if (!children.length) {
    throw path.buildCodeFrameError('Expected children!');
  }
  if (children.length === 1) {
    const child = children[0];
    if (t.isJSXElement(child)) {
      if (hasKey(child)) {
        throw path.buildCodeFrameError('No key allowed for direct children of <if> or <default>.');
      }
      child.openingElement.attributes.unshift(
        t.jSXAttribute(t.jSXIdentifier('key'), t.jSXExpressionContainer(key)),
      );
      return child;
    }
    child.elements.push(key);
    return child;
  }
  return makeNode(TH(pragma)(view), t.arrayExpression(children), key);
};

function makeIf(path, pragma) {
  if (!path.inList) {
    throw path.buildCodeFrameError('Expected <if> to be in a list of children.');
  }
  const { test: ifCondition } = getAttributes(path, whitelist);
  const attrs = extractChildren(path, { pragma }, {});
  const node = makeChildren(path, attrs.children, pragma, t.numericLiteral(path.key));
  if (path.key !== path.container.length - 1) {
    return t.conditionalExpression(ifCondition, node,
      makeBranch(path.getSibling(path.key + 1), pragma)); // eslint-disable-line
  }
  return t.conditionalExpression(ifCondition, node, t.nullLiteral());
}

function makeDefault(path, pragma) {
  if (!path.inList) {
    throw path.buildCodeFrameError('Expected <default> to be a child of <branch>.');
  }
  if (path.container.length > 1 && path.key !== path.container.length - 1) {
    throw path.buildCodeFrameError('Expected <default> to be the last child in a <branch>.');
  }
  const attrs = extractChildren(path, { pragma }, {});
  const node = makeChildren(path, attrs.children, pragma, t.numericLiteral(path.key));
  return node;
}

function makeBranch(path, pragma) {
  switch (getType(path)) {
    case 'if': return makeIf(path, pragma);
    case 'default': return makeDefault(path, pragma);
    default:
      throw path.buildCodeFrameError('A branch may only have <if> and <default> children.');
  }
}

function process(path, file, pragma) {
  const type = getType(path);

  if (type !== 'branch') return path;

  if (!file.get('thea_keyed')) file.set('thea_keyed', () => true);

  const blankWhitelist = new Map();
  getAttributes(path, blankWhitelist);

  path.node.children = path.node.children.filter(x => t.isJSXElement(x)); // eslint-disable-line

  if (!path.node.children || !path.node.children.length) {
    throw path.buildCodeFrameError('No conditions for <branch>.');
  }

  const attrs = makeBranch(path.get('children.0'));

  return makeNode(TH(pragma)(keyedIter), attrs);
}

export default ({ pragma }) => (path, file) => process(path, file, pragma);
