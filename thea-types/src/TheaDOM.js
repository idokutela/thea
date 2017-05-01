import TheaView from './TheaView';
import { insertAll } from './dom/domUtils';
import {
  firstChild, lastChild, children as getChildren, NODE,
} from './common/singleChildUtils';
import {
  TAGNAME, NAMESPACE, ATTRS, STYLES, CHILD_COMPONENT,
  extractStyles, extractAttrMap,
  createNode, updateNodeAttributes, updateNodeStyle, elementToString, unmount,
} from './common/DOMNodeUtils';
import namespaceMap from './dom/namespacedElements';
import makeUnescaped from './makeUnescaped';

const tags = new Map();

let voidElements = new Set();

// The only reason to have voidElements is to check whether the node is allowed
// children. We don’t do this check anyway in production.
if (process.env.NODE_ENV !== 'production') {
  voidElements = require('./dom/voidElements'); // eslint-disable-line
}

const copy = x => Object.assign({}, x);

function makeTag(tag) {
  const tagName = tag.toLowerCase();

  const prototype = {
    firstChild,
    lastChild,
    children: getChildren,
    toString: elementToString,
    unmount,
    render: TheaDOM, // eslint-disable-line
    [TAGNAME]: tagName,
  };

  const ns = namespaceMap.get(tagName);
  const cloneAttrs = !ns ? copy :
      attrs => Object.assign({ xmlns: ns }, attrs);
  const cloneContext = (context, attrs) => Object.assign(
    {}, context, attrs.xmlns ? { [NAMESPACE]: attrs.xmlns } : {},
  );

  const isVoid = voidElements.has(tagName);

  function TheaDOM(attrs = {}, context = {}) {
    const clonedAttrs = cloneAttrs(attrs);
    const attrMap = extractAttrMap(clonedAttrs);
    const styles = extractStyles(attrs);
    const { ref, children = [] } = attrs;
    const isMounting = !this || !this.unmount;
    let result = this;

    context = cloneContext(context, cloneAttrs(attrs)); // eslint-disable-line

    if (process.env.node_env !== 'production') {
      if (isVoid && children.length) {
        throw new Error(`The tag ${tagName} may not have children.`);
      }
    }

    if (isMounting) {
      result = Object.create(prototype);
      const node = this || createNode(tagName, context);
      const childComponent = children.length ?
        TheaView.call(node && node.firstChild, children, context) :
        undefined;

      result[NODE] = node;
      result[CHILD_COMPONENT] = childComponent;
      result[ATTRS] = new Map();
      result[STYLES] = new Map();

      if (node) {
        if (!node.firstChild && childComponent) {
          const docFrag = document.createDocumentFragment();
          insertAll(childComponent.children(), undefined, docFrag);
          node.appendChild(docFrag);
        }
      }
    } else {
      const childComponent = this[CHILD_COMPONENT];
      if (childComponent) {
        childComponent.render(children, context);
      }
    }

    updateNodeAttributes(result[NODE], attrMap, result[ATTRS]);
    updateNodeStyle(result[NODE], styles, result[STYLES]);

    result[ATTRS] = attrMap;
    result[STYLES] = styles;
    result.attrs = attrs;
    result.context = context;
    ref && ref(result[NODE]); // eslint-disable-line
    return result;
  }

  tags.set(tagName, TheaDOM);
  return TheaDOM;
}

const script = makeUnescaped(makeTag('script'));
tags.set('script', script);
const style = makeUnescaped(makeTag('style'));
tags.set('style', style);

export default tag => tags.get(tag.toLowerCase()) || makeTag(tag);
