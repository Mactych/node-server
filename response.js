const Mime = require("./mime.js");
const http = require("http");
var res = module.exports = Object.create(http.ServerResponse.prototype);
res.send = function (chunk, type) {
    if (!chunk) throw new TypeError('res.send() argument chunk is required')
    if (!type) throw new TypeError('res.send() argument type is required')
    if (typeof chunk === 'string') this.setHeader("Content-Type", Mime.types[type ? type : "txt"]);
    this.end(Buffer.from(chunk, 'utf8'), 'utf8');
    return this;
}
res.html = function (html) {
    if (!html) throw new TypeError('res.html() argument html is required')
    this.send(html, "html");
}
res.json = function (json) {
    if (!json) throw new TypeError('res.json() argument json is required')
    this.send(JSON.stringify(json), "json");
}
res.sendStatus = function (status) {
    res.status(status);
    res.end();
    return this;
}
res.status = function (status) {
    if (!status) throw new TypeError('res.status() argument status is required')
    this.statusCode = status;
    return this;
}
res.redirect = function (location, status) {
    if (!location) throw new TypeError('res.redirect() argument location is required')
    this.writeHead(status ? status : 302, { "Location": location });
    this.end();
    return this;
};
res.setHeaders = function (headers) {
    if (!headers) throw new TypeError('res.setHeaders() argument headers is required')
    for (const head of Object.keys(headers)) this.setHeader(head, headers[head]);
    return;
};