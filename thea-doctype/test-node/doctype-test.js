import Doctype from '../src/Doctype';

describe('doctype test', function () {
  it('should correctly print a default doctype', function () {
    const dt = Doctype();
    (undefined === dt.firstChild()).should.be.true();
    (undefined === dt.lastChild()).should.be.true();
    dt.children().should.eql([]);
    dt.unmount.should.be.a.Function();
    dt.toString().should.equal('<!DOCTYPE html>');
    dt.unmount(); // should not throw.
  });

  it('should correctly print a custom publicId', function () {
    const dt = Doctype({ publicId: 'foo' });
    (undefined === dt.firstChild()).should.be.true();
    (undefined === dt.lastChild()).should.be.true();
    dt.children().should.eql([]);
    dt.unmount.should.be.a.Function();
    dt.toString().should.equal('<!DOCTYPE html PUBLIC "foo">');
    dt.unmount(); // should not throw.
  });

  it('should correctly print a custom systemId', function () {
    const dt = Doctype({ systemId: 'bar' });
    (undefined === dt.firstChild()).should.be.true();
    (undefined === dt.lastChild()).should.be.true();
    dt.children().should.eql([]);
    dt.unmount.should.be.a.Function();
    dt.unmount(); // should not throw.
    dt.toString().should.equal('<!DOCTYPE html "bar">');
  });

  it('should correctly print a custom name', function () {
    const dt = Doctype({ name: 'baz' });
    (undefined === dt.firstChild()).should.be.true();
    (undefined === dt.lastChild()).should.be.true();
    dt.children().should.eql([]);
    dt.unmount.should.be.a.Function();
    dt.unmount(); // should not throw.
    dt.toString().should.equal('<!DOCTYPE baz>');
  });

  it('should correctly print a custom doctype', function () {
    const dt = Doctype({
      name: 'HTML',
      publicId: '-//W3C//DTD HTML 4.01//EN',
      systemId: 'http://www.w3.org/TR/html4/strict.dtd',
    });
    (undefined === dt.firstChild()).should.be.true();
    (undefined === dt.lastChild()).should.be.true();
    dt.children().should.eql([]);
    dt.unmount.should.be.a.Function();
    dt.unmount(); // should not throw.
    dt.toString().should.equal(
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
    );
  });
});
