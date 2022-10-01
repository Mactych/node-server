/**
 * node-server - utilities.js
 * @author Mactych
 */

const utils = exports = module.exports = {};
/**
 * check a rule and a string to see if they match
 * @param {String} rule - rule for comparison
 * @param {String} target - target for the comparison
 */
utils.wildcard = function(rule, target) {
    if (!rule) throw new TypeError('utils.wildcard() argument rule is required');
    return (new RegExp('^' + rule.replaceAll(/([.+?^=!:${}()|\[\]\/\\])/g, '\\$1').replaceAll('*', '(.*)') + '$')).test(target);
};
/**
 * define a getter to a object
 * @param {Object} obj - the target object
 * @param {String} name - name for the getter
 * @param {Function} getter - the function for the getter
 */
utils.defineGetter = function(obj, name, getter) {
    if (!obj) throw new TypeError('utils.defineGetter() argument obj is required');
    if (!name) throw new TypeError('utils.defineGetter() argument name is required');
    if (!getter) throw new TypeError('utils.defineGetter() argument getter is required');
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        get: getter
    });
}
/**
 * parse parameters from a given url
 * @param {String} rule - rule to find parameters
 * @param {String} path - path to check for parameters
 * @returns {Object} - data for the params, includes wildcard and params in an object
 */
utils.params = function(rule, path) {
    if (!rule) throw new TypeError('utils.params() argument rule is required');
    if (!path) throw new TypeError('utils.params() argument path is required');
    const pathSplit = path.split("/");
    const ruleSplit = rule.split("/");
    const keys = {};
    const wildcard = [];
    for (const part in ruleSplit) {
        wildcard.push(ruleSplit[part].startsWith(":") ? "*" : ruleSplit[part]);
        if (ruleSplit[part].startsWith(":") && ruleSplit[part]) keys[ruleSplit[part].substring(1)] = pathSplit[part];
    };
    const final = [];
    for (const part in wildcard) {
        if (wildcard[part] != "*") {
            final.push(wildcard[part]);
        } else {
            final.push(pathSplit[part]);
        }
    }
    return { path: wildcard.join("/"), params: keys, valid: path == final.join('/') || path == final.join('/')+'/' };
}
/**
 * extracts the queries from a url
 * @param {String} url - the target url to extract queries from
 * @returns {Object} - the queries of the url
 */
utils.query = function(url) {
    if (!url) throw new TypeError('utils.query() argument url is required');
    const queries = {};
    var vars = url.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0]) queries[pair[0]] = pair[1] ? pair[1] : '';
    }
    return queries;
}
/**
 * parses cookies
 * @param {String} cookie - cookies directly from cookie headers
 * @returns {Object} - all the cookies sorted into an object
 */
utils.cookie = function(cookie) {
    const list = {};
    if (!cookie) return list;
    cookie.split(`;`).forEach(function(c) {
        let [name, ...rest] = c.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list;
}
utils.mergeObject = function(src, dest, redefine) {
    if (!src) throw new TypeError('utils.mergeObject() argument src is required');
    if (!dest) throw new TypeError('utils.mergeObject() argument dest is required');
    if (redefine === undefined) redefine = true;
    Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
        if (!redefine && Object.prototype.hasOwnProperty.call(dest, name)) return;
        var descriptor = Object.getOwnPropertyDescriptor(src, name);
        Object.defineProperty(dest, name, descriptor);
    })
    return dest;
}
utils.copyProperties = function(src, dest, values = []) {
    if (!src) throw new TypeError('utils.copyProperties() argument src is required');
    if (!dest) throw new TypeError('utils.copyProperties() argument dest is required');
    for (const name of values) {
        var descriptor = Object.getOwnPropertyDescriptor(src, name);
        if (descriptor) Object.defineProperty(dest, name, descriptor);
    }
}