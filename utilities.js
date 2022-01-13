const utils = exports = module.exports = {};
utils.wildcard = function (rule, target) {
    return (new RegExp('^' + rule.replaceAll(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1").replaceAll('*', '(.*)') + '$')).test(target);
};
utils.params = function (rule, path) {
    const params = {};
    const chars = rule.split('');
    var wildcard = "";
    var values = [];
    var tmpValue = "";
    var reading = false;
    for (const index in chars) {
        const char = chars[index];
        if (reading && char != "/") tmpValue += char;
        if (char === ":") {
            reading = true;
            wildcard += "*";
        }
        if (reading && char === "/" || (parseInt(index) + 1) === chars.length) {
            reading = false;
            values.push(tmpValue);
            tmpValue = "";
        }
        if (!reading && (parseInt(index) + 1) != chars.length) wildcard += char;
    }
    var next = "";
    const chars2 = path.split("");
    for (const index in chars2) {
        const char = chars2[index];
        if (chars2[index] != chars[index]) next += char;
    }
    const chars3 = next.split("/");
    for (const value in chars3) params[values[value]] = chars3[value];
    const output = { path: wildcard, params: params };
    return output;
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