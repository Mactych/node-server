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
    if (!rule) throw new TypeError('utils.params() argument rule is required')
    if (!path) throw new TypeError('utils.params() argument path is required')
    const keys = [];
    var addKey = false;
    var compare = true;
    var wildcard = "";
    var removed = "";
    const params = {};
    var keyChars = rule.split("");
    var valueChars = path.split("");
    if (rule.startsWith("/") && path.startsWith("/")) {
        removed += "/";
        keyChars = keyChars.splice(1, keyChars.length);
        valueChars = valueChars.splice(1, valueChars.length);
    }
    for (var index in keyChars) {
        index = parseInt(index);
        const c = keyChars[index];
        const v = valueChars[index];
        if (compare && c === v) {
            removed += c;
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
    valueChars = valueChars.slice(removed.length - 1, valueChars.length);
    valueChars = valueChars.split("/");
    wildcard = rule;
    for (var index in keys) {
        index = parseInt(index);
        const key = keys[index];
        const value = valueChars[index];
        wildcard = wildcard.replaceAll(`:${key}`, "*");
        if (key && value) params[key] = value;
    }
    return { path: wildcard, params: params };
}
utils.query = function (url) {
    if (!url) throw new TypeError('utils.query() argument url is required')
    url = url.lastIndexOf("?") != -1 ? url.slice(url.lastIndexOf("?") + 1, url.length) : url;
    const queries = {};
    var vars = url.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        queries[pair[0]] = pair[1] ? pair[1] : '';
    }
    return queries;
}
utils.cookie = function (cookie) {
    if (!cookie) throw new TypeError('utils.cookie() argument cookie is required')
    return cookie.split(';').map(v => v.split('=')).reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
        return acc;
    });
}
utils.mergeObject = function (src, dest, redefine) {
    if (!dest) throw new TypeError('utils.mergeObject() argument dest is required')
    if (!src) throw new TypeError('utils.mergeObject() argument src is required');
    if (redefine === undefined) redefine = true;
    Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
        if (!redefine && Object.prototype.hasOwnProperty.call(dest, name)) return;
        var descriptor = Object.getOwnPropertyDescriptor(src, name);
        Object.defineProperty(dest, name, descriptor);
    })
    return dest;
}