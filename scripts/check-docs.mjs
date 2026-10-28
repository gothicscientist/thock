import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const docs = ['README.md','CHANGELOG.md','docs/architecture.md','docs/media/README.md'];
const anchor = text => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
let checked = 0;
for (const name of docs) {
  const file = path.join(root, name);
  const text = await readFile(file, 'utf8');
  let level = 0;
  for (const line of text.replace(/```[\s\S]*?```/g, '').split(/\r?\n/)) {
    const h = line.match(/^(#{1,6}) /);
    if (!h) continue;
    if (h[1].length > level + 1) throw Error(`${name}: skipped heading level`);
    level = h[1].length;
  }
  if ((text.match(/^```/gm) || []).length % 2) throw Error(`${name}: unclosed code fence`);
  for (const [,target] of text.matchAll(/!?\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^https?:/.test(target)) continue; // Network availability is separate from source validity.
    const [relative, fragment] = target.split('#');
    const destination = relative ? path.resolve(path.dirname(file), relative) : file;
    const info = await stat(destination).catch(() => {throw Error(`${name}: missing ${target}`);});
    if (/\.(webp|png|gif|jpg)$/i.test(destination) && info.size > 5 * 1024 * 1024) throw Error(`${name}: media exceeds 5 MB`);
    if (fragment && destination.endsWith('.md')) {
      const body = await readFile(destination, 'utf8');
      const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map(m => anchor(m[1]));
      if (!headings.includes(fragment)) throw Error(`${name}: missing anchor ${target}`);
    }
    checked++;
  }
  for (const [,command] of text.matchAll(/\bnpm run ([\w:-]+)/g)) {
    if (!pkg.scripts[command]) throw Error(`${name}: unknown npm script ${command}`);
  }
  if (/\b(revolutionary|cutting-edge|game-changing|seamless|groundbreaking)\b/i.test(text)) throw Error(`${name}: unsupported promotional language`);
  if (/ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/.test(text)) throw Error(`${name}: possible credential`);
}
console.log(`Validated ${docs.length} documents and ${checked} local links; headings, media sizes and npm scripts passed.`);
