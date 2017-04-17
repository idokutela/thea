import * as t from 'babel-types';

const spread = Symbol('spread');

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

const getAttribute = (path, accept) => (attrs, attribute, i) => {
  if (t.isJSXSpreadAttribute(attribute)) {
    if (accept(spread, spread)) {
      return Object.assign(attrs, { [spread]: (attrs[spread] || []).concat(attribute.argument) });
    }
    throw path.get(`openingElement.attributes.${i}`).buildCodeFrameError('Spread not allowed in each');
  }
  const name = attribute.name.name;
  if (name === 'key') return attrs;

  const type =
    t.isStringLiteral(attribute.value) ? // eslint-disable-line
      'string' :
    attribute.value === null ?
      'empty' :
      'expression';

  const val = convertValue(attribute.value);

  if (attrs.name) {
    throw path.get(`openingElement.attributes.${i}`).buildCodeFrameError(`The attribute ${name} has already been set.`);
  }

  if (accept(name, type)) {
    return Object.assign(attrs, { [name]: val });
  }
  throw path.get(`openingElement.attributes.${i}`).buildCodeFrameError(`The attribute “${name}” may not have type ${type}.`);
};

export default function getAttributes(path, whitelist, blacklist) {
  let whitelister = () => true;
  let blacklister = () => true;
  if (whitelist) {
    whitelister = (key, type) => (whitelist.get(key) || new Set()).has(type);
  }
  if (blacklist) {
    blacklister = key => !blacklist.has(key);
  }
  const accept = (key, type) => whitelister(key, type) && blacklister(key);

  const attributes = path.node.openingElement.attributes;
  return attributes.reduce(getAttribute(path, accept), {});
}

export const makeAttrsObject = (attrs) => {
  attrs.children = t.arrayExpression(attrs.children); // eslint-disable-line
  return t.objectExpression(
    Object
      .keys(attrs)
      .filter(key => Object.hasOwnProperty.call(attrs, key))
      .map(key => t.objectProperty(t.identifier(key), attrs[key])),
  );
};
