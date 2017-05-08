import TheaView from './TheaView';
import { insertAll } from './dom/domUtils';
import {
  firstChild, lastChild, children as getChildren, isReady, isMounted,
} from './common/singleChildUtils';
import {
  NAMESPACE, finaliseUnmount,
  createNode, updateNodeAttributes, elementToString, unmount,
} from './common/DOMNodeUtils';
import namespaceMap from './dom/namespacedElements';
import makeUnescaped from './makeUnescaped';
import { MOUNTED, DEBUG } from './constants';

const tags = new Map();

let voidElements = new Set();

// The only reason to have voidElements is to check whether the node is allowed
// children. We don’t do this check anyway in production.
if (process.env.NODE_ENV !== 'production') {
  voidElements = require('./dom/voidElements'); // eslint-disable-line
}

function makeTag(tag) {
  const tagName = tag.toLowerCase();

  const prototype = {
    firstChild,
    lastChild,
    children: getChildren,
    toString: elementToString,
    unmount,
    render: TheaDOM, // eslint-disable-line
    tagName,
    isReady,
    isMounted,
  };

  const ns = namespaceMap.get(tagName);
  const setNS = ns ? (attrs) => {
    attrs.xmlns = attrs.xmlns || ns; // eslint-disable-line
    return attrs;
  } : attrs => attrs;
  const updateContext = (context, attrs) => (attrs.xmlns ?
    Object.assign(
      {}, context, attrs.xmlns ? { [NAMESPACE]: attrs.xmlns } : {},
    ) : context);

  const isVoid = voidElements.has(tagName);

  function TheaDOM(attrs = {}, context = {}) {
    attrs = setNS(attrs); // eslint-disable-line
    context = updateContext(context, attrs); // eslint-disable-line
    const ref = attrs.ref;
    const children = attrs.children || [];
    const isMounting = !this || !this[MOUNTED];
    let result = this;

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

      result[MOUNTED] = {
        node,
        childComponent,
        attrs: {},
        styles: undefined,
        bubbled: {},
        bubbledListeners: {},
        captured: {},
        capturedListeners: {},
        labels: [],
        styleKeys: [],
        unmount: finaliseUnmount,
      };

      if (process.env.node_env !== 'production') {
        result[DEBUG] = {
          attrs, context, tagName,
        };
      }

      if (node) {
        if (!node.firstChild && childComponent) {
          insertAll(childComponent.children(), undefined, node);
        }
      }
    } else {
      const childComponent = this[MOUNTED].childComponent;
      if (childComponent) {
        childComponent.render(children, context);
      }
    }

    if (process.env.node_env !== 'production') {
      result[DEBUG].attrs = attrs;
      result[DEBUG].context = context;
    }

    updateNodeAttributes(result, attrs);

    ref && ref(result[MOUNTED].node); // eslint-disable-line
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
