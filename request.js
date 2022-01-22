/**
 * node-server - request.js
 * @author Mactych
 */

const utils = require('./utilities.js');
const http = require('http');
var req = Object.create(http.IncomingMessage.prototype);

exports = module.exports = function(request) {
    Object.setPrototypeOf(request, req);
    request.query = utils.query(request.url);
    request.path = request.url.lastIndexOf('?') != -1 ? request.url.slice(0, request.url.lastIndexOf('?')) : request.url;
    request.cookie = request.headers['cookie'] ? utils.cookie(request.headers['cookie']) : {};
}

/**
 * check protocol
 *
 * @returns {String} - returns 'https' or 'http'
 * @public
 */
utils.defineGetter(req, 'protocol', function() {
    return this.connection.encrypted ? 'https' : 'http';
});
/**
 * check if secure
 * @returns {Boolean}
 */
utils.defineGetter(req, 'secure', function() {
    return this.protocol === 'https';
});

/**
 * request host
 *
 * @return {String}
 * @public
 */
utils.defineGetter(req, 'host', function() {
    return this.headers['host'];
});

/**
 * Return the path used for the request
 *
 * @returns {String}
 * @public
 */
utils.defineGetter(req, 'path', function() {
    return this.url;
});