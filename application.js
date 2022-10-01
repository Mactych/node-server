const utils = require('./utilities.js');
const response = require('./response.js');
const request = require('./request.js');
const route = require('./route.js');
const http = require('http');
const application = exports = module.exports = {};
application._virtuals = [];
application.handle = async function(req, res) {
    req.res = res;
    res.req = req;
    request(req);
    response(res);
    try {
        for (const virtual of this._virtuals) {
            if (typeof virtual._domain == 'object') {
                let found_domain = false;
                for (const domain of virtual._domain) {
                    if (utils.wildcard(domain, req.host.split(':')[0])) {
                        found_domain = true;
                        break;
                    }
                }
                if (found_domain == false) continue;
            } else {
                if (!utils.wildcard(virtual._domain, req.host.split(':')[0])) continue;
            }
            if (await virtual._handle(req, res)) return;
            if (!virtual._chain) return res.end();
        }
        if (req.method === 'OPTIONS') return res.end();
        return res.status(404).end();
    } catch (e) {
        console.error(e);
        res.end();
    }
};
application.virtual = function(domain, chain = true) {
    this._chain = chain;
    this._domain = domain;
    route(this);
    application._virtuals.push(this);
    return this;
};
application.listen = function(port, callback) {
    if (this._virtuals.length <= 0) throw new TypeError("app.listen() requires you to setup some virtual hosts");
    http.createServer(this).listen(port);
    if (callback) callback(port);
};