import { toStringNoDOM } from '../src/DOMKnowledge';

describe('dom knowledge tests', function () {
  it('should correctly stringify a self-closing tag', function () {
    toStringNoDOM('br',
      new Map([['hidden', null], ['contenteditable', '']]),
      new Map([['borderWidth', '3px'], ['fontFamily', '"Roboto"']]))
      .should.equal('<br hidden="null"contenteditable style="border-width:3px;font-family:&quot;Roboto&quot;"/>');
    toStringNoDOM('br').should.equal('<br/>');
    toStringNoDOM('br', new Map([['class', 'the new']])).should.equal('<br class="the new"/>');
    (() => toStringNoDOM('br', new Map(), new Map(), 'Hello')).should.throw();
  });

  it('should correctly stringify a non-self-closing tag', function () {
    toStringNoDOM('p',
      new Map([['hidden', null], ['contenteditable', '']]),
      new Map([['borderWidth', '3px'], ['fontFamily', '"Roboto"']]),
      'Foolish is he!',
    )
      .should.equal('<p hidden="null"contenteditable style="border-width:3px;font-family:&quot;Roboto&quot;">Foolish is he!</p>');
    toStringNoDOM('p').should.equal('<p></p>');
    toStringNoDOM('p', new Map([['class', 'the new']])).should.equal('<p class="the new"></p>');
  });
});
