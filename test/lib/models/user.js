var expect = require('chai').expect;
var User = require('../../../lib/models/user').model;

describe('user', function() {
    it('should be invalid if username is empty', function(done) {
        var user = new User();

        user.validate(function(err) {
            expect(err.errors.username).to.exist;
            done();
        });
    });
});