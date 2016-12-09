/* eslint-env node, mocha */
var chai = require('chai');
// var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');
var index = require('../src/index.js');

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

  it('should run', function () {
    // sandbox.stub(config, 'get', function (param) {
    //   return '';
    // });
    var x = index.bulkUpdate();
    expect(x).to.be.false;
  });
});
