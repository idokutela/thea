import makeSimpleComponent from './simpleComponent';
import { TEXT } from './constants';
import isInBrowser from './dom/isInBrowser';
import flattenChildren from './flattenChildren';

const attrsToValue = x => x; // eslint-disable-line
const valueToString = x => x;
const createNode = isInBrowser ? value => document.createTextNode(value) : () => {};
const validateNode = node => node && node.nodeType === TEXT;
const componentName = 'unescaped test';
const baseRenderer = makeSimpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  validateNode,
  componentName,
});
export const unescapedText = makeSimpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  validateNode,
  componentName,
});

export default function makeUnescapedTextElement(renderElement) {
  return function render(attrs, context) {
    const innerAttrs = Object.assign({}, attrs);
    const content = flattenChildren(innerAttrs.children)
      .map(x => x[1])
      .reduce((r, x) => r + x, '');

    innerAttrs.children = [[baseRenderer, content]];
    const result = renderElement.call(this, innerAttrs, context);
    result.attrs = attrs;
    result.render = render;
    return result;
  };
}
