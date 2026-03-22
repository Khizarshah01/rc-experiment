const http = require('http');

const server = http.createServer((req, res) => {
    let body = '';

    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        const data = JSON.parse(body);
        console.log('Received:', data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            result: "Thank you for mentioning me",
            id: data.userid
        }));
    });
});

server.listen(5187, () => console.log('running on http://localhost:5187'));