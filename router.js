const Utils = require("./utilities.js");
const methods = ["GET", "POST", "DELETE", "PUT", "PATCH"];
const router = exports = module.exports = function () {
    // constructor function
    this._stack = [];
}
router.prototype.handle = function (req, res) {
    // EXTENDED: Modify url
    if (req.url.substr(1).endsWith("/")) req.url = req.url.slice(0, -1);

    // EXTENDED: variables
    req.query = Utils.query(req.url);
    req.url.slice(0, req.url.lastIndexOf("?"));
    // req.params = Utils.params(req.url);
    req.cookie = req.headers["cookie"] ? Utils.cookie(req.headers["cookie"]) : {};

    // EXTENDED: functions
    res.send = function (body) {
        res.write(body);
        res.end();
        return res;
    }
    res.status = function (status) {
        res.writeHead(status);
        return res;
    }
    res.redirect = function (location, status) {
        res.writeHead(status ? status : 302, { "Location": location });
        return res;
    };
    res.setHeaders = function (headers) {
        for (const head of Object.keys(headers)) res.setHeader(head, headers[head]);
        return;
    };

    // ROUTING: methods
    for (const r of this._stack) {
        if (!Utils.wildcard(r.path, req.url)) continue;
        if (r.method === "MIDDLE") {
            var next = false;
            r.route(req, res, () => {
                next = true;
            });
            if (!next) return;
        }
        if (r.method === req.method) {
            r.route(req, res);
            return;
        }
    }
};
router.prototype._add = function (method, path, route) {
    this._stack.push({ method: method, path: this._path ? this._path+path : path, route: route });
}
router.prototype._delete = function (method, path) {
    // deletes the route from the routes
}
router.prototype.use = function (path, route) {
    if (route._stack) {
        for (const r of route._stack) {
            r.path = path+r.path;
        }
        this._stack = this._stack.concat(route._stack);
        route._path = path;
        route._stack = this._stack;
    } else if (typeof route === "function") {
        this._add("MIDDLE", path, route);
    } else {
        throw new TypeError("route.use() not a valid function or route to pass in");
    }
    // either inits a middlewhare or inherits another route.
}
for (const m of methods) {
    router.prototype[m.toLowerCase()] = function (path, route) {
        this._add(m, path, route);
    }
}