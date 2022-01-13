# NodeJS Workers
Spawn workers with ease, a simple function to make everything hassle-free.
## Example
```javascript
function workerFunction() {
    // code for each worker here
}

const Worker = require("./worker.js");
Worker(workerFunction, { exit: function(worker, code, signal){
    console.log(`worker ${worker.process.pid} has died`);
, spawn: function() {
    console.log(`worker launched`);
}});
```