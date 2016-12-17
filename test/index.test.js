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

  describe('startSession', function () {
    it('should return an elasticsearch client', function (done) {
      sandbox.stub(elasticsearch, 'Client', function (options) {
        expect(options.host).to.be.equal('url');
        return {
          url: options.host
        };
      });
      index.startSession('url', function (error, client) {
        expect(client.url).to.be.equal('url');
        done();
      });
    });
  });

  describe('updateProduct', function () {
    it('should create new product if product not found', function (done) {
      var client = {
        get: function (record, cb) {
          expect(record.id).to.be.equal('andre-broers-572');
          expect(record.type).to.be.equal('product');
          expect(record.index).to.be.equal('nl-nl');
          expect(record.ignore).to.be.equal(404);
          return cb(null, {found: false});
        },
        create: function (record, cb) {
          expect(record.id).to.be.equal('andre-broers-572');
          return cb(null, { result: 'created' });
        }
      }
      index.updateProduct(client, 'nl-nl', moment('2016-01-01T00:00:00Z'), { name: 'Andre Broers', url: 'url' }, function (error) {
        expect(error).to.be.undefined;
        done();
      });
    });
    it('should update a product if the product is found', function (done) {
      var client = {
        get: function (record, cb) {
          expect(record.id).to.be.equal('andre-broers-572');
          expect(record.type).to.be.equal('product');
          expect(record.index).to.be.equal('nl-nl');
          expect(record.ignore).to.be.equal(404);
          return cb(null, {
            found: true,
            _source: {
              name: 'Andre Broers',
              url: 'url',
              description: 'My Description',
              eancode: '12345',
              shop: 'MyShop',
              category: 'MyCategory',
              image: 'MyImage',
              timestamp: moment('2016-01-01T00:00:00Z'),
              price: 1,
              history: [{
                timestamp: moment('2016-01-01T00:00:00Z'),
                price: 1
              }]
            }
          });
        },
        index: function (record, cb) {
          expect(record.id).to.be.equal('andre-broers-572');
          expect(record.body.price).to.be.equal(2);
          return cb(null, { result: 'updated' });
        }
      }
      index.updateProduct(client, 'nl-nl', moment('2016-01-01T00:00:00Z'), { name: 'Andre Broers', url: 'url', price: 2 }, function (error) {
        expect(error).to.be.undefined;
        done();
      });
    });
  });
});
