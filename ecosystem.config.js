module.exports = {
  apps: [
    {
      autorestart: true,
      env: {
				NODE_ENV: "dev",
				DEBUG: "dliveAutoBot:*"
      },
      env_production: {
        NODE_ENV: "production"
      },
      max_memory_restart: "1G",
      name: "dliveAutoBot",
      script: "./bin/www",
      watch: false
    }
  ]
};
