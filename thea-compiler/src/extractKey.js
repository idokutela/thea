import * as t from 'babel-types';

export default (path) => {
  const attributes = path.node.openingElement.attributes;
  const maybeKey = attributes.filter(attr => t.isJSXAttribute(attr) && attr.name.name === 'key');
  if (maybeKey.length) {
    if (maybeKey.length > 1) {
      throw path.buildCodeFrameError('The attribute key may only appear once in a node.');
    }
    return t.isJSXExpressionContainer(maybeKey[0].value) ?
        maybeKey[0].value.expression : maybeKey[0].value;
  }
  return undefined;
};
