const Utils = require("./utilities.js");
const Mime = require("./mime.js");
const fs = require("fs");
const methods = ["GET", "POST", "DELETE", "PUT", "PATCH"];
const router = exports = module.exports = function () {
    this._stack = [];
    for (const m of methods) {
        this[m.toLowerCase()] = function (path, route) {
            this._add(m, path, route);
        }
    }
    /**
* @param {function} middleware
* @public
*/
    this.use = function () {
        if (typeof arguments[0] === 'string' && arguments[1]._stack) {
            for (const r of arguments[1]._stack) r.path = path + r.path;
            this._stack = this._stack.concat(arguments[1]._stack);
            arguments[1]._path = path;
            arguments[1]._stack = this._stack;
            return;
        } else if (typeof arguments[0] === 'function') {
            this._add("MIDDLE", arguments[0]);
            return;
        }
        throw new TypeError("route.use() not a valid function or route to pass in");
    }
    /**
 * @param {string} path
 * @param {string} directory
 * @public
 */
    this.static = function (path, directory) {
        this._add("MIDDLE", function (req, res, next) {
            if (req.method != "GET") return next();
            var staticFilePath = decodeURIComponent(req.url.substring(path.length) ? req.url.substring(path.length) : "/");
            if (staticFilePath.endsWith("/")) staticFilePath += "index.html";
            if (!staticFilePath.startsWith("/")) staticFilePath = `/${staticFilePath}`;
            if (!fs.existsSync(`${directory}${staticFilePath}`)) return next();
            const staticFile = fs.createReadStream(`${directory}${staticFilePath}`).on("error", (e) => console.error("Static-" + e));
            const stat = fs.statSync(`${directory}${staticFilePath}`);
            const headers = { "Content-Length": stat.size };
            const mType = Mime.lookup(staticFilePath, true);
            if (mType) headers["Content-Type"] = mType;
            res.writeHead(200, headers);
            staticFile.pipe(res, { end: true });
        });
    }
}
/**
* @param {function} request
* @param {function} response
* @returns {bool} resolved
* @private
*/
router.prototype.handle = function (req, res) {
    // EXTENDED: Modify url
    if (req.url.substr(1).endsWith("/")) req.url = req.url.slice(0, -1);
    req.url = req.url.lastIndexOf("?") != -1 ? req.url.slice(0, req.url.lastIndexOf("?")) : req.url;
    // ROUTING: methods
    for (const r of this._stack) {
        var parsed = {};
        if (r.method === "MIDDLE") {
            var next = false;
            r.route(req, res, () => next = true);
            if (next) continue; else if (!next) return true;
        }
        if (r.path.includes(":")) {
            parsed = Utils.params(r.path, req.url);
            if (parsed.params) req.params = parsed.params;
        }
        if (!Utils.wildcard(parsed.path ? parsed.path : r.path, req.url)) continue;
        if (r.method === req.method) {
            r.route(req, res);
            return true;
        }
    }
    return false;
};
/**
* @param {string} method
* @param {string} path
* @param {function} route
* @public
*/
router.prototype._add = function () {
    const options = { method: arguments[0] };
    if (typeof arguments[1] === "string" && typeof arguments[2] === "function") { // this is a route
        options["path"] = this._path ? this._path + arguments[1] : arguments[1];
        options["route"] = arguments[2];;
    } else if (typeof arguments[1] === "function") options["route"] = arguments[1];
    if (typeof arguments[0] === "string") return this._stack.push(options);
    throw new TypeError("router._add() invalid options");
}
/**
* @param {string} method
* @param {string} path
* @public
*/
router.prototype._delete = function (method, path) {
    for (const index in this._stack) {
        const route = this._stack[index];
        if (route.method === method.toUpperCase() && route.path === path) {
            this._stack.splice(index, index + 1);
            break;
        }
    }
}