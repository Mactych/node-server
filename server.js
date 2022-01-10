const Utils = new (require("./utils.js"))();
const Router = require("./router.js");

class Server {
    constructor() {
        this._virtuals = {};
        this.Router = require("./router.js");
    }
    virtual(host, router) {
        this._virtuals[host] = router;
    }
    get web() {
        return (req, res) => {
            req.query = Utils.query(req.url);
            req.cookie = req.headers["cookie"] ? Utils.cookie(req.headers["cookie"]) : {};
            res.redirect = function (location, status) {
                res.writeHead(status ? status : 302, { "Location": location });
            };

            // now do virtuals
            for (const v of Object.keys(this._virtuals ? this._virtuals : {})) {
                if (!Utils.wildcard(v, req.headers["host"] ? req.headers["host"] : "")) continue;
                const virtual = this._virtuals[v];
                for (const m of virtual._middlewhare) {
                    if (!Utils.wildcard(m.path, req.url)) continue;
                    var next = false;
                    m.route(req, res, () => {
                        next = true;
                    });
                    if (!next) return;
                }
                for (const r of Object.keys(virtual._routes[req.method] ? virtual._routes[req.method] : {})) {
                    if (!Utils.wildcard(r, req.url)) continue;
                    virtual._routes[req.method][r](req, res);
                    return;
                }
            }
        };
    }
}

module.exports = Server;