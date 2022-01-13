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
    this.use = function (path, route) {
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
    }
    this.static = function(path, directory) {
        this._add("MIDDLE", path+"*", function (req, res, next) {
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
            return;
        });
    }
}
router.prototype.handle = function (req, res) {
    // EXTENDED: Modify url
    if (req.url.substr(1).endsWith("/")) req.url = req.url.slice(0, -1);

    // EXTENDED: variables
    req.query = Utils.query(req.url);
    req.url.slice(0, req.url.lastIndexOf("?"));
    req.cookie = req.headers["cookie"] ? Utils.cookie(req.headers["cookie"]) : {};

    // EXTENDED: functions
    res.send = function (body) {
        res.setHeader("Content-Type", Mime.types["html"]);
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
        var parsed = {};
        if (r.method != "MIDDLE") {
            parsed = Utils.params(r.path, req.url);
            if (parsed.params) req.params = parsed.params;
        }
        if (!Utils.wildcard(parsed.path ? parsed.path : r.path, req.url)) continue;
        if (r.method === "MIDDLE") {
            var next = false;
            r.route(req, res, () => {
                next = true;
            });
            if (!next) return true;
        }
        if (r.method === req.method) {
            r.route(req, res);
            return true;
        }
    }
    return false; // if not resolved cycle through other virtuals
};
router.prototype._add = function (method, path, route) {
    this._stack.push({ method: method, path: this._path ? this._path+path : path, route: route });
}
router.prototype._delete = function (method, path) {
    for (const index in this._stack) {
        const route = this._stack[index];
        if (route.method === method.toUpperCase() && route.path === path) {
            this._stack.splice(index, index+1);
            break;
        }
    }
}