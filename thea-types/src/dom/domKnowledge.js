import escape from 'escape-html';
import voidElements from './voidElements';
import { setToString, getEventName } from '../TheaDOM';
import reduce from '../util/reduce';
import camelToDash from './camelToDash';

export { default as voidElements } from './voidElements';
export const rawTextElements = new Set(['SCRIPT', 'STYLE']);
export const escapableRawTextElements = new Set(['TEXTAREA', 'TITLE']);

export const booleanAttributes = new Set(['allowfullscreen',
  'async', 'autofocus', 'autoplay', 'checked', 'compact',
  'controls', 'declare', 'default', 'defaultchecked', 'defaultmuted',
  'defaultselected', 'defer', 'disabled', 'draggable', 'enabled',
  'formnovalidate', 'hidden', 'indeterminate', 'inert', 'ismap',
  'itemscope', 'loop', 'multiple', 'muted', 'nohref', 'noresize',
  'noshade', 'novalidate', 'nowrap', 'open', 'pauseonexit', 'readonly',
  'required', 'reversed', 'scoped', 'seamless', 'selected', 'sortable',
  'spellcheck', 'translate', 'truespeed', 'typemustmatch', 'visible']);

const concatStyleItem = (r, [k, v]) => `${r};${camelToDash(k)}:${String(v)}`;
const styleToString = styles => (styles.size ?
  `style="${reduce(styles.entries(), concatStyleItem, '')}"` : '');

const concatS = (s, t) => ((s.length && s[s.length - 1] !== '"') ? `${s} ${t}` : s + t);

function concatAttrString(r, k, v) {
  if (getEventName(k)) return r;
  if (booleanAttributes.has(k)) {
    return (v !== undefined) ? concatS(r, k) : r;
  }
  return concatS(r, `${k}="${escape(String(v))}"`);
}
const attrsToString = attrs => reduce(attrs.entries, concatAttrString, '');

export function toStringNoDOM(tagName, attrMap, styleMap, childString) {
  const styles = styleToString(styleMap);
  const attrs = styles ? concatS(attrsToString(attrMap), styles) : attrsToString(attrMap);
  if (voidElements.has(tagName)) {
    return `<${tagName} ${attrs}/>`;
  }
  return `<${tagName} ${attrs}>${childString}</${tagName}>`;
}

setToString(toStringNoDOM);
