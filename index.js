const fs = require('fs');
const http = require('http');
const https = require('https');
const config = require('./lib/config');
const router = require('./lib/requestHandler').router;
const userRoutes = require('./lib/users');

router.post('hello', (_, callback) => {
    callback(200, { response: "Hello there" });
});

router.post('user', userRoutes.post);
router.get('user', userRoutes.get);
router.put('user', userRoutes.put);
router.delete('user', userRoutes.delete);

const httpServer = http.createServer(router.handleRequest);

httpServer.listen(config.httpPort, () => {
    console.log(`http listening on ${config.httpPort} in '${config.envName}'`);
});

const httpsServerOptions = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, router.handleRequest);

httpsServer.listen(config.httpsPort, () => {
    console.log(`https listening on ${config.httpsPort} in '${config.envName}'`);
});


