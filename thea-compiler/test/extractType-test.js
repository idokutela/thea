import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import extractType from '../src/extractType';


describe('extractAttributes tests', function () {
  const keyPlugin = () => ({
    visitor: {
      JSXElement: {
        enter: path => path.replaceWith(extractType(path.get('openingElement'))),
      },
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
      plugins: [keyPlugin],
    };
  });

  it('should extract a simple type', function () {
    test('<node/>', 'node;');
  });

  it('should extract an invalid id as a string literal', function () {
    test('<data-mate/>', '"data-mate";');
  });

  it('should extract a memberExpression as a member expression', function () {
    test('<data.silver.gold />', 'data.silver.gold;');
  });

  it('should extract this as a this expression', function () {
    test('function X() { return <this.a.gold />; }', 'function X() {\n  return this.a.gold;\n}');
  });
});
