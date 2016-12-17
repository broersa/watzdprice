/* eslint-env node, mocha */
var chai = require('chai');
// var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');
var index = require('../src/index.js');
var elasticsearch = require('elasticsearch');
var moment = require('moment');

describe('index', function () {
  var sandbox;

  beforeEach(function () {
    // Create a sandbox for the test
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    // Restore all the things made through the sandbox
    sandbox.restore();
  });

  describe('getClient', function () {
    it('should return a elasticsearch client', function (done) {
      sandbox.stub(elasticsearch, 'Client', function (options) {
        expect(options.url).to.be.equal('url');
        return {
          url: options.url
        };
      });
      index.getClient({
        url: 'url'
      }, function (error, client) {
        expect(client.url).to.be.equal('url');
        done();
      });
    });
  });
});
