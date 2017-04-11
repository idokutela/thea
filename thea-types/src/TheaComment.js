import escape from 'escape-html';
import simpleComponent from './simpleComponent';

const attrsToValue = (attrs = []) => attrs.reduce((r, x) => r + x, '');
const valueToString = x => `<!--${escape(x)}-->`;
const createNode = value => (document ? document.createComment(value) : undefined);
const nodeType = 8;
const componentName = 'Comment';
export default simpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  nodeType,
  componentName,
});
