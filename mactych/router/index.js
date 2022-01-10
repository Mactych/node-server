class Router {
    constructor() {
        this.server = {},
        this.middlewhare = {}
    }
    static(path, destStatic) {
        this.server.middlewhare[this.hostname] = this.server.middlewhare[this.hostname] ? this.server.middlewhare[this.hostname] : {};
        this.server.middlewhare[path + "*"] = {
            route: function (req, res, next) {
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
            }, virtual: this.hostname
        }
    }
    use(path, route) {
        // this.server.middlewhare[this.hostname] = this.server.middlewhare[this.hostname] ? this.server.middlewhare[this.hostname] : {};
        this.server.middlewhare[path] = { route: route, virtual: this.hostname };
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

module.exports = Router;