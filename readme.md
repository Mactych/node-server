# Node-Server Framework
This was built to be as performant and straightforward as possible whilst keeping your applications happy since this framework extends the built-in HTTP server.

## Todo List
* Make static function automatically find the index.html file when in a folder
* Streamline middleware function to better fit in with the system

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
```