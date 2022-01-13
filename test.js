const server = require("./server.js");

const app = server();
const v1 = new server.Router();
const v2 = new server.Router();
v1.use("*", (req, res, next) => {
    res.setHeaders({
        "Connection": "keep-alive",
        "Server": "MacStudio"
    });
    next();
});
v1.use("/test", v2);
v1.get("/", (req, res) => {
    res.send("home");
});
v1.get("/hw1/:name", (req, res) => {
    res.send("Hello World-1 " + req.params.name);
});
v2.get("/hw2", (req, res) => {
    res.send("Hello World-2");
});
v1.get("*", (req,res) => {
    res.write("404 not found");
    res.end();
});

// use the virtual network
app.virtual("localhost", v1);
app.listen(80, (port) => {
    console.log(`listening on port ` + port);
});