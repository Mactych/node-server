/**
 * node-server - router.js
 * @author Mactych
 */

const utils = require('./utilities.js');
const mime = require('./mime.js');
const etag = require('./etag.js');
const cache = require('./cache.js');
const route = require('./route.js');
const fs = require('fs');
const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'PURGE'];
const router = exports = module.exports = function() {
  route(this);
}