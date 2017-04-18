import { transform } from 'babel-core';

import { thea, text, dom, comment } from '../src/constants';
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
    const expectedCode = `var ${text} = require('thea/types/${text}').default,
    ${dom} = require('thea/types/${dom}').default;

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
    const expectedCode = `var Foo = require('thea/types').default;

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

var ${text} = require('thea/types/${text}').default,
    ${dom} = require('thea/types/${dom}').default;

a = [Mary.Elisabeth, _extends({ x: 12, children: [[${text}, 'Test me! '], [${dom}('file'), {}]]
}, y), '2'];`;

    code.should.equal(expectedCode);
  });

  it('should only import that which is needed', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [plugin],
    };

    const code = transform('<comment>Hello {fool}</comment>', babelOptions).code;
    const expectedCode = `var ${comment} = require("thea/types/${comment}").default;

[${comment}, ["Hello ", fool]];`;

    code.should.equal(expectedCode);
  });

  it('should do everything together well', function () {
    const babelOptions = {
      babelrc: false,
      plugins: [plugin],
    };

    const code = `
(
<view>
  <comment>Copyright (c) {(new Date()).getFullYear()} Manufacturably</comment>
  <h1 class="Major">Index of articles</h1>
  <each item="article" of={attrs.articles} keyedBy={(a, i) => a.id}>
    <h2 id={article.id}>{article.title}</h2>
    <h3>Published {article.date}</h3>
    <branch>
      <if test={article.isLong}>
        Long article:
        <LongForm {...article} />
      </if>
      <default>
        Short article:
        <ShortForm content={article.content} url={article.url} />
      </default>
    </branch>
    Thanks for coming!
  </each>
</view>
)`;
    const expectedCode = `var TheaText = require("thea/types/TheaText").default,
    TheaComment = require("thea/types/TheaComment").default,
    TheaView = require("thea/types/TheaView").default,
    TheaDOM = require("thea/types/TheaDOM").default,
    TheaKeyedChildren = require("thea/types/TheaKeyedChildren").default;

[TheaView, [[TheaComment, ["Copyright (c) ", new Date().getFullYear(), " Manufacturably"]], [TheaDOM("h1"), { "class": "Major", children: [[TheaText, "Index of articles"]]
}], [TheaKeyedChildren, [...attrs.articles].map((_item, _key) => ((article, key) => [TheaView, [[TheaDOM("h2"), { id: article.id, children: [[TheaKeyedChildren, article.title]]
}], [TheaDOM("h3"), {
  children: [[TheaText, "Published "], [TheaKeyedChildren, article.date]]
}], [TheaKeyedChildren, article.isLong ? [TheaView, [[TheaText, "Long article:"], [LongForm, Object.assign({}, article)]], 0] : [TheaView, [[TheaText, "Short article:"], [ShortForm, { content: article.content, url: article.url }]], 1]], [TheaText, "Thanks for coming!"]], key])(_item, ((a, i) => a.id)(_item, _key)))]]];`;
    transform(code, babelOptions).code.should.equal(expectedCode);
  });
});
