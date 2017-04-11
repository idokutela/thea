import * as types from 'babel-types';
import generate from 'babel-generator';
import makeNode, { TH } from '../src/makeNode';

describe('makeNode tests', function () {
  it('should make a TH correctly', function () {
    const thea = types.memberExpression(types.identifier('foo'), types.identifier('bar'));
    generate(TH(thea)('test.me')).code.should.equal('foo.bar.test.me');
  });

  it('should make a TH correctly without head', function () {
    generate(TH()('test.me')).code.should.equal('test.me');
  });

  it('should make a node correctly', function () {
    const type = types.memberExpression(types.identifier('foo'), types.identifier('bar'));
    const children = types.identifier('a');
    generate(makeNode(type, children)).code.should.equal('[foo.bar, a]');
  });
});
