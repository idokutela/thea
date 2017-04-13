import escape from 'escape-html';
import simpleComponent from './simpleComponent';
import { TEXT } from './constants';
import isInBrowser from './dom/isInBrowser';

const attrsToValue = x => x;
const valueToString = escape;
const createNode = isInBrowser ? value => document.createTextNode(value) : () => {};
const nodeType = TEXT;
const componentName = 'Text';
export default simpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  nodeType,
  componentName,
});
