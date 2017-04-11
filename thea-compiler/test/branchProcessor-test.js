import { transform } from 'babel-core';
import jsxSyntax from 'babel-plugin-syntax-jsx';
import branchProcessor from '../src/branchProcessor';
import { keyedIter, text } from '../src/constants';

describe('branchProcessor tests', function () {
  const attributesPlugin = () => () => ({
    visitor: {
      JSXElement: (path, file) => path.replaceWith(
        branchProcessor({})(path, file),
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

  it('should throw if a branch has no children', function () {
    const code = `
<branch>
</branch>
`;
    (() => transform(code, babelOptions)).should.throw();
  });

  beforeEach(function () {
    babelOptions = {
      presets: ['es2015'],
      babelrc: false,
      plugins: [attributesPlugin()],
    };
  });

  it('should process a branch with just one if correctly', function () {
    const code = `
<branch>
  <if test={monge.ampère}>Hello</if>
</branch>
`;
    const expectedCode = `[${keyedIter}, monge.ampère ? [${text}, "Hello", 0] : null];`;
    test(code, expectedCode);
  });

  it('should process a branch with multiple ifs correctly', function () {
    const code = `
<branch>
  <if test={monge.ampère}>Hello</if>
  <if test={true}><div>Melt</div></if>
  <if test={false}><b>Never reached</b>!</if>
</branch>
`;
    const expectedCode = `[${keyedIter}, monge.ampère ? [${text}, "Hello", 0] : true ? <div key={1}>Melt</div> : false ? [TheaView, [<b>Never reached</b>, [TheaText, "!"]], 2] : null];`;
    test(code, expectedCode);
  });

  it('should process a default correctly', function () {
    const code = `
<branch>
  <if test={monge.ampère}>Hello</if>
  <default><div>Melt</div><p>What?</p></default>
</branch>
`;
    const expectedCode = `[${keyedIter}, monge.ampère ? [${text}, "Hello", 0] : [TheaView, [<div>Melt</div>, <p>What?</p>], 1]];`;
    test(code, expectedCode);
  });
});
