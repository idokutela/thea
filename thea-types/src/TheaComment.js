import escape from 'escape-html';
import simpleComponent from './simpleComponent';
import { COMMENT } from './constants';
import isInBrowser from './dom/isInBrowser';

const attrsToValue = (attrs = []) => attrs.reduce((r, x) => r + x, '');
const valueToString = x => `<!--${escape(x)}-->`;
const createNode = isInBrowser ? value => document.createComment(value) : () => {};
const nodeType = COMMENT;
const componentName = 'Comment';
export default simpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  nodeType,
  componentName,
});
