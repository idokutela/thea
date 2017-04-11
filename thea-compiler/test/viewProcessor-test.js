import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import viewProcessor from '../src/viewProcessor';
import { text, view, expression } from '../src/constants';

describe('viewProcessor tests', function () {
  const plugin = () => ({
    visitor: {
      JSXElement: (path, file) => path.replaceWith(
        viewProcessor(path, file, {}),
      ),
    },
    inherits: jsxSyntax,
  });

  let babelOptions;

  const test = (code, expected) => {
    transform(code, babelOptions).code.should.eql(expected);
  };

  beforeEach(function () {
    babelOptions = {
      babelrc: false,
      plugins: [plugin],
    };
  });

  it('should complain if a view has no children', function () {
    const code = '<view />';
    (() => transform(code, babelOptions)).should.throw();
  });

  it('should replace itself with its child if it has a single child', function () {
    const code = '<view><view><view>Hello</view></view></view>';
    const expectedCode = `[${text}, "Hello"];`;

    test(code, expectedCode);
  });

  it('should process multiple children correctly', function () {
    const code = '<view><tag />Hello {mate}</view>';
    const expectedCode = `[${view}, [<tag />, [${text}, "Hello "], [${expression}, mate]]];`;

    test(code, expectedCode);
  });
});
