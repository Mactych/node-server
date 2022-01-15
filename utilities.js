const utils = exports = module.exports = {};
utils.wildcard = function (rule, target) {
    return (new RegExp('^' + rule.replaceAll(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1").replaceAll('*', '(.*)') + '$')).test(target);
};
utils.defineGetter = function (obj, name, getter) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        get: getter
    });
}
utils.params = function (rule, path) {
    const keys = [];
    var addKey = false;
    var compare = true;
    var wildcard = "";
    const params = {};
    const keyChars = rule.split("");
    var valueChars = path.split("");
    if (rule.startsWith("/") && path.startsWith("/")) {
        keyChars.shift();
        valueChars.shift();
    }
    for (var index in keyChars) {
        index = parseInt(index);
        const c = keyChars[index];
        const v = valueChars[index];
         if (compare && v === c) {
            valueChars.shift();
            continue;
        } else compare = false;
        if (c === ":") {
            addKey = true;
            keys.push("");
            continue;
        }
        if (c != "/" && addKey) keys[keys.length - 1] += c;
        if (c === "/" || index === keyChars.length - 1) addKey = false;
    }
    valueChars = valueChars.join("");
    valueChars = valueChars.split("/");
    wildcard = rule;
    for (var index in keys) {
        index = parseInt(index);
        const key = keys[index];
        const value = valueChars[index];
        wildcard = wildcard.replaceAll(`:${key}`, "*");
        if (key && value) params[key] = value;
    }
    return {wildcard:wildcard,params:params};
}
utils.query = function (url) {
    var question = url.indexOf("?");
    var hash = url.indexOf("#");
    if (hash == -1 && question == -1) return {};
    if (hash == -1) hash = url.length;
    var query = question == -1 || hash == question + 1 ? url.substring(hash) :
        url.substring(question + 1, hash);
    var result = {};
    query.split("&").forEach(function (part) {
        if (!part) return;
        part = part.split("+").join(" ");
        var eq = part.indexOf("=");
        var key = eq > -1 ? part.substr(0, eq) : part;
        var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
        var from = key.indexOf("[");
        if (from == -1) result[decodeURIComponent(key)] = val;
        else {
            var to = key.indexOf("]", from);
            var index = decodeURIComponent(key.substring(from + 1, to));
            key = decodeURIComponent(key.substring(0, from));
            if (!result[key]) result[key] = [];
            if (!index) result[key].push(val);
            else result[key][index] = val;
        }
    });
    return result;
}
utils.cookie = function (cookie) {
    return cookie.split(';').map(v => v.split('=')).reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
        return acc;
    });
}
utils.mergeObject = function (src, dest, redefine) {
    if (!dest) throw new TypeError('argument dest is required')
    if (!src) throw new TypeError('argument src is required');
    if (redefine === undefined) redefine = true;
    Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
        if (!redefine && Object.prototype.hasOwnProperty.call(dest, name)) return;
        var descriptor = Object.getOwnPropertyDescriptor(src, name);
        Object.defineProperty(dest, name, descriptor);
    })
    return dest;
}