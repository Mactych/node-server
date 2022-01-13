const Mime = require("./mime.js");
const http = require("http");
var res = module.exports = Object.create(http.ServerResponse.prototype);
res.send = function (chunk, type) {
    if (typeof chunk === 'string') this.setHeader("Content-Type", Mime.types[type ? type : "html"]);
    this.end(Buffer.from(chunk, 'utf8'), 'utf8');
    return this;
}
res.json = function (obj) {
    this.send(JSON.stringify(obj), "json");
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