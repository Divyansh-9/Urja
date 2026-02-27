// Vercel Serverless entry — imports the pre-built Express bundle
const app = require('../apps/api/dist/server');
module.exports = app.default || app;
