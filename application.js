const Utils = require("./utilities.js");
const Response = require("./response.js");
const Request = require("./request.js");
const http = require("http");
var application = exports = module.exports = {};
application.init = function () {
    this._virtuals = [];
}
application.handleRoute = function (req, res) {
    // EXTENDED: Set and remove query from url
    req.query = Utils.query(req.url);
    req.url = req.url.lastIndexOf("?") != -1 ? req.url.slice(0, req.url.lastIndexOf("?")) : req.url;
    Object.setPrototypeOf(req, Request);
    Object.setPrototypeOf(res, Response);
    for (const v of this._virtuals) {
        if (!Utils.wildcard(v._domain, req.host)) continue;
        if (v._router.handle(req, res)) return;
    }
    if (req.method === "OPTIONS") res.end();
    return;
}
application.virtual = function (domain, router) {
    if (typeof domain === "object") {
        for (const d of domain) {
            this._virtuals.push({ _domain: d, _router: router });
        }
        return;
    } else {
        this._virtuals.push({ _domain: domain, _router: router });
    }
    return;
};
application.listen = function (port, callback) {
    http.createServer(this).listen(port);
    if (callback) callback(port);
}