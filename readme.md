# Node-Server Framework
This was built to be as performant and straightforward as possible whilst keeping your applications running smoothly since this framework extends the built-in HTTP server.

## How to use
Firstly declare the server class, example below.
```javascript
const webserver = require("macserver");
```
Create a new virtual site (this site will only respond to the hostname you provide)
```javascript
const api = new webserver.router();
const app = new webserver.router();
// add route -> all request in the api route will point .../api
app.use("/api" api);
// setup the middleware
app.use("/", (req, res, next) => {
    console.log(`middlewhare: ${req.url}`);
    next();
});
// get request
app.get("/", (req, res) => {
    res.write("hello world!");
    res.end();
});
const site = new webserver.virtual("domainhere.com", app);
```