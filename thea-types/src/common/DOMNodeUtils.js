import camelToDash from '../dom/camelToDash';
import isInBrowser from '../dom/isInBrowser';
import toLowerCaseMap from '../util/toLowerCaseMap';
import updateEntries from '../util/updateEntries';
import { toMap, entries } from '../util/entries';
import { NODE } from './singleChildUtils';
import addToUnmount from './unmountDaemon';


export const NAMESPACE = Symbol('thea/dom namespace');
export const TAGNAME = Symbol('thea/tagname');
export const ATTRS = Symbol('thea/attrs');
export const STYLES = Symbol('thea/styles');
export const CHILD_COMPONENT = Symbol('thea/child component');

let toStringNoDOM = () => { throw new Error('Please import domKnowledge to use TheaDOM outside of the DOM.'); };

export function setToString(toString) {
  toStringNoDOM = toString;
}

export function elementToString() {
  return this[NODE] ?
    this[NODE].outerHTML :
    toStringNoDOM(
      this[TAGNAME], this[ATTRS], this[STYLES],
      this[CHILD_COMPONENT] && this[CHILD_COMPONENT].toString(),
    );
}

export const getBubbledEventName = (key) => {
  const captures = /^on(.*)$/.exec(key);
  return captures && captures[1];
}; // (key.startsWith('on') ? key.substr(2) : undefined);
export const getCapturedEventName = (key) => {
  const captures = /^capture(.*)$/.exec(key);
  return captures && captures[1];
}; // (key.startsWith('capture') ? key.substr(7) : undefined);

export function unmount(isDangling) {
  if (!this[NODE]) return;

  const parent = this[NODE].parentNode;
  const isAttached = !isDangling && parent;

  if (isAttached) {
    parent.removeChild(this[NODE]);
    addToUnmount(this);
    this[CHILD_COMPONENT] && addToUnmount(this[CHILD_COMPONENT]); // eslint-disable-line
    return;
  }

  [...this[ATTRS].entries()].forEach(([k, v]) => {
    const bname = getBubbledEventName(k);
    const cname = getCapturedEventName(k);
    const name = bname || cname;
    name && this[NODE].removeEventListener(name, v, !!cname); // eslint-disable-line
  });
}

export const createNode = (tagName, context) => isInBrowser && (
  context[NAMESPACE] ?
    document.createElementNS(context[NAMESPACE], tagName) :
    document.createElement(tagName)
  );

function updateStyleForNodeInt(node, key, newVal, oldVal) {
  if (!node) return;
  if (newVal === oldVal || String(newVal) === String(oldVal)) return;
  if (newVal) {
    node.style[key] = '' + newVal; // eslint-disable-line
    return;
  }

  node.style.removeProperty(camelToDash(key));
}

function updateAttributeForNodeInt(node, key, newVal, oldVal) {
  if (!node) return;
  if (newVal === oldVal) return;
  const bubbledEventName = getBubbledEventName(key);
  const capturedEventName = getCapturedEventName(key);
  const eventName = bubbledEventName || capturedEventName;
  if (eventName) {
    oldVal && node.removeEventListener(eventName, oldVal, !!capturedEventName); // eslint-disable-line
    if (newVal) {
      node.addEventListener(eventName, newVal, !!capturedEventName);
    }
    return;
  }

  if (String(newVal) === String(oldVal)) return;

  if (newVal !== undefined) {
    node.setAttribute(key, String(newVal));
    return;
  }
  node.removeAttribute(key);
}

const updateStyleForNode = node =>
  (key, newVal, oldVal) => updateStyleForNodeInt(node, key, newVal, oldVal);
const updateAttributeForNode = node =>
  (key, newVal, oldVal) => updateAttributeForNodeInt(node, key, newVal, oldVal);

export function updateNodeAttributes(node, attrMap = new Map(), oldAttrMap = new Map()) {
  if (!node) return;
  const updater = updateAttributeForNode(node);
  updateEntries(oldAttrMap, attrMap, updater);
}

export function updateNodeStyle(node, styles, oldStyles) {
  if (!node) return;
  if (styles === undefined) {
    if (oldStyles === undefined) return;
    node.removeAttribute('style');
    return;
  }
  if (typeof styles === 'string') {
    if (oldStyles !== styles) {
      node.setAttribute('style', styles);
    }
    return;
  }
  if (typeof oldStyles === 'string') {
    oldStyles = new Map(); // eslint-disable-line
    node.removeAttribute('style');
  }
  oldStyles = oldStyles || new Map(); // eslint-disable-line

  const updater = updateStyleForNode(node);
  updateEntries(oldStyles, styles, updater);
}

/* eslint-disable no-param-reassign */
export const extractAttrMap = (attrs) => {
  delete attrs.style;
  delete attrs.ref;
  delete attrs.children;
  return toLowerCaseMap(attrs);
};
/* eslint-enable no-param-reassign */

export const extractStyles = (attrs) => {
  if (!attrs.style) return undefined;
  if (typeof attrs.style === 'string') {
    return attrs.style;
  }
  return toMap(entries(attrs.style));
};
