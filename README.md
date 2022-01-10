# Custom Server
This server was build to be a lightweight webserver for all of my systems that require dynamic content, all static content is hosted on an Apache webserver.

## To do
- [ ] Create a router
- [x] Fix issue where two middlewhares with the same path won't work, to fix this I must put them into an array

## How to use
Firstly declear the server class, example below.
```javascript
const web = require("./server.js");
const webserver = new web.Server();
```
Create a new virtual site (this site will only respond to the hostname you provide)
```javascript
const site = new web.Virtual("domainhere.com", webserver);
```
Add a middleware to a virtual site
```javascript
site.use("*", (req, res, next) => {
    // intercepts url paths
    console.log(req.url);
    next();
});
```
Create a new route for the virtual site
```javascript
site.add("GET", "/", (req, res) => {
    res.write("server example!");
    res.end();
});
```