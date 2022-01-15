const Utils = require("./utilities.js");
const Mime = require("./mime.js");
const fs = require("fs");
const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
const router = exports = module.exports = function () {
    this._stack = [];
    for (const m of methods) {
        this[m.toLowerCase()] = function () {
            // path: arguments[0]
            // route: arguments[1]
            if (typeof arguments[0] != 'string') throw TypeError("route.add() invalid path");
            if (typeof arguments[1] != 'function') throw TypeError("route.add() invalid route");
            this._add(m, arguments[0], arguments[1]);
        }
    }
    /**
    * @param {string} method
    * @param {string} path
    * @param {function} route
    * @public~
    */
    router.prototype._add = function () {
        // method: arguments[0]
        // path: arguments[1]
        // route: arguments[2]
        const options = { method: arguments[0] };
        if (typeof arguments[1] === "string" && typeof arguments[2] === "function") {
            // is a route
            options["path"] = this._path ? this._path + arguments[1] : arguments[1];
            options["route"] = arguments[2];
        } else if (typeof arguments[1] === "function") {
            // is a middlware
            options["route"] = arguments[1];
        }
        if (typeof arguments[0] === "string") {
            return this._stack.push(options);
        }
        throw new TypeError("router._add() invalid options");
    }
    /**
    * @param {string} method
    * @param {string} path
    * @public
    */
    router.prototype._delete = function (method, path) {
        method = method.toUpperCase();
        if (method === "MIDDLEWARE") throw TypeError("router._delete() cannot delete middlware");
        for (const index in this._stack) {
            const route = this._stack[index];
            if (route.method === method.toUpperCase() && route.path === path) {
                this._stack.splice(index, index + 1);
                break;
            }
        }
    }
    /**
    * @param {function} middleware
    * @public
    */
    this.use = function () {
        // path || route: arguments[0];
        // route: arguments[0];
        if (typeof arguments[0] === "object" && (arguments[0] && arguments[0]._stack)) {
            // route without path
            this._stack = this._stack.concat(arguments[0]._stack);
            arguments[0]._stack = this._stack;
            return;
        }
        if (typeof arguments[0] === "string" && typeof arguments[1] === "object" && (arguments[1] && arguments[1]._stack)) {
            // route with path
            for (const r of arguments[1]._stack) if (r.method != "MIDDLEWARE") r.path = arguments[0] + r.path;
            this._stack = this._stack.concat(arguments[1]._stack);
            arguments[1]._path = arguments[0];
            arguments[1]._stack = this._stack;
            return;
        }
        if (typeof arguments[0] === 'function' && !arguments[0]._stack) {
            // middleware
            this._add("MIDDLEWARE", arguments[0]);
            return;
        }
        throw new TypeError("route.use() not a valid function or route to pass in");
    }
    /**
    * @param {string} path
    * @param {string} directory
    * @public
    */
    this.static = function (path, directory, options) {
        options = options ? options : {};
        const opts = {};
        opts.requireHTMLExtension = options.requireHTMLExtension != undefined ? options.requireHTMLExtension : true;
        this.use(function (req, res, next) {
            if (!["GET", "HEAD"].includes(req.method) || !req.url.startsWith(path)) return next();
            var urlPath = decodeURIComponent(req.url.substring(path.length) ? req.url.substring(path.length) : "/");
            var filePath = directory + (directory.endsWith("/") ? "" : "/") + urlPath;
            // MANIPULATE: changes the path if needed
            if (!filePath.startsWith("/")) filePath = "/" + filePath;
            if (filePath.endsWith("/")) filePath += "index.html";
            // CHECK: if should server content
            if (!fs.existsSync(filePath)) {
                if (!opts.requireHTMLExtension && fs.existsSync(filePath+".html")) {
                    filePath += ".html";
                } else {
                    return next();
                }
            }
            const stat = fs.statSync(filePath);
            if (!filePath.endsWith("/") && fs.statSync(filePath).isDirectory()) {
                if (!fs.existsSync(`${filePath}/index.html`)) return next();
                return res.redirect(urlPath + "/");
            }
            // SEND: the file to the client
            const type = Mime.lookup(filePath, true);
            if (type) res.setHeader('Content-Type', type);
            if (req.headers.range) {
                const range = req.headers.range;
                const total = stat.size;
                var [partialstart, partialend] = range.replace(/bytes=/, "").split("-");
                partialstart = parseInt(partialstart, 10);
                partialend = partialend ? parseInt(partialend, 10) : total - 1;
                if (!isNaN(partialstart) && isNaN(partialend)) {
                    partialstart = partialstart;
                    partialend = total - 1;
                }
                if (isNaN(partialstart) && !isNaN(partialend)) {
                    partialstart = total - partialstart;
                    partialend = total - 1;
                }
                // Handle unavailable range request
                if (partialstart >= total || partialend >= total) {
                    // Return the 416 Range Not Satisfiable.
                    res.writeHead(416, {
                        "Content-Range": `bytes */${total}`
                    });
                    return res.end();
                }
                res.writeHead(206, {
                    "Content-Range": `bytes ${partialstart}-${partialend}/${total}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": partialend - partialstart + 1,
                });
                const buffer = fs.createReadStream(filePath, { start: partialstart, end: partialend }).on("error", (e) => {
                    return next();
                });
                if (req.method === "HEAD") {
                    res.end();
                    return;
                };
                buffer.pipe(res, { end: true });
                return;
            } else {
                res.setHeader('Content-Length', stat.size);
                res.writeHead(200);
                const buffer = fs.createReadStream(filePath).on("error", (e) => {
                    return next();
                });
                if (req.method === "HEAD") {
                    res.end();
                    return;
                };
                buffer.pipe(res, { end: true });
                // res.end(buffer);
            }
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
    // EXTENDED: Set and remove query from url
    req.query = Utils.query(req.url);
    req.url = req.url.lastIndexOf("?") != -1 ? req.url.slice(0, req.url.lastIndexOf("?")) : req.url;
    // ROUTING: methods
    for (const r of this._stack) {
        var parsed = {};
        if (r.method === "MIDDLEWARE") {
            var next = false;
            r.route(req, res, () => next = true);
            if (next) {
                continue;
            } else if (!next) {
                return true;
            }
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