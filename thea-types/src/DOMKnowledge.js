import escape from 'escape-html';
import voidElements from './dom/voidElements';
import { setToString, getCapturedEventName, getBubbledEventName } from './common/DOMNodeUtils';
import reduce from './util/reduce';
import camelToDash from './dom/camelToDash';

export { default as voidElements } from './dom/voidElements';
export const rawTextElements = new Set(['script', 'style']);
export const escapableRawTextElements = new Set(['textarea', 'title']);

export const booleanAttributes = new Set(['allowfullscreen',
  'async', 'autofocus', 'autoplay', 'checked', 'compact',
  'controls', 'declare', 'default', 'defaultchecked', 'defaultmuted',
  'defaultselected', 'defer', 'disabled', 'draggable', 'enabled',
  'formnovalidate', 'hidden', 'indeterminate', 'inert', 'ismap',
  'itemscope', 'loop', 'multiple', 'muted', 'nohref', 'noresize',
  'noshade', 'novalidate', 'nowrap', 'open', 'pauseonexit', 'readonly',
  'required', 'reversed', 'scoped', 'seamless', 'selected', 'sortable',
  'spellcheck', 'translate', 'truespeed', 'typemustmatch', 'visible']);

const concatStyleItem = (r, [k, v]) => (r ? `${r};${camelToDash(k)}:${escape(String(v))}` : `${camelToDash(k)}:${escape(String(v))}`);
const styleToString = (styles) => {
  if (!styles) return '';
  if (typeof styles === 'string') return styles;

  const keys = Object.keys(styles);
  if (!keys.length) return '';
  let result = '';
  for (let i = 0; i < keys.length; i++) { // eslint-disable-line
    result = concatStyleItem(result, [keys[i], styles[keys[i]]]);
  }
  return `style="${result}"`;
};

const concatS = (s, t) => ((s.length && s[s.length - 1] !== '"') ? `${s} ${t}` : s + t);

function concatAttrString(r, [k, v]) {
  if (v === undefined) return r;
  if (getBubbledEventName(k) || getCapturedEventName(k)) return r;
  /* if (booleanAttributes.has(k)) {
    return (v !== undefined) ? concatS(r, k) : r;
  }*/
  if (v === '') return concatS(r, k);
  return concatS(r, `${k}="${escape(String(v))}"`);
}
const attrsToString = (attrs = {}) => {
  const keys = Object.keys(attrs);
  if (!keys.length) return '';
  let result = '';
  for (let i = 0; i < keys.length; i++) { // eslint-disable-line
    result = concatAttrString(result, [keys[i], attrs[keys[i]]]);
  }
  return result;
};

export function toStringNoDOM(tagName, attrs, styles, childString = '') {
  const styleString = styleToString(styles);
  const attrsString = styles ? concatS(attrsToString(attrs), styleString) : attrsToString(attrs);
  if (voidElements.has(tagName)) {
    if (process.env.NODE_ENV !== 'production') {
      if (childString.length) {
        throw new Error(`The tag ${tagName} may not have children.`);
      }
    }
    return attrsString ? `<${tagName} ${attrsString}/>` : `<${tagName}/>`;
  }
  return attrsString ?
    `<${tagName} ${attrsString}>${childString}</${tagName}>` :
    `<${tagName}>${childString}</${tagName}>`;
}

setToString(toStringNoDOM);
