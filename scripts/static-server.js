const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PORT = parseInt(process.env.PORT, 10) || 80;
const HOST = '0.0.0.0';

console.log(`[server] starting`);
console.log(`[server] cwd: ${process.cwd()}`);
console.log(`[server] __dirname: ${__dirname}`);
console.log(`[server] dist: ${DIST}`);
console.log(`[server] PORT env: ${process.env.PORT || '(not set)'}`);
console.log(`[server] binding: ${HOST}:${PORT}`);

// Check if dist exists
try {
  const files = fs.readdirSync(DIST);
  console.log(`[server] dist/ has ${files.length} entries`);
} catch (e) {
  console.log(`[server] ERROR: dist/ not found: ${e.message}`);
  process.exit(1);
}

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

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(DIST, url);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(500);
          res.end('500');
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
});

server.listen(PORT, HOST, () => {
  console.log(`[server] OK - listening on ${HOST}:${PORT}`);
});

// Also log if server errors
server.on('error', (e) => {
  console.log(`[server] ERROR: ${e.message}`);
});