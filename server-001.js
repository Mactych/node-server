const mime = new (require(`${__dirname}/utils/mime.js`))(require(`${__dirname}/utils/mime.json`));
const fs = require("fs");


function parseQuery(url) {
    if (!url) url = location.href;
    var question = url.indexOf("?");
    var hash = url.indexOf("#");
    if (hash == -1 && question == -1) return {};
    if (hash == -1) hash = url.length;
    var query = question == -1 || hash == question + 1 ? url.substring(hash) :
        url.substring(question + 1, hash);
    var result = {};
    query.split("&").forEach(function (part) {
        if (!part) return;
        part = part.split("+").join(" ");
        var eq = part.indexOf("=");
        var key = eq > -1 ? part.substr(0, eq) : part;
        var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
        var from = key.indexOf("[");
        if (from == -1) result[decodeURIComponent(key)] = val;
        else {
            var to = key.indexOf("]", from);
            var index = decodeURIComponent(key.substring(from + 1, to));
            key = decodeURIComponent(key.substring(0, from));
            if (!result[key]) result[key] = [];
            if (!index) result[key].push(val);
            else result[key][index] = val;
        }
    });
    return result;
}
const parseCookie = cookie => cookie.split(';').map(v => v.split('=')).reduce((acc, v) => {
    acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
    return acc;
}, {});
function checkWildcard(rule, text) {
    return (new RegExp('^' + rule.replaceAll(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1").replaceAll('*', '(.*)') + '$')).test(text);
}

class Virtual {
    constructor(hostname, server) {
        this.server = server;
        this.hostname = hostname;
    }
    static(path, destStatic) {
        this.server.middlewhare[this.hostname] = this.server.middlewhare[this.hostname] ? this.server.middlewhare[this.hostname] : {};
        this.server.middlewhare[path + "*"] = {route: function (req, res, next) {
            if (req.method != "GET") return next();
            var staticFilePath = decodeURIComponent(req.url.substring(path.length) ? req.url.substring(path.length) : "/");
            if (staticFilePath.endsWith("/")) staticFilePath += "index.html";
            if (!staticFilePath.startsWith("/")) staticFilePath = `/${staticFilePath}`;
            if (!fs.existsSync(`${destStatic}${staticFilePath}`)) return next();
            const staticFile = fs.createReadStream(`${destStatic}${staticFilePath}`).on("error", (e) => console.error("Static-" + e));
            const stat = fs.statSync(`${destStatic}${staticFilePath}`);
            const headers = { "Content-Length": stat.size };
            const mType = mime.lookup(staticFilePath, true);
            if (mType) headers["Content-Type"] = mType;
            res.writeHead(200, headers);
            staticFile.pipe(res, { end: true });
            return;
        }, virtual: this.hostname}
    }
    use(path, route) {
        // this.server.middlewhare[this.hostname] = this.server.middlewhare[this.hostname] ? this.server.middlewhare[this.hostname] : {};
        this.server.middlewhare[path] = {route: route, virtual: this.hostname};
        return;
    }
    add(method, path, route) {
        this.server.routes[method.toUpperCase()] = this.server.routes[method.toUpperCase()] ? this.server.routes[method.toUpperCase()] : {};
        this.server.routes[method.toUpperCase()][path] = { route: route, virtual: this.hostname };
        return;
    }
    delete(method, path) {
        if (this.server.routes[method.toUpperCase()][path]) delete this.server.routes[method.toUpperCase()][path];
        return;
    }
}


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