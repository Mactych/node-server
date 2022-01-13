const server = require("./server.js");
const app = server();
const web_default = new server.Router();
const web_localhost = new server.Router();

web_default.use("*", (req, res, next) => {
    res.setHeaders({
        "Connection": "keep-alive",
        "Server": "MacStudio"
    });
    next();
});
web_default.get("/", (req, res) => {
    res.send("home");
});
web_default.get("/hw1/:name", (req, res) => {
    res.send("Hello World-1 " + req.params.name);
});
web_default.get("*", (req,res) => {
    res.send("404 not found");
});

// use the virtual network
app.virtual("*", web_default);
app.listen(80, (port) => {
    console.log(`listening on port ` + port);
});