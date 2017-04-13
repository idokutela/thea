import isInBrowser from '../src/isInBrowser';

describe('isInBrowser tests', function () {
  it('should return be true', function () {
    isInBrowser.should.be.true();
  });
});
