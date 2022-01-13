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
    var proto = this.connection.encrypted
        ? 'https'
        : 'http';
    return proto;
});