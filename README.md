# Custom Server
This server was build to be a lightweight webserver for all of my systems that require dynamic content, all static content is hosted on an Apache webserver.

When creating routes, middlewhares or request you can use the `*` symbol to tell the server that the path contains a wildcard.

## To do
- [ ] Make setup and accessing of classes less painful

## How to use
Firstly declear the server class, example below.
```javascript
const webserver = new (require("./server.js"))();
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
    res.write("hello world!");
    res.end();
});
const site = new webserver.virtual("domainhere.com", route);