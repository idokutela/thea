import * as t from 'babel-types';

import extractType from './extractType';
import extractChildren from './extractChildren';
import makeChildren from './makeChildren';

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

  if (type !== 'view') return path;
  const { children = [] } = extractChildren(path, state, pragma, {});
  return makeChildren(path, state, children, pragma);
}

export default (path, state, { pragma }) => process(path, state, pragma);
