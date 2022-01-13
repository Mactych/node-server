const Virtual = require("./virtual.js");
const Utils = require("./utilities.js");
const Response = require("./response.js");
const Request = require("./request.js");
const http = require("http");
var application = exports = module.exports = {};

application.init = function() {
    this._virtuals = [];
}
application.handle = function (req, res) {
    Object.setPrototypeOf(req, Request);
    Object.setPrototypeOf(res, Response);
    for (const v of this._virtuals) {
        if (!Utils.wildcard(v._domain, req.headers["host"])) continue;
        v._router.handle(req, res);
    }
}
application.virtual = function(domain, router) {
    this._virtuals.push(new Virtual(domain, router));
};
application.listen = function(port, callback) {
    http.createServer(this).listen(port);
    if (callback) callback(port);
}