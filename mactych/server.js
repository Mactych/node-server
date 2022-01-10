const mime = new (require(`${__dirname}/utils/mime.js`))(require(`${__dirname}/utils/mime.json`));
const fs = require("fs");


class Server {
    constructor(options) {
        this.options = options;
        this.routes = {};
        this.middlewhare = {};
    }
    get web() {
        return async (req, res) => {
            req.query = parseQuery(req.url);
            req.hostname = req.headers["host"];
            req.cookie = req.headers["cookie"] ? parseCookie(req.headers["cookie"]) : {};
            res.redirect = function (location, status) {
                res.writeHead(status ? status : 302, { "Location": location });
            };

            // handles middlewhares
            if (this.middlewhare) {
                for (const m of Object.keys(this.middlewhare ? this.middlewhare : {})) {
                    const middleFound = this.middlewhare[m];
                    if (!middleFound || !middleFound.route, !middleFound.virtual) continue;
                    if (!checkWildcard(middleFound.virtual, req.hostname)) continue;
                    if (!checkWildcard(m, req.url)) continue;
                    var next = false;
                    middleFound.route(req, res, () => {
                        next = true;
                    });
                    if (!next) return;
                }
            }
            // handles the routes
            if (this.routes[req.method]) {
                for (const r of Object.keys(this.routes[req.method] ? this.routes[req.method] : {})) {
                    const routeFound = this.routes[req.method][r];
                    if (!routeFound || !routeFound.route, !routeFound.virtual) continue;
                    if (!checkWildcard(routeFound.virtual, req.hostname)) continue;
                    if (!checkWildcard(r, req.url)) continue;
                    return routeFound.route(req, res);
                }
            }
        };
    }
}


module.exports = {
    Server,
    Virtual
}