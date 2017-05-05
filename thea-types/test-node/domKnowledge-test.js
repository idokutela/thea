import { toStringNoDOM } from '../src/DOMKnowledge';

describe('dom knowledge tests', function () {
  it('should correctly stringify a self-closing tag', function () {
    toStringNoDOM('br',
      { hidden: null, contenteditable: '' },
      { borderWidth: '3px', fontFamily: '"Roboto"' },
    ).should.equal('<br hidden="null"contenteditable style="border-width:3px;font-family:&quot;Roboto&quot;"/>');
    toStringNoDOM('br').should.equal('<br/>');
    toStringNoDOM('br', { class: 'the new' }).should.equal('<br class="the new"/>');
    (() => toStringNoDOM('br', undefined, undefined, 'Hello')).should.throw();
  });

  it('should correctly stringify a non-self-closing tag', function () {
    toStringNoDOM('p',
      { hidden: null, contenteditable: '' },
      { borderWidth: '3px', fontFamily: '"Roboto"' },
      'Foolish is he!',
    ).should.equal('<p hidden="null"contenteditable style="border-width:3px;font-family:&quot;Roboto&quot;">Foolish is he!</p>');
    toStringNoDOM('p').should.equal('<p></p>');
    toStringNoDOM('p', { class: 'the new' }).should.equal('<p class="the new"></p>');
  });
});
