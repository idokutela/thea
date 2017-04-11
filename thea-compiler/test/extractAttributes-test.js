import { transform } from 'babel-core';
import * as t from 'babel-types';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import extractAttributes from '../src/extractAttributes';
import { thea, text, expression } from '../src/constants';

describe('extractAttributes tests', function () {
  const attributesPlugin = (helper, pragma = t.identifier(thea)) => () => ({
    visitor: {
      JSXElement: path => path.replaceWith(
        extractAttributes({ helper, pragma })(path),
      ),
    },
    inherits: jsxSyntax,
  });

  let babelOptions;

  const test = (code, expected) => {
    const stripUseStrict = c => c.split('\n').slice(2).join('\n');
    stripUseStrict(transform(code, babelOptions).code).should.eql(expected);
  };

  beforeEach(function () {
    babelOptions = {
      presets: ['es2015'],
      babelrc: false,
      plugins: [attributesPlugin()],
    };
  });

  it('should extract an empty attributes object if there are no attributes or children', function () {
    const code = '<node />';
    const expectedCode = '({});';
    test(code, expectedCode);
  });

  it('should extract an empty attributes object if the only attribute is a key', function () {
    const code = '<node key="12"/>';
    const expectedCode = '({});';
    test(code, expectedCode);
  });

  it('should extract any non-key attributes', function () {
    const code = '<node key="12" a={2} b="100" c />';
    const expectedCode = '({ a: 2, b: "100", c: "" });';
    test(code, expectedCode);
  });

  it('should should extract single children correctly', function () {
    const code = '<a><b c={1} /></a>';
    const expectedCode = `({
  children: [{ c: 1 }]
});`;
    test(code, expectedCode);
  });

  it('should transform text children to thea.txt nodes', function () {
    const code = '<a>What, me worry?</a>';
    const expectedCode = `({
  children: [[${thea}.${text}, "What, me worry?"]]
});`;
    test(code, expectedCode);
  });

  it('should transform expression children to thea.exp nodes', function () {
    const code = '<a>{f(32)[2]}</a>';
    const expectedCode = `({
  children: [[${thea}.${expression}, f(32)[2]]]
});`;
    test(code, expectedCode);
  });

  it('should throw if it encounters a spread child', function () {
    const code = '<a>Hello {...x}</a>';
    (() => transform(code, babelOptions)).should.throw();
  });

  it('should transform multiple children into an array with those children', function () {
    const code = '<N>{42} is the answer</N>';
    const expectedCode = `({
  children: [[${thea}.${expression}, 42], [${thea}.${text}, " is the answer"]]
});`;
    test(code, expectedCode);
  });

  it('should ignore empty expression children', function () {
    const code = '<a>👍{}</a>';
    const expectedCode = `({
  children: [[${thea}.${text}, "\\uD83D\\uDC4D"]]
});`;
    test(code, expectedCode);
  });

  it('should transform spreads into object assigns', function () {
    const code = '<a {...x} />';
    const expectedCode = 'Object.assign({}, x);';
    test(code, expectedCode);
  });

  it('should combine everything successfully', function () {
    const code = '<node {...x[4]} a="23" key="key" test={Me.first()} {...{ a: 12 }}>Some<g f="oo">h</g>{"not"}</node>';
    const expectedCode = `Object.assign({ a: "23", test: Me.first(), children: [[${thea}.${text}, "Some"], { f: "oo", children: [[${thea}.${text}, "h"]]
  }, [${thea}.${text}, "not"]]
}, x[4], { a: 12 });`;
    test(code, expectedCode);
  });

  it('should adapt to the pragma', function () {
    babelOptions.plugins = attributesPlugin(undefined, t.identifier('Moo'));
    test('<a>Hello</a>', `({
  children: [[Moo.${text}, "Hello"]]
});`);
  });

  it('should adapt to the helper', function () {
    babelOptions.plugins = attributesPlugin(t.identifier('help'));
    test('<a {...b} />', 'help({}, b);');
  });
});
