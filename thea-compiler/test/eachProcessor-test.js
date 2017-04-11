import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import eachProcessor from '../src/eachProcessor';

describe('eachProcessor tests', function () {
  const attributesPlugin = () => () => ({
    visitor: {
      JSXElement: (path, file) => path.replaceWith(
        eachProcessor({})(path, file),
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

  it('should process an each correctly', function () {
    const code = `
<each item="made" of={attrs.items} keyedBy={made.id}>Hello</each>
`;
    console.log(transform(code, babelOptions).code);
  });
});
