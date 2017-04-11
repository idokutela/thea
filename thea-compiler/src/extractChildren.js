import * as t from 'babel-types';

import makeNode, { TH } from './makeNode';
import { text, expression } from './constants';

export default (path, { pragma }, attributes) => {
  const makePVExpression = child =>
    makeNode(TH(pragma)(t.isStringLiteral(child) ? text : expression), child);

  const transformExpression = child =>
    (t.isExpression(child) && !t.isJSX(child) ? makePVExpression(child) : child);
  const children = t.react.buildChildren(path.node)
    .map(transformExpression);

  if (!children.length) {
    return attributes;
  }
  return Object.assign(attributes, { children });
};
