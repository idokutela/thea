import camelToDash from '../dom/camelToDash';
import isInBrowser from '../dom/isInBrowser';
import addToUnmount from './unmountDaemon';
import { MOUNTED } from '../constants';
import { toString as childrenToString } from './multiChildUtils';

export const NAMESPACE = Symbol('thea/dom namespace');

let toStringNoDOM = () => { throw new Error('Please import domKnowledge to use TheaDOM outside of the DOM.'); };

export function setToString(toString) {
  toStringNoDOM = toString;
}

export function elementToString() {
  if (!this[MOUNTED]) {
    throw new Error('Attempting to render an unmounted component.');
  }

  const mounted = this[MOUNTED];

  return mounted.node ?
    mounted.node.outerHTML :
    toStringNoDOM(
      this.tagName, mounted.attrs, mounted.styles,
      mounted.childComponents && childrenToString.call(this),
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


export function finaliseUnmount() {
  if (!this.node) return;

  const node = this.node;
  this.node = undefined;

  const bubbled = this.bubbledListeners;
  const captured = this.capturedListeners;
  const bubbledKeys = Object.keys(bubbled);
  const capturedKeys = Object.keys(captured);

  /* eslint-disable no-plusplus */
  for (let i = 0; i < bubbledKeys.length; i++) {
    const key = bubbledKeys[i];
    node.removeEventListener(key, bubbled[key]);
  }
  for (let i = 0; i < capturedKeys.length; i++) {
    const key = capturedKeys[i];
    node.removeEventListener(key, captured[key], true);
  }
  /* eslint-enable no-plusplus */
}

export function unmount(isDangling) {
  this.attrs && this.attrs.ref && this.attrs.ref(null); // eslint-disable-line
  const mounted = this[MOUNTED];
  this[MOUNTED] = undefined;
  if (!mounted) {
    return;
  }

  mounted.childComponents && addToUnmount(mounted.childComponents); // eslint-disable-line
  mounted.childComponents = undefined;

  if (!mounted.node) {
    return;
  }

  const parent = mounted.node.parentNode;
  const isAttached = !isDangling && parent;

  if (isAttached) {
    parent.removeChild(mounted.node);
  }
  mounted.bubbled = {};
  mounted.captured = {};
  addToUnmount([mounted]);
}

export const createNode = (tagName, context) => isInBrowser && (
  context[NAMESPACE] ?
    document.createElementNS(context[NAMESPACE], tagName) :
    document.createElement(tagName)
  );

const noop = () => {};
const makeListener = (type, listeners, capOrBub) => (event) => {
  const listener = listeners[capOrBub][type] || noop;
  return listener(event);
};

/* eslint-disable no-plusplus, no-cond-assign */
function updateStyle(component, styles) {
  const mounted = component[MOUNTED];
  const node = mounted.node;
  let oldStyles = mounted.styles || {};
  const newStyles = {};
  const newKeys = [];
  if (oldStyles === styles) return;
  if (styles === undefined) {
    node.removeAttribute('style');
    mounted.styles = undefined;
    mounted.styleKeys = [];
    return;
  }
  if (typeof styles === 'string') {
    mounted.styles = styles;
    mounted.styleKeys = [];
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
    if (!Object.hasOwnProperty.call(styles, key)) continue; // eslint-disable-line
    const inOldStyles = oldStyles[key] || Object.hasOwnProperty.call(oldStyles, key);

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

  if (updated < mounted.styleKeys.length) {
    const styleKeys = mounted.styleKeys;
    for (let i = 0; i < styleKeys.length; i++) {
      const key = styleKeys[i];
      if (oldStyles[key]) {
        node.style.removeProperty(camelToDash(key));
      }
    }
  }

  mounted.styles = newStyles;
  mounted.styleKeys = newKeys;
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
  component[MOUNTED].attrs = newAttrs;
  component[MOUNTED].styles = newStyles;
}
/* eslint-enable */

export function updateNodeAttributes(component, attrs) {
  const mounted = component[MOUNTED];
  const node = mounted.node;
  if (!node) {
    updateNodeAttributesUnmounted(component, attrs);
    return;
  }
  const keys = Object.keys(attrs);
  let updated = 0;
  const newAttrs = {};
  const oldAttrs = mounted.attrs;
  const labels = mounted.labels;
  const newLabels = [];

  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];

    if (Object.hasOwnProperty.call(attrs, key) && key !== 'ref' && key !== 'children') {
      let val = attrs[key];
      key = key.toLowerCase();
      let captured;
      const inOldAttrs = oldAttrs[key] !== undefined || Object.hasOwnProperty.call(oldAttrs, key);

      if (key === 'style') {
        updateStyle(component, val);
      } else if (captured = getBubbledEventName(key)) {
        if (!mounted.bubbledListeners[captured] && val) {
          const listener = makeListener(captured, mounted, 'bubbled');
          node.addEventListener(captured, listener);
          mounted.bubbledListeners[captured] = listener;
        }
        mounted.bubbled[captured] = val;
      } else if (captured = getCapturedEventName(key)) {
        if (!mounted.capturedListeners[captured] && val) {
          const listener = makeListener(captured, mounted, 'captured');
          node.addEventListener(captured, listener, true);
          mounted.capturedListeners[captured] = listener;
        }
        mounted.captured[captured] = val;
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
          mounted.bubbled[captured] = undefined;
        } else if (captured = getCapturedEventName(key)) {
          mounted.captured[captured] = undefined;
        } else {
          node.removeAttribute(key);
        }
      }
    }
  }
  mounted.attrs = newAttrs;
  mounted.labels = newLabels;
}

/* eslint-enable no-plusplus, no-cond-assign */
