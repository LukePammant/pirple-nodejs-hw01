const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

class RequestRouter {
    constructor() {
        this.routes = {
            get: {},
            post: {},
            put: {},
            delete: {},
            ping: async () => ({ statusCode: 200, data: "PONG!" }),
            notFound: async () => ({ statusCode: 404 }),
        }

        this.handleRequest = this.handleRequest.bind(this);
        this.addRoute = this.addRoute.bind(this);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.delete = this.delete.bind(this);
    }

    addRoute(path, handler) {
        this.routes[path.toLowerCase()] = handler;
    }

    delete(path, handler) {
        this.routes.delete[path.toLowerCase()] = handler;
    }

    get(path, handler) {
        this.routes.get[path.toLowerCase()] = handler;
    }

    post(path, handler) {
        this.routes.post[path.toLowerCase()] = handler;
    }

    put(path, handler) {
        this.routes.put[path.toLowerCase()] = handler;
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

            const routeHandler = this.routes[method][trimmedPath] ||
                this.routes[trimmedPath] ||
                this.routes.notFound;

            const requestData = {
                trimmedPath,
                params,
                headers,
                method,
                payload: buffer,
                json: () => JSON.parse(buffer)
            }

            routeHandler(requestData)
                .then(({ statusCode, data }) => {
                    var payloadString = JSON.stringify(data || {});

                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(statusCode || 200);
                    res.end(payloadString);

                    console.log(`${method.toUpperCase()}: '${trimmedPath}' - ${statusCode} Response: ${payloadString}`);
                }).catch((e) => {
                    console.error(e);
                    res.setHeader("Content-Type", "application/json");
                    res.writeHead(500);
                    var payloadString = JSON.stringify({ error: e.messge });
                    res.end(payloadString);
                });
        });
    }
}

const router = new RequestRouter();
module.exports = {
    router,
    responseMethods: {
        ok: (data) => ({ statusCode: 200, data }),
        invalid: (data) => ({ statusCode: 400, data }),
        notFound: (data) => ({ statusCode: 404, data }),
        error: (data) => ({ statusCode: 500, data }),
    }
};