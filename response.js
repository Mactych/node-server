const Mime = require("./mime.js");
const http = require("http");
var res = module.exports = Object.create(http.ServerResponse.prototype);
res.send = function (body) {
    if (typeof body === 'string') this.setHeader("Content-Type", Mime.types["html"]);
    this.write(body);
    this.end();
    return this;
}
res.status = function (status) {
    this.writeHead(status);
    return this;
}
res.redirect = function (location, status) {
    this.writeHead(status ? status : 302, { "Location": location });
    return this;
};
res.setHeaders = function (headers) {
    for (const head of Object.keys(headers)) this.setHeader(head, headers[head]);
    return;
};