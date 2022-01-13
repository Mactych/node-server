const http = require("http");
var res = module.exports = Object.create(http.ServerResponse.prototype);
res.send = function (body) {
    const headers = {};
    if (typeof body === 'string') headers["Content-Type"] = Mime.types["html"];
    this.writeHead(200, headers);
    this.write(body);
    this.end();
    return res;
}
res.status = function (status) {
    this.writeHead(status);
    return res;
}
res.redirect = function (location, status) {
    this.writeHead(status ? status : 302, { "Location": location });
    return this;
};
res.setHeaders = function (headers) {
    for (const head of Object.keys(headers)) this.setHeader(head, headers[head]);
    return;
};