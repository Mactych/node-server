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

/**
 * Return the host used for the request
 *
 * @return {String}
 * @public
 */
 Utils.defineGetter(req, 'host', function() {
    return this.headers["host"];
});