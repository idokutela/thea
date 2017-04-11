import * as t from 'babel-types';
import esutils from 'esutils';

const convertIdentifier = (node, parent) => {
  if (t.isJSXIdentifier(node)) {
    const name = node.name;

    if (name === 'this' && t.isReferenced(node, parent)) {
      return t.thisExpression();
    }

    if (esutils.keyword.isIdentifierNameES6(name)) {
      return Object.assign({}, node, { type: 'Identifier' });
    }

    return t.stringLiteral(name);
  }
  if (t.isJSXMemberExpression(node)) {
    return t.memberExpression(
      convertIdentifier(node.object, node),
      convertIdentifier(node.property, node),
    );
  }
  return node;
};

export default path => convertIdentifier(path.node.name, path.node);
