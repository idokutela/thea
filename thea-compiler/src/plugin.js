import jsx from 'babel-plugin-syntax-jsx';
import builder from './elementTxBuilder';
import { dom, comment, view, text, keyedIter, unkeyedIter, expression } from './constants';
import { TH } from './makeNode';
import branchProcessor from './branchProcessor';
import eachProcessor from './eachProcessor';

const componentPath = 'thea/types';

const makeSubPath = type => `${componentPath}/${type}`;
const makeRequire = t => path => t.callExpression(t.identifier('require'), [t.stringLiteral(path)]);
const makeAssignment = t => (lhs, rhs) => t.variableDeclarator(lhs, rhs);
const makeId = t => x => t.identifier(x);

/* eslint-disable no-param-reassign */
export default function ({ types: t }) {
  const hasTextNode = children => children.reduce((r, child) => r || t.isJSXText(child), false);
  const hasExpression = children => children.reduce((r, child) =>
    r || t.isJSXExpressionContainer(child), false);

  const JSX_ANNOTATION_REGEX = /\*?\s*@jsx\s+([^\s]+)/;

  const visitor = builder({
    pre(state, file) {
      state.pragma = file.get('pragma')();
      const th = TH(state.pragma);
      const name = state.typeName;
      switch (name) {
        case 'comment':
          state.type = th(comment);
          if (!file.get('thea_comment')) file.set('thea_comment', () => true);
          break;
        case 'view':
          state.type = th(view);
          if (!file.get('thea_view')) file.set('thea_view', () => true);
          break;
        case 'branch':
          state.processNode = branchProcessor;
          break;
        case 'each':
          state.processNode = eachProcessor;
          break;
        default:
          if (t.react.isCompatTag(name)) {
            state.type = t.callExpression(th(dom), [t.stringLiteral(name)]); // eslint-disable-line
            if (!file.get('thea_dom')) file.set('thea_dom', () => true);
          }

          if (hasTextNode(state.node.children)) {
            if (!file.get('thea_text')) file.set('thea_text', () => true);
          }
          if (hasExpression(state.node.children)) {
            if (!file.get('thea_expression')) file.set('thea_expression', () => true);
          }
      }

      if (!file.get('import')) file.set('import', () => (file.opts.import !== undefined ? file.opts.import : true));
    },
  });

  visitor.Program = {
    enter(path, state) {
      const { file } = state;
      let id = state.opts.pragma;

      for (const comment of (file.ast.comments)) { // eslint-disable-line
        const matches = JSX_ANNOTATION_REGEX.exec(comment.value);
        if (matches) {
          id = matches[1];
          state.set('import', () => false);
          break;
        }
      }

      state.set(
        'pragma',
        () => (id ? id.split('.').map(name => t.identifier(name)).reduce(
          (object, property) => t.memberExpression(object, property)) : undefined
        ),
      );
    },
    exit(path, state) {
      const ass = makeAssignment(t);
      const req = makeRequire(t);
      const id = makeId(t);

      const shouldImport = state.get('import');
      const hasText = state.get('thea_text');
      const hasDOM = state.get('thea_dom');
      const hasExp = state.get('thea_expression');
      const hasComment = state.get('thea_comment');
      const hasKeyed = state.get('thea_keyed');
      const hasUnkeyed = state.get('thea_unkeyed');
      const hasView = state.get('thea_view');
      const assignments = [];

      if (shouldImport && shouldImport()) {
        const pragma = state.get('pragma')();
        if (pragma) {
          assignments.push(ass(pragma, req(componentPath)));
        } else {
          if (hasText && hasText()) {
            assignments.push(ass(id(text), req(makeSubPath(text))));
          }
          if (hasExp && hasExp()) {
            assignments.push(ass(id(expression), req(makeSubPath(expression))));
          }
          if (hasComment && hasComment()) {
            assignments.push(ass(id(comment), req(makeSubPath(comment))));
          }
          if (hasView && hasView()) {
            assignments.push(ass(id(view), req(makeSubPath(view))));
          }
          if (hasDOM && hasDOM()) {
            assignments.push(ass(id(dom), req(makeSubPath(dom))));
          }
          if (hasKeyed && hasKeyed()) {
            assignments.push(ass(id(keyedIter), req(makeSubPath(keyedIter))));
          }
          if (hasUnkeyed && hasUnkeyed()) {
            assignments.push(ass(id(unkeyedIter), req(makeSubPath(unkeyedIter))));
          }
        }
        if (assignments.length) {
          path.node.body.unshift(t.variableDeclaration('var', assignments));
        }
      }
    },
  };

  return {
    inherits: jsx,
    visitor,
  };
}
