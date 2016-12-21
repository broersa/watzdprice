var config = require('config');
var elasticsearch = require('elasticsearch');
var md5 = require('md5');
var urlify = require('urlify').create({
  spaces: '-',
  nonPrintable: '',
  trim: true
});

module.exports = {
  startSession: function(url, cb) {
    var client = new elasticsearch.Client({
      host: url
    });
    cb(null, client);
  },
  updateProduct: function (client, index, now, product, cb) {
    var id = generateId(product.name, product.url);
    client.get({
      index: index,
      type: 'product',
      id: id,
      ignore: 404
    }, function (error, response) {
      if (error) {
        return cb(error);
      }
      if (!response.found) {
        return newProduct(client, index, now, id, product, cb);
      } else {
        return updateProduct(client, index, now, id, product, response, cb);
      }
    });
  }
}

function newProduct (client, index, now, id, product, cb) {
  client.create({
    index: index,
    type: 'product',
    id: id,
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
      if (response.result!=='created') {
        return cb(new Error(`Error adding record: ${response}`));
      }
      return cb();
    }
  })
}

function updateProduct (client, index, now, id, product, response, cb) {
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
    index: index,
    type: 'product',
    id: id,
    body: response._source
  }, function (error, response) {
    if (error) {
      return cb(error);
    } else {
      if (!response.result==='updated') {
        return cb(new Error(`Error updating record: ${response}`));
      }
      return cb();
    }
  });
}

function generateId (name, url) {
  return ((urlify(name).toLowerCase()).substring(0,100)) + '-' + (md5(url).substring(0,3));
}
