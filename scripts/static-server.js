const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PORT = parseInt(process.env.PORT, 10) || 80;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.gz': 'application/gzip',
  '.br': 'application/brotli',
};

http.createServer((req, res) => {
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(500);
          res.end('500 Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  console.log(`[server] serving ${DIST} on ${HOST}:${PORT}`);
});