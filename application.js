const Virtual = require("./virtual.js");
const Utils = require("./utilities.js");
const Response = require("./response.js");
const Request = require("./request.js");
const http = require("http");
var application = exports = module.exports = {};

application.version = "1.0.1";
application.init = function() {
    this._virtuals = [];
}
application.handle = function (req, res) {
    Object.setPrototypeOf(req, Request);
    Object.setPrototypeOf(res, Response);
    for (const v of this._virtuals) {
        if (!Utils.wildcard(v._domain, req.host)) continue;
        if (v._router.handle(req, res)) return;
    }
}
application.virtual = function(domain, router) {
    if (typeof domain === "object") {
        for (const d of domain) {
            this._virtuals.push(new Virtual(d, router));
        }
        return;
    } else {
        this._virtuals.push(new Virtual(domain, router));
    }
};
application.listen = function(port, callback) {
    http.createServer(this).listen(port);
    if (callback) callback(port);
}