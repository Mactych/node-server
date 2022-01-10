class Mime {
    constructor(database) {
        this.types = {};
        for (var type in database) {
            var exts = database[type];
            for (var ext of exts) {
                this.types[ext] = type;
            }
        }
    }
    lookup(path, charset) {
        var ext = path.replace(/^.*[\.\/\\]/, '').toLowerCase();
        var type = this.types[ext];
        if (charset && (/^text\/|^application\/(javascript|json)/).test(type)) type += "; charset=UTF-8";
        return type; 
    }
}

module.exports = Mime;