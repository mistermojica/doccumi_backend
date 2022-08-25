module.exports = {
    apps : [{
      name: 'BACKEND',
      script: 'server.js',
      watch: 'app',
      // watch: ["app"],
      // Delay between restart
      watch_delay: 1000,
      ignore_watch : ["node_modules", "public", ".git"],
      watch_options: {
        "followSymlinks": false
      }
    }],
    deploy : {
      production : {
        'pre-deploy-local': '',
        'post-deploy': 'pm2 save',
        'pre-setup': ''
      }
    }
  };
