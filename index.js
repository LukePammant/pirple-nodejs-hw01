const fs = require('fs');
const http = require('http');
const https = require('https');
const config = require('./config');
const requestHandler = require('./requestHandler');

requestHandler.post('hello', (req, callback) => {
    callback(200, { response: "Hello there" });
});

const httpServer = http.createServer(requestHandler.handleRequest);
httpServer.listen(config.httpPort, () => {
    console.log(`http listening on ${config.httpPort} in '${config.envName}'`);
});

const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, requestHandler.handleRequest);
httpsServer.listen(config.httpsPort, () => {
    console.log(`https listening on ${config.httpsPort} in '${config.envName}'`);
});
