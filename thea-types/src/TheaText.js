import escape from 'escape-html';
import simpleComponent from './simpleComponent';
import { TEXT } from './constants';

const attrsToValue = x => x;
const valueToString = escape;
const createNode = value => (document ? document.createTextNode(value) : undefined);
const nodeType = TEXT;
const componentName = 'Text';
export default simpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  nodeType,
  componentName,
});
