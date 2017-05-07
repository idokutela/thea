import camelToDash from '../dom/camelToDash';
import isInBrowser from '../dom/isInBrowser';
import { NODE } from './singleChildUtils';
import addToUnmount from './unmountDaemon';


export const NAMESPACE = Symbol('thea/dom namespace');
export const TAGNAME = Symbol('thea/tagname');
export const UPDATE_DATA = Symbol('thea/update data');
export const CHILD_COMPONENT = Symbol('thea/child component');

let toStringNoDOM = () => { throw new Error('Please import domKnowledge to use TheaDOM outside of the DOM.'); };

export function setToString(toString) {
  toStringNoDOM = toString;
}

export function elementToString() {
  const updateData = this[UPDATE_DATA];

  return this[NODE] ?
    this[NODE].outerHTML :
    toStringNoDOM(
      this[TAGNAME], updateData.attrs, updateData.styles,
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
  this.attrs && this.attrs.ref && this.attrs.ref(null); // eslint-disable-line

  if (!this[NODE]) {
    addToUnmount(this[CHILD_COMPONENT]);
    return;
  }

  const parent = this[NODE].parentNode;
  const isAttached = !isDangling && parent;

  if (isAttached) {
    parent.removeChild(this[NODE]);
    addToUnmount(this);
    this[CHILD_COMPONENT] && addToUnmount(this[CHILD_COMPONENT]); // eslint-disable-line
    return;
  }

  if (!this[NODE]) return;
  const updateData = this[UPDATE_DATA];
  const bubbled = updateData.bubbledListeners;
  const captured = updateData.capturedListeners;
  const bubbledKeys = Object.keys(bubbled);
  const capturedKeys = Object.keys(captured);

  /* eslint-disable no-plusplus */
  for (let i = 0; i < bubbledKeys.length; i++) {
    const key = bubbledKeys[i];
    this[NODE].removeEventListener(key, bubbled[key]);
  }
  for (let i = 0; i < capturedKeys.length; i++) {
    const key = capturedKeys[i];
    this[NODE].removeEventListener(key, captured[key], true);
  }
  /* eslint-enable no-plusplus */
}

export const createNode = (tagName, context) => isInBrowser && (
  context[NAMESPACE] ?
    document.createElementNS(context[NAMESPACE], tagName) :
    document.createElement(tagName)
  );

const noop = () => {};
const makeListener = (type, listeners) => (event) => {
  const listener = listeners[type] || noop;
  return listener(event);
};

/* eslint-disable no-plusplus, no-cond-assign */
function updateStyle(component, styles) {
  const node = component[NODE];
  const updateData = component[UPDATE_DATA];
  let oldStyles = updateData.styles || {};
  const newStyles = {};
  const newKeys = [];
  if (oldStyles === styles) return;
  if (styles === undefined) {
    node.removeAttribute('style');
    updateData.styles = undefined;
    updateData.styleKeys = [];
    return;
  }
  if (typeof styles === 'string') {
    updateData.styles = styles;
    updateData.styleKeys = [];
    node.setAttribute('style', styles);
    return;
  }
  if (typeof oldStyles === 'string') {
    oldStyles = {};
    component.removeAttribute('style');
  }
  const keys = Object.keys(styles);
  let updated = 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!Object.hasOwnProperty.call(styles, key)) {
      continue; // eslint-disable-line
    }
    const inOldStyles = oldStyles[key] || oldStyles.hasOwnProperty[key];

    let val = styles[key];
    val = val === undefined ? val : '' + val; // eslint-disable-line

    if (oldStyles[key] !== val) {
      if (val !== undefined) {
        node.style[key] = val;
      } else {
        node.style.removeProperty(camelToDash(key));
      }
    }

    newStyles[key] = val;
    newKeys.push(key);
    updated += inOldStyles ? 1 : 0;
    oldStyles[key] = undefined;
  }

  if (updated < updateData.styleKeys.length) {
    const styleKeys = updateData.styleKeys;
    for (let i = 0; i < styleKeys.length; i++) {
      const key = styleKeys[i];
      if (oldStyles[key]) {
        node.style.removeProperty(camelToDash(key));
      }
    }
  }

  updateData.styles = newStyles;
  updateData.styleKeys = newKeys;
}

/* eslint-disable no-continue, no-param-reassign, no-plusplus, prefer-template */
function updateNodeAttributesUnmounted(component, attrs) {
  const keys = Object.keys(attrs);
  const newAttrs = {};
  let newStyles;
  for (let i = 0; i < keys.length; i++) {
    if (!Object.hasOwnProperty.call(attrs, keys[i]) || keys[i] === 'ref' || keys[i] === 'children') {
      continue;
    }
    const val = attrs[keys[i]];
    const key = keys[i].toLowerCase();
    if (getBubbledEventName(key) || getCapturedEventName[key]) {
      continue;
    }
    if (key === 'styles') {
      newStyles = val;
      continue;
    }
    if (val !== undefined) {
      newAttrs[key] = '' + val;
    }
  }
  component[UPDATE_DATA].attrs = newAttrs;
  component[UPDATE_DATA].styles = newStyles;
}
/* eslint-enable */

export function updateNodeAttributes(component, attrs) {
  const node = component[NODE];
  if (!node) {
    updateNodeAttributesUnmounted(component, attrs);
    return;
  }
  const keys = Object.keys(attrs);
  let updated = 0;
  const newAttrs = {};
  const updateData = component[UPDATE_DATA];
  const oldAttrs = updateData.attrs;
  const labels = updateData.labels;
  const newLabels = [];

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];

    if (Object.hasOwnProperty.call(attrs, keys[i]) && key !== 'ref' && key !== 'children') {
      let val = attrs[key];
      key = key.toLowerCase();
      let captured;
      const inOldAttrs = oldAttrs[key] !== undefined || oldAttrs.hasOwnProperty[key];

      if (key === 'style') {
        updateStyle(component, val);
      } else if (captured = getBubbledEventName(key)) {
        if (!updateData.bubbledListeners[captured] && val) {
          const listener = makeListener(captured, updateData.bubbled);
          node.addEventListener(captured, listener);
          updateData.bubbledListeners[captured] = listener;
        }
        updateData.bubbled[captured] = val;
      } else if (captured = getCapturedEventName(key)) {
        if (!updateData.capturedListeners[captured] && val) {
          const listener = makeListener(captured, updateData.captured);
          node.addEventListener(captured, listener, true);
          updateData.capturedListeners[captured] = listener;
        }
        updateData.captured[captured] = val;
      } else {
        val = val === undefined ? val : '' + val; // eslint-disable-line
        if (oldAttrs[key] !== val) {
          if (val === undefined) {
            node.removeAttribute(key);
          } else {
            node.setAttribute(key, val);
          }
        }
      }

      if (inOldAttrs) {
        oldAttrs[key] = undefined;
        updated += 1;
      }

      newAttrs[key] = val;
      newLabels.push(key);
    }
  }
  if (updated < labels.length) {
    let captured;
    for (let i = 0; i < labels.length; i++) {
      const key = labels[i];
      if (oldAttrs[key] !== undefined) {
        if (captured = getBubbledEventName(key)) {
          updateData.bubbled[captured] = undefined;
        } else if (captured = getCapturedEventName(key)) {
          updateData.captured[captured] = undefined;
        } else {
          node.removeAttribute(key);
        }
      }
    }
  }
  updateData.attrs = newAttrs;
  updateData.labels = newLabels;
}

/* eslint-enable no-plusplus, no-cond-assign */
