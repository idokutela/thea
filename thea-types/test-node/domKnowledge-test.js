import { toStringNoDOM } from '../src/dom/domKnowledge';

describe('dom knowledge tests', function () {
  it('should correctly stringify a self-closing tag', function () {
    toStringNoDOM('BR',
      new Map([['hidden', null], ['contenteditable', '']]),
      new Map([['borderWidth', '3px'], ['fontFamily', '"Roboto"']]))
      .should.equal('<BR hidden="null"contenteditable style="border-width:3px;font-family:&quot;Roboto&quot;"/>');
    toStringNoDOM('BR').should.equal('<BR/>');
    toStringNoDOM('BR', new Map([['class', 'the new']])).should.equal('<BR class="the new"/>');
    (() => toStringNoDOM('BR', new Map(), new Map(), 'Hello')).should.throw();
  });

  it('should correctly stringify a non-self-closing tag', function () {
    toStringNoDOM('P',
      new Map([['hidden', null], ['contenteditable', '']]),
      new Map([['borderWidth', '3px'], ['fontFamily', '"Roboto"']]),
      'Foolish is he!',
    )
      .should.equal('<P hidden="null"contenteditable style="border-width:3px;font-family:&quot;Roboto&quot;">Foolish is he!</P>');
    toStringNoDOM('P').should.equal('<P></P>');
    toStringNoDOM('P', new Map([['class', 'the new']])).should.equal('<P class="the new"></P>');
  });
});
