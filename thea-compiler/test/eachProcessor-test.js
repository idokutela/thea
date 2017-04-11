import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import eachProcessor from '../src/eachProcessor';
import { keyedIter, unkeyedIter, text, view, expression } from '../src/constants';

describe('eachProcessor tests', function () {
  const plugin = () => ({
    visitor: {
      JSXElement: (path, file) => path.replaceWith(
        eachProcessor(path, file, {}),
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

  it('should protest if there is no of', function () {
    const code = '<each>Test</each>';
    (() => transform(code, babelOptions)).should.throw();
  });

  it('should process a non-item non-keyed each correctly', function () {
    const code = '<each of={attrs.items}>Hello</each>';
    const expectedCode = `[${unkeyedIter}, [...attrs.items].map((item, key) => [${text}, "Hello"])];`;

    test(code, expectedCode);
  });

  it('should process a simple non-keyed each correctly', function () {
    const code = '<each item="name" of={attrs.items}>Hello</each>';
    const expectedCode = `[${unkeyedIter}, [...attrs.items].map((name, key) => [${text}, "Hello"])];`;

    test(code, expectedCode);
  });

  it('should process a simple non-keyed each with multiple children correctly', function () {
    const code = `<each item="name" of={attrs.items}>
  <div>Test</div> text {name.value}!
</each>`;
    const expectedCode = `[${unkeyedIter}, [...attrs.items].map((name, key) => [${view}, [<div>Test</div>, [${text}, " text "], [${expression}, name.value], [${text}, "!"]]])];`;
    test(code, expectedCode);
  });

  it('should complain if there are no children', function () {
    const code = '<each item="name" of={attrs.items}></each>';
    (() => transform(code, babelOptions)).should.throw();
  });

  it('should flag that unkeyed has been seen', function () {
    let value = false;
    const checkKey = key => (path, state) => {
      value = state.get(key)();
    };
    const checkPlugin = () => ({
      visitor: {
        JSXElement: (path, file) => path.replaceWith(
          eachProcessor(path, file, {}),
        ),
        Program: {
          exit: checkKey(unkeyedIter),
        },
      },
      inherits: jsxSyntax,
    });

    babelOptions.plugins = [checkPlugin];
    transform('<each item="name" of={attrs.items}>Hello</each>', babelOptions);
    value.should.equal(true);
  });

  it('should process a keyed each correctly', function () {
    const code = '<each item="article" of={articles} keyedBy={article => article.id}><Article {...article} /></each>';
    const expectedCode = `[${keyedIter}, [...articles].map((_item, _key) => ((article, key) => <Article key={key} {...article} />)(_item, (article => article.id)(_item, _key)))];`;
    test(code, expectedCode);
  });

  it('should process a keyed each with multiple children correctly', function () {
    const code = '<each item="article" of={articles} keyedBy={article => article.id}><h1>{article.id}</h1><h2>Published: {article.date}</h2>{article.content}</each>';
    const expectedCode = `[${keyedIter}, [...articles].map((_item, _key) => ((article, key) => [${view}, [<h1>{article.id}</h1>, <h2>Published: {article.date}</h2>, [${expression}, article.content]], key])(_item, (article => article.id)(_item, _key)))];`;
    test(code, expectedCode);
  });

  it('should flag that keyed has been seen', function () {
    let value = false;
    const checkKey = key => (path, state) => {
      value = state.get(key)();
    };
    const checkPlugin = () => ({
      visitor: {
        JSXElement: (path, file) => path.replaceWith(
          eachProcessor(path, file, {}),
        ),
        Program: {
          exit: checkKey(keyedIter),
        },
      },
      inherits: jsxSyntax,
    });

    babelOptions.plugins = [checkPlugin];
    transform('<each item="article" of={articles} keyedBy={article => article.id}><Article {...article} /></each>', babelOptions);
    value.should.equal(true);
  });
});
