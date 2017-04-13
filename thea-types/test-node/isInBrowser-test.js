import isInBrowser from '../src/dom/isInBrowser';

describe('isInBrowser tests', function () {
  it('should return be false', function () {
    isInBrowser.should.be.false();
  });
});
