var cluster = require('cluster');
var os = require('os');

/**
    * Create a new worker
    * @param {Function} script The script you want to run for each workers
    * @param {String} url Custom database URL 
    * @param {Object} callbacks Worker callbacks
    * @param {Function} [callbacks.spawn] Callback to be run when worker is spawned
    * @param {Function} [callbacks.exit] Callback to be run when worker dies
*/
function Worker(script, callback) {
    function spawn() {
        callback.spawn();
        cluster.fork();
    }
    if (cluster.isMaster) { // console.log('master started');
        for (let i = 0; i < os.cpus().length; i++) {
            spawn();
        }
        cluster.on('exit', (worker, code, signal) => {
            callback.exit(worker, code, signal);
            spawn();
        });
    } else {
        script();
    }
}

module.exports = Worker;


/*
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
*/