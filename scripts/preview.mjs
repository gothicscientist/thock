import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};

// Serve the staged Pages output, including its extensionless view URLs.
export async function preview(port = 4173) {
  await stat(path.join(root, 'index.html')).catch(() => {throw Error('Missing dist/index.html. Run npm run site:stage first.');});
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const route = pathname === '/' ? '/index.html' : path.extname(pathname) ? pathname : pathname + '.html';
      const file = path.resolve(root, '.' + route);
      if (!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
      const body = await readFile(file);
      res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
      res.end(body);
    } catch {res.writeHead(404).end('Not found');}
  });
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(port, '127.0.0.1', resolve);});
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await preview();
  console.log(`Thock preview: http://127.0.0.1:${server.address().port}`);
}
