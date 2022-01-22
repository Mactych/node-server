/**
 * node-server - cors.js
 * @author Mactych
 */
 
 const utils = require("./utilities.js");
 
exports = module.exports = function(res, options) {
    if (!res) throw new TypeError('cors() argument res is required');
    if (!options || typeof options != 'object') throw new TypeError('cors() argument options is required');
    const opts = {
        // origin: '*; // or array with domains
        // method: '*'
        // header: '*'
    };
    utils.copyProperties(options, opts, ['origin', 'method', 'header']);
    res.cache = opts;
    const headers = {};
    
    if (opts.origin === '*') headers['Access-Control-Allow-Origin'] = '*';
    if (Array.isArray(opts.origin)) headers['Access-Control-Allow-Origin'] = opts.origin.join(',');
    
    if (opts.method === '*') headers['Access-Control-Allow-Methods'] = '*';
    if (Array.isArray(opts.method)) headers['Access-Control-Allow-Methods'] = opts.method.join(',').toUpperCase();
    
    if (opts.header === '*') headers['Access-Control-Allow-Headers'] = '*';
    if (Array.isArray(opts.header)) headers['Access-Control-Allow-Headers'] = opts.header.join(',');
    
    res.setHeaders(headers);
    return;
}

/* Access-Control-Allow-Origin:
    the origins allow: can be * wildcard or list of domains - example.com,example.net,example.org
*/

/* Access-Control-Allow-Methods
    the methods allowed to be used
*/

/* Access-Control-Allow-Headers 
    headers allowed to be used
*/