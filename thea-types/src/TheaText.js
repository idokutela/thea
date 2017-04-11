import escape from 'escape-html';
import simpleComponent from './simpleComponent';


const attrsToValue = x => x;
const valueToString = escape;
const createNode = value => (document ? document.createTextNode(value) : undefined);
const nodeType = 3;
const componentName = 'Text';
export default simpleComponent({
  attrsToValue,
  valueToString,
  createNode,
  nodeType,
  componentName,
});
