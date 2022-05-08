// Make sure you added pm2 as a dependency in your package.json
// Then in your Procfile, do a simple `node bootstrap.js`

var pm2 = require('pm2');
 
var MACHINE_NAME = 'EMPLEADOS';
var PRIVATE_KEY  = 'e3z36ssz9kfca9c';
var PUBLIC_KEY   = 'ilq1dyt1oph8w53';

var instances = process.env.WEB_CONCURRENCY || 1; // Set by Heroku
var maxMemory = process.env.WEB_MEMORY || 512;    // " " "
 
pm2.connect(function() {
  pm2.start({
    script    : 'server.js',
    instances : instances,                      // Scale app based on Heroku's recommendations
    max_memory_restart : maxMemory + 'M',       // Auto restart if process taking more than 100mo
    env: {                                      // If needed declare some environment variables
       "NODE_ENV": "production",
       "AWESOME_SERVICE_API_TOKEN": "xxx"
    },
    post_update: ["npm install"]                // Commands to execute once we do a pull from Keymetrics
  }, function() {
    pm2.interact(PRIVATE_KEY, PUBLIC_KEY, MACHINE_NAME, function() {});
  });
});