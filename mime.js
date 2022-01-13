const mime = function (data) {
    if (!data) data = require("./types.json");
    this.types = {};
    for (var type in data) {
        var exts = data[type];
        for (var ext of exts) {
            this.types[ext] = type;
        }
    }
}
mime.prototype.lookup = function (path, charset) {
    var ext = path.replace(/^.*[\.\/\\]/, '').toLowerCase();
    var type = this.types[ext];
    if (charset && (/^text\/|^application\/(javascript|json)/).test(type)) type += "; charset=UTF-8";
    return type;
}

exports = module.exports = new mime();