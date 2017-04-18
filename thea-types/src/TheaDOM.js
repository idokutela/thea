/* eslint-disable no-param-reassign, no-use-before-define */

import toLowerCaseMap from './util/toLowerCaseMap';
import updateEntries from './util/updateEntries';
import { toMap, entries } from './util/entries';
import TheaView from './TheaView';
import { insertAll, remove } from './dom/domUtils';
import { ELEMENT } from './constants';
import camelToDash from './dom/camelToDash';
import forEach from './util/forEach';
import isInBrowser from './dom/isInBrowser';

const toStyleMap = o => toMap(entries(o));

const tags = new Map();

const NODE = Symbol('node');
const ATTRS = Symbol('attrs');
const STYLES = Symbol('styles');
const CHILD_COMPONENT = Symbol('child component');
export const NAMESPACE = Symbol('dom namespace');

let toStringNoDOM = () => { throw new Error('Please import domKnowledge to use TheaDOM outside of the DOM.'); };
let voidElements = new Set();

export function setToString(toString) {
  toStringNoDOM = toString;
}

export const getEventName = key => (key.startsWith('on') ? key.substr(2) : undefined);

// The only reason to have voidElements is to check whether the node is allowed
// children. We don’t do this check anyway in production.
if (process.env.NODE_ENV !== 'production') {
  voidElements = require('./dom/voidElements'); // eslint-disable-line
}

function updateStyleForNodeInt(node, key, newVal, oldVal) {
  if (!node) return;
  if (newVal === oldVal || String(newVal) === String(oldVal)) return;
  if (newVal) {
    node.style[key] = String(newVal);
    return;
  }

  node.style.removeProperty(camelToDash(key));
}

function updateAttributeForNodeInt(node, key, newVal, oldVal) {
  if (!node) return;
  if (newVal === oldVal) return;
  const eventName = getEventName(key);
  if (eventName) {
    oldVal && node.removeEventListener(eventName, oldVal); // eslint-disable-line
    if (newVal) {
      node.addEventListener(eventName, newVal);
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

const hasNameSpace = tag => (tag === 'svg') && 'http://www.w3.org/2000/svg';

const copy = x => Object.assign({}, x);

function makeTag(tag) {
  const tagName = tag.toLowerCase();

  const ns = hasNameSpace(tagName);
  const updateAttrs = !ns ? copy :
    attrs => Object.assign({ xmlns: ns }, attrs);

  const isVoid = voidElements.has(tagName);

  function render(attrs = {}, context = {}) {
    attrs = updateAttrs(attrs); // copy so as not to mess with attrs
    const { children = [], style = {}, ref = () => {} } = attrs;
    delete attrs.children;
    delete attrs.style;
    delete attrs.ref;
    const styleMap = toStyleMap(style);
    const attrMap = toLowerCaseMap(attrs);
    context = attrs.xmlns ?
      Object.assign({}, context, { [NAMESPACE]: attrs.xmlns }) :
      Object.assign({}, context);

    if (process.env.NODE_ENV !== 'production') {
      if (isVoid && children.length) {
        throw new Error(`The tag ${tagName} may not have children.`);
      }
    }

    if (!this) {
      const childComponent = children.length ? TheaView(children, context) : undefined;
      let node;
      if (isInBrowser) {
        node = context[NAMESPACE] ?
          document.createElementNS(context[NAMESPACE], tagName) :
          document.createElement(tagName);
      }
      if (node) {
        if (childComponent) {
          const docFrag = document.createDocumentFragment();
          insertAll(childComponent.children(), undefined, docFrag);
          node.appendChild(docFrag);
        }
        const updateStyle = updateStyleForNode(node);
        const updateAttribute = updateAttributeForNode(node);
        [...attrMap.entries()].forEach(([key, value]) => updateAttribute(key, value));
        [...styleMap.entries()].forEach(([key, value]) => updateStyle(key, value));
      }
      return updateState(node, attrMap, styleMap, childComponent);
    }

    if (!this.unmount) {
      if (process.env.NODE_ENV !== 'production') {
        if (this.nodeType !== ELEMENT || this.tagName.toLowerCase() !== tagName) {
          throw new Error(`Expected an element node of type ${tagName}`);
        }

        // Assume attributes match
        if (this.firstChild && !children.length) {
          throw new Error('Mismatch in children!');
        }
      }
      let childComponent;
      if (children.length) {
        childComponent = TheaView.call(this.firstChild, children, context);
      }
      forEach(attrMap.entries(), ([k, v]) => {
        const name = getEventName(k);
        name && this.addEventListener(name, v); // eslint-disable-line
      });
      return updateState(this, attrMap, styleMap, childComponent);
    }

    const node = this.firstChild();
    const updateStyle = updateStyleForNode(node);
    const updateAttribute = updateAttributeForNode(node);
    updateEntries(this.attrMap(), attrMap, updateAttribute);
    updateEntries(this.styleMap(), styleMap, updateStyle);
    const childComponent = this.childComponent();
    if (childComponent) {
      childComponent.render(children, context);
    }
    return updateState.call(this, node, attrMap, styleMap, childComponent);

    function updateState(node, attrMap, styleMap, childComponent) {     // eslint-disable-line
      const retval = this || {
        firstChild() { return this[NODE]; },
        lastChild() { return this[NODE]; },
        children() { return [this[NODE]]; },
        toString() {
          return this[NODE] ?
            this[NODE].outerHTML :
            toStringNoDOM(
              tagName, this[ATTRS], this[STYLES],
              this[CHILD_COMPONENT] && this[CHILD_COMPONENT].toString(),
            );
        },
        attrMap() { return this[ATTRS]; },
        styleMap() { return this[STYLES]; },
        childComponent() { return this[CHILD_COMPONENT]; },
        unmount() {
          if (!this[NODE]) return;
          [...this[ATTRS].entries()].forEach(([k, v]) => {
            const hname = getEventName(k);
            if (hname) node.removeEventListener(hname, v);
          });
          this[CHILD_COMPONENT] && this[CHILD_COMPONENT].unmount(); // eslint-disable-line
          remove(this[NODE]);
        },
        render,
      };

      retval[NODE] = node;
      retval[ATTRS] = attrMap;
      retval[STYLES] = styleMap;
      retval[CHILD_COMPONENT] = childComponent;

      if (ref) ref(retval);

      return retval;
    }
  }
  /* eslint-enable no-param-reassign */

  tags.set(tagName, render);
  return render;
}

export default tag => tags.get(tag.toLowerCase()) || makeTag(tag);
