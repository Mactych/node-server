const server = require("./server.js");
const app = server();
const web_default = new server.Router();
const web_localhost = new server.Router();

web_localhost.use((req, res, next) => {
    res.setHeaders({
        "Connection": "keep-alive",
        "Server": "MacStudio"
    });
    next();
});
/* web_localhost.static(`${__dirname}/server/routes/uploader/static`); */
/* web_default.get("/apple", (req, res) => {
    res.html("this is apple");
}); */
web_default.get("/", (req, res) => {
    res.html("hi");
});


// use the virtual network
app.virtual("*", web_localhost);
app.virtual("*", web_default);
app.listen(80, (port) => {
    console.log(`listening on port ` + port);
});