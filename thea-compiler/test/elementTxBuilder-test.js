import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import * as t from 'babel-types';

import { text } from '../src/constants';
import txBuilder from '../src/elementTxBuilder';

describe('tx builder tests', function () {
  it('should build a transformer', function () {
    const r = txBuilder({});
    r.should.be.an.Object();
    r.JSXElement.should.be.a.Function();
    Object.keys(r).filter(k => Object.hasOwnProperty.call(r, k)).length.should.equal(1);
  });

  it('should correctly transform some code', function () {
    const pragma = { type: 'Identifier', name: 'Thea' };
    const opts = { pre: state => Object.assign(state, { pragma }), useBuiltIns: true };
    const plugin = { visitor: txBuilder(opts), inherits: jsxSyntax };
    const babelOptions = {
      presets: ['es2015'],
      babelrc: false,
      plugins: [plugin],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <first-is />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `'use strict';

a = [Mary.Elisabeth, Object.assign({ x: 12, children: [[Thea.${text}, 'Test me! '], ['first-is', {}]]
}, y), '2'];`;
    code.should.equal(expectedCode);
  });

  it('should process the node if pre returns a node processor', function () {
    const pragma = { type: 'Identifier', name: 'Thea' };
    const opts = {
      pre: state => Object.assign(state, {
        processNode: () => t.identifier('processed'),
        pragma,
      }),
      useBuiltIns: true,
    };
    const plugin = { visitor: txBuilder(opts), inherits: jsxSyntax };
    const babelOptions = {
      presets: ['es2015'],
      babelrc: false,
      plugins: [plugin],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <first-is />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `'use strict';

a = processed;`;
    code.should.equal(expectedCode);
  });

  it('should post-process with post', function () {
    const pragma = { type: 'Identifier', name: 'Thea' };
    const opts = {
      pre: state => Object.assign(state, { pragma }),
      post: (state) => {
        state.type = t.identifier('processed'); // eslint-disable-line
        state.attributes = t.identifier('done'); // eslint-disable-line
      },
      useBuiltIns: true,
    };
    const plugin = { visitor: txBuilder(opts), inherits: jsxSyntax };
    const babelOptions = {
      presets: ['es2015'],
      babelrc: false,
      plugins: [plugin],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <first-is />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `'use strict';

a = [processed, done, '2'];`;
    code.should.equal(expectedCode);
  });
});
