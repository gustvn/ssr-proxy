import puppeteer from 'puppeteer';
import NodeCache from "node-cache";
const myCache = new NodeCache();

async function ssr(url, browserWSEndpoint) {
  if (myCache.has(url)){
    return {html: myCache.get(url), ttRenderMs: 0};
  }

  const start = Date.now();

  const browser = await puppeteer.connect({browserWSEndpoint});
  const page = await browser.newPage();

  try {
    // networkidle0 waits for the network to be idle (no requests for 500ms).
    // The page's JS has likely produced markup by this point, but wait longer
    // if your site lazy loads, etc.
    await page.goto(url, {waitUntil: 'networkidle0'});
  } catch (err) {
    console.error(err);
    throw new Error('page.goto/waitForSelector timed out.');
  }

  const html = await page.content(); // serialized HTML of page DOM.
  await page.close();

  const ttRenderMs = Date.now() - start;
  
  myCache.set(url, html, 3600); // cache 1h

  return {html, ttRenderMs};
}

function clearCache() {
  myCache.flushAll();
}

export { ssr, clearCache };