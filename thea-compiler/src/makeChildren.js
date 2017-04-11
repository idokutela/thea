import * as t from 'babel-types';

import makeNode, { TH } from './makeNode';
import { view } from './constants';

const hasKey = node => t.isJSXElement(node) &&
  node.openingElement.attributes.reduce((r, a) => r || (t.isJSXAttribute(a) && a.name.name === 'key'), false);

export default (path, state, children, pragma, key) => {
  if (!children.length) {
    throw path.buildCodeFrameError('Expected children!');
  }
  if (children.length === 1) {
    const child = children[0];
    if (t.isJSXElement(child)) {
      if (hasKey(child)) {
        throw path.buildCodeFrameError('No key allowed a direct child.');
      }
      if (key) {
        child.openingElement.attributes.unshift(
          t.jSXAttribute(t.jSXIdentifier('key'), t.jSXExpressionContainer(key)),
        );
      }
      return child;
    }
    if (key) child.elements.push(key);
    return child;
  }
  if (!state.get(view)) state.set(view, () => true);
  return makeNode(TH(pragma)(view), t.arrayExpression(children), key);
};
