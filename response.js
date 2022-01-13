const Mime = require("./mime.js");
const http = require("http");
var res = module.exports = Object.create(http.ServerResponse.prototype);
res.send = function (chunk, type) {
    if (typeof chunk === 'string') this.setHeader("Content-Type", Mime.types[type ? type : "txt"]);
    this.end(Buffer.from(chunk, 'utf8'), 'utf8');
    return this;
}
res.html = function (html) {
    this.send(html, "html");
}
res.json = function (json) {
    this.send(JSON.stringify(json), "json");
}
res.status = function (status) {
    this.statusCode = status;
    return this;
}
res.redirect = function (location, status) {
    this.writeHead(status ? status : 302, { "Location": location });
    this.end();
    return this;
};
res.setHeaders = function (headers) {
    for (const head of Object.keys(headers)) this.setHeader(head, headers[head]);
    return;
};