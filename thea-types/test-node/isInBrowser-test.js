import isInBrowser from '../src/isInBrowser';

describe('isInBrowser tests', function () {
  it('should return be false', function () {
    isInBrowser.should.be.false();
  });
});
