/**
 * node-server - 
 * @author Mactych
 */

const Utils = require('./utilities.js');
const Application = require('./application.js');
exports = module.exports = function(defaultRoute) {
  const app = function(req, res) {
    app.handle(req, res);
  }
  Utils.mergeObject(Application, app, false);
  return app;
}
exports.etag = require('./etag.js');
exports.router = require('./router.js');
exports.cache = require('./cache.js');
exports.cors = require('./cors.js');
exports.cookie = require('./cookie.js');