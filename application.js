const Virtual = require("./virtual.js");
const Utils = require("./utilities.js");
const http = require("http");
var application = exports = module.exports = {};

application.init = function() {
    this._virtuals = [];
}
application.handle = function (req, res) {
    req.host = req.headers["host"];
    for (const v of this._virtuals) {
        if (!Utils.wildcard(v._domain, req.host)) continue;
        if (v._router.handle(req, res)) return;
    }
}
application.virtual = function(domain, router) {
    this._virtuals.push(new Virtual(domain, router));
};
application.listen = function(port, callback) {
    http.createServer(this).listen(port);
    if (callback) callback(port);
}