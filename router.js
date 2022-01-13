const Utils = require("./utilities.js");
const Mime = require("./mime.js");
const fs = require("fs");
const methods = ["GET", "POST", "DELETE", "PUT", "PATCH", "HEAD"];
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
            if (req.method != "GET" || !req.url.startsWith(path)) return next();
            var urlPath = decodeURIComponent(req.url.substring(path.length) ? req.url.substring(path.length) : "/");
            var filePath = directory+(directory.endsWith("/") ? "" : "/")+urlPath;
            // MANIPULATE: changes the path if needed
            if (!filePath.startsWith("/")) filePath = "/"+filePath;
            if (filePath.endsWith("/")) filePath += "index.html";
            // CHECK: if should server content
            if (!fs.existsSync(filePath)) return next();
            const stat = fs.statSync(filePath);
            if (!filePath.endsWith("/") && fs.statSync(filePath).isDirectory()) {
                if (!fs.existsSync(`${filePath}/index.html`)) return next();
                return res.redirect(urlPath+"/");
            }
            // SEND: the file to the client
            const file = fs.createReadStream(filePath).on("error", (e) => console.error("Static-" + e));
            const headers = { "Content-Length": stat.size };
            const type = Mime.lookup(filePath, true);
            if (type) headers["Content-Type"] = type;
            res.writeHead(200, headers);
            file.pipe(res, { end: true });
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
    // EXTENDED: Remove params from url
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
        if (!Utils.wildcard((parsed.path ? parsed.path : r.path), (r.path.endsWith("/") ? req.url : (req.url.substr(1).endsWith("/") ? req.url.slice(0, -1) : req.url)))) continue;
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
    if (typeof arguments[1] === "string" && typeof arguments[2] === "function") {
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