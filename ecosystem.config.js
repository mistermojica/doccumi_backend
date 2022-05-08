module.exports = {
    apps : [{
      //name: 'CDV_HTTP_SERVER',
      script: 'server.js',
      //watch: '.'
      watch: ["server", "client"],
      // Delay between restart
      watch_delay: 1000,
      ignore_watch : ["node_modules", "public"],
      watch_options: {
        "followSymlinks": false
      }
    }],
    deploy : {
      production : {
        'pre-deploy-local': '',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup': ''
      }
    }
  };