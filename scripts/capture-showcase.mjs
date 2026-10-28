import {chromium} from 'playwright';
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {preview} from './preview.mjs';

const out = new URL('../docs/media/', import.meta.url);
await mkdir(out, {recursive:true});
const server = await preview(0);
let browser;
try {
  browser = await chromium.launch({headless:true, ...(process.env.THOCK_BROWSER_EXECUTABLE ? {executablePath:process.env.THOCK_BROWSER_EXECUTABLE} : {})});
  const context = await browser.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:2,colorScheme:'light',reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, {waitUntil:'networkidle'});
  await page.waitForFunction(() => document.querySelectorAll('.fitem.feat').length === 3);
  await page.evaluate(() => document.fonts.ready);
  const capture = async name => {
    // Real rendered pixels only, captured at 2x without replacing product imagery.
    const pixels = await page.screenshot();
    await sharp(pixels).webp({quality:88}).toFile(fileURLToPath(new URL(name, out)));
  };
  await capture('finder.webp');
  await page.locator('#nav-build').click();
  await page.locator('#view-build').waitFor({state:'visible'});
  await page.waitForTimeout(600);
  await capture('builder.webp');
  if (errors.length) throw Error(errors.join('\n'));
  console.log('Captured Finder and Builder at 1600x1000, 2x scale; no page errors.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
