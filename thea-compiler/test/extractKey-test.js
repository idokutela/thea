import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import extractKey from '../src/extractKey';


describe('extractKey tests', function () {
  const keyPlugin = ({ types }) => ({
    visitor: {
      JSXElement: {
        enter: (path) => {
          const key = extractKey(path) || types.stringLiteral('No key.');
          return path.replaceWith(key);
        },
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

  it('should return undefined if there is no key', function () {
    test('<node a={12}/>', '"No key.";');
  });

  it('should return undefined if there is no key', function () {
    test('<node a={12} key={132.5}/>', '132.5;');
    test('<node a={12} key="billl"/>', '"billl";');
  });
});
