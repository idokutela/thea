import * as t from 'babel-types';
import extractAttributes from './extractAttributes';
import getKey from './extractKey';
import extractType from './extractType';
import makeNode from './makeNode';

/* eslint-disable no-use-before-define */
export default (opts) => {
  return {
    JSXElement: (path, file) => path.replaceWith(t.inherits(buildVDOM(path, file), path.node)),
  };

  function buildVDOM(path, file) {
    const type = extractType(path.get('openingElement'));
    const typeName = t.isIdentifier(type) ? type.name : t.isStringLiteral(type) ? type.value : undefined; // eslint-disable-line
    const state = { typeName, type, node: path.node };
    opts.pre && opts.pre(state, file); // eslint-disable-line
    if (state.processNode) return state.processNode(path, file);
    const helper = file.opts.useHelper ? file.addHelper('extends') : undefined;
    const attrs = extractAttributes({ pragma: state.pragma, helper });
    state.attributes = attrs(path);
    state.key = getKey(path);
    opts.post && opts.post(state, file); // eslint-disable-line
    return makeNode(state.type, state.attributes, state.key);
  }
};
