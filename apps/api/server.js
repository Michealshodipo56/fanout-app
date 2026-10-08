// Vercel Services requires the entrypoint to exist before its build command runs.
// The service build replaces this shim with a bundled production artifact.
module.exports = require('./dist/server.js');
