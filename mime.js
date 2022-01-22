/**
 * node-server - mime.js
 * @author Mactych
 */

const mime = function(data) {
    if (!data) data = require('./mime_types.json');
    this._cache = {};
    this._types = {};    
    for (var type in data) {
        for (var ext of data[type]) {
            this._types[ext] = type;
        }
    }
};

/**
 * Looks up a mime type
 * @param {String} path - path of the file you want to find the mime type for
 * @param {Boolean} charset - if you want to give charset if available
 */
mime.prototype.lookup = function(path, charset) {
    var ext = path.replace(/^.*[\.\/\\]/, '').toLowerCase();
    var type = this._cache[ext] || this._types[ext];
    if (charset && /^text\/|^application\/(javascript|json)/.test(type)) type += '; charset=utf-8';
    this._cache[ext] = type;
    delete this._types[ext];
    return type;
};
exports = module.exports = new mime();