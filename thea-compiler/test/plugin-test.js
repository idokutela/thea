import { transform } from 'babel-core';

import { thea, text, dom, comment, expression } from '../src/constants';
import plugin from '../src/plugin';

describe('plugin tests', function () {
  it('should correctly transform some code', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [plugin],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <file />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `var ${text} = require('thea/types/${text}'),
    ${dom} = require('thea/types/${dom}');

a = [Mary.Elisabeth, Object.assign({ x: 12, children: [[${text}, 'Test me! '], [${dom}('file'), {}]]
}, y), '2'];`;

    code.should.equal(expectedCode);
  });

  it('should not import a dependency and use the correct pragma if set in a comment', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [plugin],
    };
    const code = transform(`/* @jsx Foo */

a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <file />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `/* @jsx Foo */

a = [Mary.Elisabeth, Object.assign({ x: 12, children: [[Foo.${text}, 'Test me! '], [Foo.${dom}('file'), {}]]
}, y), '2'];`;

    code.should.equal(expectedCode);
  });

  it('should use the correct pragma and import it if set in the options', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [[plugin, { pragma: 'Foo' }]],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <file />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `var Foo = require('thea/types');

a = [Mary.Elisabeth, Object.assign({ x: 12, children: [[Foo.${text}, 'Test me! '], [Foo.${dom}('file'), {}]]
}, y), '2'];`;

    code.should.equal(expectedCode);
  });

  it('should not import if the options forbid it', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [[plugin, { import: false, pragma: thea }]],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <file />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `a = [Mary.Elisabeth, Object.assign({ x: 12, children: [[${thea}.${text}, 'Test me! '], [${thea}.${dom}('file'), {}]]
}, y), '2'];`;

    code.should.equal(expectedCode);
  });

  it('should use the babel helper if set in the options', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [[plugin, { useHelper: true }]],
    };
    const code = transform(`a =
    <Mary.Elisabeth x={12} {...y} key='2'>
      Test me! <file />
    </Mary.Elisabeth>;`, babelOptions).code;
    const expectedCode = `var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ${text} = require('thea/types/${text}'),
    ${dom} = require('thea/types/${dom}');

a = [Mary.Elisabeth, _extends({ x: 12, children: [[${text}, 'Test me! '], [${dom}('file'), {}]]
}, y), '2'];`;

    code.should.equal(expectedCode);
  });

  it('should correctly process comments', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [plugin],
    };

    const code = transform('<comment>Hello {fool}</comment>', babelOptions).code;
    const expectedCode = `var ${comment} = require("thea/types/${comment}");

[${comment}, ["Hello ", fool]];`;

    code.should.equal(expectedCode);
  });
});
