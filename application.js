const utils = require('./utilities.js');
const response = require('./response.js');
const request = require('./request.js');
const http = require('http');
var application = exports = module.exports = {};
application._virtuals = [];
application.handle = async function(req, res) {
    req.res = res;
    res.req = req;
    request(req);
    response(res);
    for (const v of this._virtuals) {
        if (!utils.wildcard(v._domain, req.host.split(":")[0])) continue;
        if (await v._router.handle(req, res)) return;
    }
    if (req.method === 'OPTIONS') return res.end();
    return res.status(404).end();
};
application.virtual = function(domain, router) {
    if (typeof domain === 'object') {
        for (const d of domain) this._virtuals.push({ _domain: d, _router: router });
    } else {
        this._virtuals.push({ _domain: domain, _router: router });
    }
};
application.listen = function(port, callback) {
    if (this._virtuals.length <= 0) throw new TypeError("app.listen() requires you to setup some virtual hosts");
    http.createServer(this).listen(port);
    if (callback) callback(port);
};