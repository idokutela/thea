import * as t from 'babel-types';

import extractType from './extractType';
import makeNode, { TH } from './makeNode';
import { comment } from './constants';

const extractChildren = (path) => {
  const transformExpression = (child, i) => {
    if (t.isJSX(child)) throw path.get(`children.${i}`).buildCodeFrameError('A comment may only have text or expression children');
    return child;
  };
  return t.react.buildChildren(path.node).map(transformExpression);
};

function getType(path) {
  const node = path.node;
  if (!t.isJSXElement(node)) {
    throw path.buildCodeFrameError('Expected a JSX element.');
  }
  const type = extractType(path.get('openingElement'));
  return t.isIdentifier(type) ? type.name : t.isStringLiteral(type) ? type.value : undefined; // eslint-disable-line
}

function process(path, state, pragma) {
  const type = getType(path);
  const commentType = TH(pragma)(comment);

  if (type !== 'comment') return path;
  if (!state.get(comment)) state.set(comment, () => true);

  const children = extractChildren(path, state, pragma, {});
  if (!children.length) {
    return makeNode(commentType, t.arrayExpression([]));
  }
  return makeNode(commentType, t.arrayExpression(children));
}

export default (path, state, { pragma }) => process(path, state, pragma);
