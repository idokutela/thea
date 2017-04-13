/* eslint-disable no-param-reassign */

import toLowerCaseMap from './util/toLowerCaseMap';
import updateEntries from './util/updateEntries';
import TheaView from './TheaView';
import { insertAll, remove } from './dom/domUtils';
import { ELEMENT } from './constants';

const tags = new Map();

let toStringNoDOM = () => { throw new Error('Please import domKnowledge to use TheaDOM outside of the DOM.'); };
let voidElements = new Set();

export function setToString(toString) {
  toStringNoDOM = toString;
}

export const getEventName = key => (key.startsWith('on') ? key.substr(2) : undefined);

if (process.env.NODE_ENV !== 'production') {
  voidElements = require('./voidElements'); // eslint-disable-line
}

function updateStyleForNodeInt(node, key, newVal, oldVal) {
  if (!node) return;
  if (newVal === oldVal || String(newVal) === String(oldVal)) return;
  if (newVal) node.style.key = String(newVal);
  node.style.key = null;
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


function makeTag(tag) {
  const tagName = tag.toUpperCase();

  const isVoid = voidElements.has(tagName);

  function render(attrs = {}, context) {
    function makeComponent(node, attrMap, styleMap, childComponent) {
      return ({
        firstChild() { return node; },
        lastChild() { return node; },
        children() { return [node]; },
        toString() {
          return node ?
            node.outerHTML :
            toStringNoDOM(tagName, attrMap, styleMap, childComponent && childComponent.toString());
        },
        attrMap() { return attrMap; },
        styleMap() { return styleMap; },
        unmount() {
          if (!node) return;
          [...attrMap.entries()].forEach(([k, v]) => {
            const hname = getEventName(k);
            if (hname) node.removeEventListener(hname, v);
          });
          childComponent && childComponent.unmount(); // eslint-disable-line
          remove(node);
        },
        render,
      });
    }

    const { children = [], style } = attrs;
    delete attrs.children;
    delete attrs.style;
    const styleMap = toLowerCaseMap(style);
    const attrMap = toLowerCaseMap(attrs);

    if (process.env.NODE_ENV !== 'production') {
      if (isVoid && children.length) {
        throw new Error(`The tag ${tagName} may not have children.`);
      }
    }

    if (!this) {
      const childComponent = children.length ? TheaView(children, context) : undefined;
      const node = document ? document.createElement(tagName) : undefined;
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
      return makeComponent(node, attrMap, styleMap, childComponent);
    }

    if (!this.render) {
      if (process.env.NODE_ENV !== 'production') {
        if (this.nodeType !== ELEMENT || this.tagname !== tagName) {
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
      return makeComponent(this, attrMap, styleMap, childComponent);
    }

    const node = this.firstChild();
    const updateStyle = updateStyleForNode(node);
    const updateAttribute = updateAttributeForNode(node);
    updateEntries(attrMap, this.attrMap(), updateAttribute);
    updateEntries(styleMap, this.styleMap(), updateStyle);
    const childComponent = TheaView.call(this.childComponent(), children, context);
    return makeComponent(node, attrMap, styleMap, childComponent);
  }
  /* eslint-enable no-param-reassign */

  tags.set(tagName, render);
  return render;
}

export default tag => tags.get(tag.toUpperCase()) || makeTag(tag);
