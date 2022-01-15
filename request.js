const Utils = require("./utilities.js");
const http = require("http");
var req = module.exports = Object.create(http.IncomingMessage.prototype);

/**
 * Return the protocol string "http" or "https"
 *
 * @return {String}
 * @public
 */
Utils.defineGetter(req, 'protocol', function() {
    return this.connection.encrypted ? 'https' : 'http';;
});
Utils.defineGetter(req, 'secure', function() {
    return this.protocol === "https";
});

/**
 * Return the host used for the request
 *
 * @return {String}
 * @public
 */
Utils.defineGetter(req, 'host', function() {
    return this.headers["host"];
});

/**
 * Return the path used for the request
 *
 * @return {String}
 * @public
 */
 Utils.defineGetter(req, 'path', function() {
    return this.url;
});

/**
 * Return the cookies sent with a request
 *
 * @return {Object}
 * @public
 */
Utils.defineGetter(req, 'cookies', function() {
    return this.headers["cookie"] ? Utils.cookie(this.headers["cookie"]) : {};
});