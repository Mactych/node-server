# Custom Server
This server was build to be a lightweight webserver for all of my systems that require dynamic content, all static content is hosted on an Nginx webserver.

When creating routes, middlewhares or request you can use the `*` symbol to tell the server that the path contains a wildcard.

## How to use
Firstly create the function for the server, example shown below.
```javascript
const http = require("http"); // will be used to listen for the server
const server = require("./server.js")
const webserver = server();
```
Create a new virtual site (this site will only respond to the hostname you provide)
```javascript
const api = new webserver.Route();
const route = new webserver.Route();
// add route -> all request in the api route will point .../api
route.use("/api" api);
// setup middlewhare
route.use("/", (req, res, next) => {
    console.log(`middlewhare: ${req.url}`);
    next();
});
// get request
route.get("/", (req, res) => {
    res.html("<html><body><h1>hello world!</h1></body></html>");
});
webserver.virtual("domainhere.com", route);
http.createServer(webserver).listen(80);
```