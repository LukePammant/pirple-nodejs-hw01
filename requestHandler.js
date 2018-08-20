const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

class RequestHandler {
    constructor() {
        this.routes = {
            ping: (_, callback) => callback(200, "PONG!"),
            notFound: (_, callback) => callback(404),
        }

        this.addRoute = this.addRoute.bind(this);
        this.handleRequest = this.handleRequest.bind(this);
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const path = parsedUrl.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');
        const method = req.method.toLowerCase();
        const params = parsedUrl.query;
        const headers = req.headers;

        const decoder = new StringDecoder('utf8');
        let buffer = '';

        req.on('data', (data) => { buffer += decoder.write(data); });

        req.on('end', () => {
            buffer += decoder.end();

            const routeHandler = this.routes[trimmedPath] || this.routes.notFound;
            const data = {
                trimmedPath,
                params,
                headers,
                method,
                payload: buffer
            }

            routeHandler(data, (statusCode, payload) => {
                statusCode = statusCode ? statusCode : 200;
                payload = payload ? payload : {};

                var payloadString = JSON.stringify(payload);

                res.setHeader("Content-Type", "application/json");
                res.writeHead(statusCode);
                res.end(payloadString);

                console.log(`${method.toUpperCase()}: '${trimmedPath}' - Response: ${payloadString}`);
            });
        });
    }
}

const handler = new RequestHandler();
module.exports = handler;