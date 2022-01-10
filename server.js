const Utils = new (require("./utils.js"))();
const Router = require("./router.js");

function init(req, res) {
    req.query = Utils.query(req.url);
    req.cookie = req.headers["cookie"] ? Utils.cookie(req.headers["cookie"]) : {};
    res.redirect = function (location, status) {
        res.writeHead(status ? status : 302, { "Location": location });
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
            // now do virtuals
            for (const v of this._virtuals) {
                if (!Utils.wildcard(v.host, req.headers["host"] ? req.headers["host"] : "")) continue;
                for (const r of v.route._routes) {
                    console.log(r);
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

                /*                 for (const m of v.route._middlewhare) {
                                    if (!Utils.wildcard(m.path, req.url)) continue;
                                    var next = false;
                                    m.route(req, res, () => {
                                        next = true;
                                    });
                                    if (!next) return;
                                }
                                for (const r of Object.keys(v.route._routes[req.method] ? v.route._routes[req.method] : {})) {
                                    if (!Utils.wildcard(r, req.url)) continue;
                                    v.route._routes[req.method][r](req, res);
                                    return;
                                } */
            }
        };
    }
}

module.exports = Server;