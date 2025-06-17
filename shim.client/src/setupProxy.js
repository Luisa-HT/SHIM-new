// ClientApp/setupProxy.js
// This file is used to proxy API requests from the React development server
// to the ASP.NET Core backend server during development.
// It's part of the Create React App template for ASP.NET Core.

const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:5000'; // Fallback to http if HTTPS not configured

const context = [
    "/api", // All requests starting with /api will be proxied
    "/_configuration",
    "/.well-known",
    "/Identity",
    "/connect",
    "/_framework",
    "/_vs/browserLink",
    "/_host",
    "/WeatherForecast" // Example endpoint from default template, remove if not needed
];

module.exports = function(app) {
    const appProxy = createProxyMiddleware(context, {
        target: target,
        secure: false, // Set to true for production if using HTTPS with valid certs
        headers: {
            Connection: 'Keep-Alive'
        }
    });

    app.use(appProxy);
};
