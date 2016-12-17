var config = require('config');
var elasticsearch = require('elasticsearch');
var md5 = require('md5');
var urlify = require('urlify').create({
  spaces: '-',
  nonPrintable: '',
  trim: true
});

var client = new elasticsearch.Client({
  host: config.elastic_url,
  log: 'trace'
});

module.exports = {
  updateProduct: function (now, product, cb) {
    var id = generateId(product.name, product.url);
    client.get({
      index: config.elastic_index,
      type: 'product',
      id: id,
      ignore: 404
    }, function (error, response) {
      if (error) {
        return cb(error);
      }
      if (!response.found) {
        return newProduct(now, id, product, cb);
      } else {
        response._source.name = product.name;
        response._source.description = product.description;
        response._source.eancode = product.eancode;
        response._source.shop = product.shop;
        response._source.category = product.category;
        response._source.image = product.image;
        response._source.timestamp = now;
        response._source.price = product.price;
        response._source.history.push({timestamp: now, price: product.price});
        client.index({
          index: config.elastic_index,
          type: 'product',
          id: id,
          body: response._source
        }, function (error, response) {
          if (error) {
            return cb(error);
          } else {
            console.log(response);
            return cb();
          }
        });
      }
    });
  },
  findProducts: function (string, cb) {
    client.search({
      index: config.elastic_index,
      body: {
        query: {
          match: {
            name: string
          }
        }
      }
    }, function (error, response) {
      if (error) {
        return cb(error);
      } else {
        if (response.hits.total>0) {
          return cb(null, response.hits.hits[0]._source);
        }
        return cb(null, null);
      }
    });
  }
}

function newProduct (now, id, product, cb) {
  client.create({
    index: config.elastic_index,
    type: 'product',
    id: generateId(product.name, product.url),
    body: {
      name: product.name,
      description: product.description,
      eancode: product.eancode,
      shop: product.shop,
      category: product.category,
      url: product.url,
      created: now,
      timestamp: now,
      price: product.price,
      image: product.image,
      history: [{
        timestamp: now,
        price: product.price
      }]
    }
  }, function (error, response) {
    if (error) {
      return cb(error);
    } else {
      console.log(response);
      return cb();
    }
  })
}

function generateId (name, url) {
  return ((urlify(name).toLowerCase()).substring(0,100)) + '-' + (md5(url).substring(0,3));
}
