var assert = require('assert');
var expect = require('chai').expect;

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      var x = [1,2,5]
      expect( x.indexOf(4) ).to.equal(-1);
    });
  });
});
