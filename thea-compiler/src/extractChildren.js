import * as t from 'babel-types';

import makeNode, { TH } from './makeNode';
import { text, expression } from './constants';

export default (path, state, pragma, attributes) => {
  const makePVExpression = (child) => {
    const type = t.isStringLiteral(child) ? text : expression;
    if (!state.get(type)) state.set(type, () => true);
    return makeNode(TH(pragma)(type), child);
  };


  const transformExpression = child =>
    (t.isExpression(child) && !t.isJSX(child) ? makePVExpression(child) : child);

  const children = t.react.buildChildren(path.node)
    .map(transformExpression);

  if (!children.length) {
    return attributes;
  }
  return Object.assign(attributes, { children });
};
