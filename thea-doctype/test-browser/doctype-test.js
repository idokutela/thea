import Doctype from '../src/Doctype';


describe('Doctype tests', function () {
  it('should revive correctly', function () {
    const dt = Doctype.call(document.doctype);
    dt.firstChild().should.equal(document.doctype);
    dt.lastChild().should.equal(document.doctype);
    dt.children().should.eql([document.doctype]);
    dt.toString().should.equal('<!DOCTYPE html>');
    dt.unmount.should.be.a.Function();
  });

  it('should fail to revive an unmatching doctype', function () {
    const type = document
      .implementation
      .createDocumentType('svg:svg', '-//W3C//DTD SVG 1.1//EN', 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
    (() => Doctype.call(type, { name: 'Wazoo' })).should.throw();
    (() => Doctype.call(type, { publicId: 'Wazoo' })).should.throw();
    (() => Doctype.call(type, { systemId: 'Wazoo' })).should.throw();
    (() => Doctype.call(document)).should.throw();
  });

  it('should create a doctype node out of nothing', function () {
    const dt = Doctype({
      name: 'HTML',
      publicId: '-//W3C//DTD HTML 4.01//EN',
      systemId: 'http://www.w3.org/TR/html4/strict.dtd',
    });

    dt.firstChild().nodeType.should.equal(10);
    dt.firstChild().should.equal(dt.lastChild());
    dt.children().should.eql([dt.firstChild()]);
    dt.firstChild().name.should.equal('HTML');
    dt.firstChild().publicId.should.equal('-//W3C//DTD HTML 4.01//EN');
    dt.firstChild().systemId.should.equal('http://www.w3.org/TR/html4/strict.dtd');
    const doc = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml', 'html', dt.firstChild(),
    );
    doc.firstChild.should.equal(dt.firstChild());
    dt.unmount();
    dt.should.not.equal(doc.firstChild);
  });

  it('should not throw if attempting an update when not in production', function () {
    const dt = Doctype.call(document.doctype);
    (() => dt.render({ name: 'blue' })).should.throw();
  });
});
