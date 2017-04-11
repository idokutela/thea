import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import commentProcessor from '../src/commentProcessor';
import { comment } from '../src/constants';

describe('viewProcessor tests', function () {
  const plugin = () => ({
    visitor: {
      JSXElement: (path, file) => path.replaceWith(
        commentProcessor(path, file, {}),
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

  it('should make an empty comment', function () {
    const code = '<comment />';
    const expectedCode = `[${comment}, []];`;
    test(code, expectedCode);
  });

  it('should handle single children', function () {
    const code = '<comment>This is a comment</comment>';
    const expectedCode = `[${comment}, ["This is a comment"]];`;

    test(code, expectedCode);
  });

  it('should handle multiple children', function () {
    const code = '<comment>Do not do {it}</comment>';
    const expectedCode = `[${comment}, ["Do not do ", it]];`;

    test(code, expectedCode);
  });

  it('should complain if it has illegal children', function () {
    const code = '<comment><div/> bla</comment>';
    (() => transform(code, babelOptions)).should.throw();
  });
});
