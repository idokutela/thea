import * as t from 'babel-types';

import { text, expression } from './constants';
import makeNode, { TH } from './makeNode';
// import transformText from './transformText';
// import transformExpression from './transformExpression';
const forbidden = new Set(['children']);
const toSkip = new Set(['key']);

const convertValue = (node) => {
  if (t.isJSXExpressionContainer(node)) return node.expression;
  if (t.isStringLiteral(node)) {
    node.value = node.value.replace(/\n\s+/g, " "); // eslint-disable-line
  }
  if (node === null) {
    return t.stringLiteral('');
  }
  return node;
};

const convertAttribute = path => ({ spreadValues, basicAttributes }, attribute) => {
  if (t.isJSXSpreadAttribute(attribute)) {
    return {
      spreadValues: spreadValues.concat(attribute.argument),
      basicAttributes,
    };
  }
  const name = attribute.name.name;

  if (forbidden.has(name)) {
    throw path.buildCodeFrameError(`The attribute ${name} is not allowed`);
  }

  if (!toSkip.has(name)) {
    const val = convertValue(attribute.value);
    const id = (t.isValidIdentifier(name) ?
      Object.assign({}, attribute.name, { type: 'Identifier' }) :
      t.inherits(t.stringLiteral(name), attribute)
    );
    basicAttributes.properties.push(t.inherits(t.objectProperty(id, val), attribute));
  }

  return { spreadValues, basicAttributes };
};

export const incorporateChildren = (path, { pragma }, attributes) => {
  const makePVExpression = child =>
    makeNode(TH(pragma)(t.isStringLiteral(child) ? text : expression), child);

  const transformExpression = child =>
    (t.isExpression(child) && !t.isJSX(child) ? makePVExpression(child) : child);
  const children = t.react.buildChildren(path.node)
    .map(transformExpression);

  if (!children.length) {
    return attributes;
  }
  attributes.properties.push(t.inherits(t.objectProperty(
    t.identifier('children'),
    t.arrayExpression(children),
  ), path.node.children));
  return attributes;
};

const assignSpreadValues = ({
    helper = t.memberExpression(t.identifier('Object'), t.identifier('assign')),
  },
  attributes,
  spreadValues,
) => {
  if (!spreadValues.length) return attributes;
  return t.callExpression(helper, [attributes].concat(spreadValues));
};

const makeAttributesObject = (opts, path) => {
  const attributes = path.node.openingElement.attributes;
  const { spreadValues, basicAttributes } = attributes.reduce(convertAttribute(path),
    { spreadValues: [], basicAttributes: t.objectExpression([]) });

  const result = incorporateChildren(path, opts, basicAttributes);

  return assignSpreadValues(opts, result, spreadValues);
};

/**
 * Assumes a JSXElement is the node in the path, and
 * extracts an attr object from it as an object property
 * 'attr: Object'.
 */
export default opts => path => makeAttributesObject(opts, path);
