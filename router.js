
const Utils = require("./utils.js");
const Mime = new (require("./mime.js"))(require("./mime.json"));
const fs = require("fs");
const methods = ["GET", "POST", "DELETE", "PUT", "PATCH"];

class Router {
    constructor() {
        methods.forEach((method) => {
            this[method.toLowerCase()] = function (path, route) {
                return this._add(method, path, route);
            };
        });
        this._router = true;
        this._routes = [];
    }
    static(path, dirname) {
        this.use(path+"*", (req, res, next) => {
            if (req.method != "GET") return next();
            var staticFilePath = decodeURIComponent(req.url.substring(path.length) ? req.url.substring(path.length) : "/");
            if (staticFilePath.endsWith("/")) staticFilePath += "index.html";
            if (!staticFilePath.startsWith("/")) staticFilePath = `/${staticFilePath}`;
            if (!fs.existsSync(`${dirname}${staticFilePath}`)) return next();
            const staticFile = fs.createReadStream(`${dirname}${staticFilePath}`).on("error", (e) => console.error("Static-" + e));
            const stat = fs.statSync(`${dirname}${staticFilePath}`);
            const headers = { "Content-Length": stat.size };
            const mType = Mime.lookup(staticFilePath, true);
            if (mType) headers["Content-Type"] = mType;
            res.writeHead(200, headers);
            staticFile.pipe(res, { end: true });
            return;
        });
    }
    use(path, route) {
        if (route._router) {
            for (const r of route._routes ? route._routes : []) {
                r["path"] = `${path}${r["path"]}`;
                this._routes.push(r);
            }
        } else if (typeof route === 'function') {
            this._routes.push({ method: "_MIDDLE", path: path, route: route});
        }
    }
    _add(method, path, route) {
        this._routes.push({ method: method.toUpperCase(), path: path, route: route });
    }
    _delete(method, path) {
/*         console.log(this._routes);
        for (const r of this._routes) {
            console.log(r);
        } */
        // cycles through the array and removes it
        // if (this._routes[method.toUpperCase()][path]) delete this._routes[method.toUpperCase()][path];
    }
}

module.exports = Router;