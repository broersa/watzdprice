var config = require('config');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: config.elastic_url,
  log: 'trace'
});

module.exports = {
  updateProduct: function (product, cb) {
    client.get({
      index: config.elastic_index,
      type: 'product',
      id: product.url,
      ignore: 404
    }, function(error, response) {
      if (error) {
        return cb(error);
      }
      if (!response.found) {
        return cb();
      } else {
        return cb();
      }
    });
  },
  findProduct: function () {
    return false;
  }
}
