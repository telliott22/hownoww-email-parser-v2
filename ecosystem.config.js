const pkg = require('./package')

module.exports = {
  apps: [
    {
      name: pkg.name,
      script: 'npm',
      args: 'run start',
      max_memory_restart: '200M',
    },
  ],
}
