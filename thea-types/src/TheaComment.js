import escape from 'escape-html';
import simpleComponent from './simpleComponent';
import { COMMENT } from './constants';

const attrsToValue = (attrs = []) => attrs.reduce((r, x) => r + x, '');
const valueToString = x => `<!--${escape(x)}-->`;
const createNode = value => (document ? document.createComment(value) : undefined);
const nodeType = COMMENT;
const componentName = 'Comment';
export default simpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  nodeType,
  componentName,
});
