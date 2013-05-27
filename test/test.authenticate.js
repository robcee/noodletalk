var assert = require('should');
var auth = require('../lib/authenticate');
var nock = require('nock');
var should = require('should');
var nconf = require('nconf');
var querystring = require('querystring');
var redis = require("redis");
var client = redis.createClient();

nconf.argv().env().file({ file: 'test/local-test.json' });

var authUrl = nconf.get('authUrl');
var siteUrl = nconf.get('domain') + ':' + nconf.get('port');
var qs = { assertion: '1a2b3c', audience: siteUrl };
var qsString = querystring.stringify(qs);

describe('login', function() {
  describe('POST /verify', function() {
    it('logs a user in if he/she has good credentials', function(done) {
      var response = {
        status: 'okay',
        email: 'test@test.org'
      };

      var scope = nock(authUrl).post('/verify', qsString).reply(200, response);

      var params = {
        body: {
          assertion: qs.assertion
        }
      };

      auth.verify(params, nconf, function(error, email) {
        should.not.exist(error);
        email.should.equal(response.email);
        done();
      });
    });

    it('does not log a user in if he/she has bad credentials', function(done) {
      var response = {
        status: 'invalid'
      };

      var scope = nock(authUrl).post('/verify', qsString).reply(500, response);

      var params = {
        body: {
          assertion: qs.assertion
        }
      };

      auth.verify(params, nconf, function(error, email) {
        should.exist(error);
        error.status.should.equal(response.status);
        done();
      });
    });
  });
});
