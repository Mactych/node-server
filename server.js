const Utils = new (require("./utils.js"))();
const Router = require("./router.js");

function init(req, res) {
    // extended - variables
    req.query = Utils.query(req.url);
    req.cookie = req.headers["cookie"] ? Utils.cookie(req.headers["cookie"]) : {};
    // extended - functions
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
    }
}

class Server {
    constructor() {
        this._virtuals = [],
        this.Router = require("./router.js");
    }
    virtual(host, router) {
        this._virtuals.push({ host: host, route: router });
    }
    get web() {
        return (req, res) => {
            init(req, res);
            for (const v of this._virtuals) {
                if (!Utils.wildcard(v.host, req.headers["host"] ? req.headers["host"] : "")) continue;
                for (const r of v.route._routes) {
                    if (r.method === "_MIDDLE") {
                        if (!Utils.wildcard(r.path, req.url)) continue;
                        var next = false;
                        r.route(req, res, () => {
                            next = true;
                        });
                        if (!next) return;
                    }
                    if (r.method === req.method) {
                        if (!Utils.wildcard(r.path, req.url)) continue;
                        r.route(req, res);
                        return;
                    }
                }
            }
        };
    }
}

module.exports = Server;