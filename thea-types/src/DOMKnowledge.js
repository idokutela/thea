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
const styleToString = styles => (styles.size ?
  `style="${reduce(styles.entries(), concatStyleItem, '')}"` : '');

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
const attrsToString = attrs => reduce(attrs.entries(), concatAttrString, '');

export function toStringNoDOM(tagName, attrMap = new Map(), styleMap = new Map(), childString = '') {
  const styles = styleToString(styleMap);
  const attrs = styles ? concatS(attrsToString(attrMap), styles) : attrsToString(attrMap);
  if (voidElements.has(tagName)) {
    if (process.env.NODE_ENV !== 'production') {
      if (childString.length) {
        throw new Error(`The tag ${tagName} may not have children.`);
      }
    }
    return attrs ? `<${tagName} ${attrs}/>` : `<${tagName}/>`;
  }
  return attrs ?
    `<${tagName} ${attrs}>${childString}</${tagName}>` :
    `<${tagName}>${childString}</${tagName}>`;
}

setToString(toStringNoDOM);
