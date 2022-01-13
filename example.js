const server = require("./server.js");
const app = server();
const web_default = new server.Router();
const web_localhost = new server.Router();

web_localhost.use("*", (req, res, next) => {
    res.setHeaders({
        "Connection": "keep-alive",
        "Server": "MacStudio"
    });
    next();
});
/* web_localhost.static("/", `${__dirname}/server/routes/uploader/static`); */
web_localhost.get("/", (req, res) => {
    res.html("localhost home");
});
web_default.get("*", (req,res) => {
    res.html("404 not found");
});


// use the virtual network
app.virtual("*", web_localhost);
app.virtual("*", web_default);
app.listen(80, (port) => {
    console.log(`listening on port ` + port);
});