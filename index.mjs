import express from 'express';
import puppeteer from 'puppeteer';
import httpProxy from 'http-proxy';
import { ssr, clearCache } from './ssr.mjs';

import config from 'config';
const port = config.get('port');
const chromiumPath = config.get('chromiumPath');

const originURL = config.get('originURL');
console.log(">>>>>>>> originURL: " + originURL);

const app = express();
var proxy = httpProxy.createProxyServer({});
let browserWSEndpoint = null;

app.get('*', async (req, res, next) => {
  // console.info("======== request: %s", req.method, req.url);

  if (req.url == "/flush-all-cache") {
    clearCache();
    return res.status(200).send('<html><body></body></html>');
  }

  if (req.header('accept') == undefined || req.header('accept').indexOf("html") < 0) {
    return proxy.web(req, res, { target: originURL });
  }

  if (!browserWSEndpoint) {
    const browser = await puppeteer.launch({
      executablePath: chromiumPath,
      args: [
        '--allow-pre-commit-input',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-component-update',
        '--disable-default-apps',
        '--disable-extensions',
        // AcceptCHFrame disabled because of crbug.com/1348106.
        '--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--enable-automation',
        // TODO(sadym): remove '--enable-blink-features=IdleDetection' once
        // IdleDetection is turned on by default.
        '--enable-blink-features=IdleDetection',
        '--enable-features=NetworkServiceInProcess2',
        '--export-tagged-pdf',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-first-run',
        '--password-store=basic',
        '--use-mock-keychain',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--unhandled-rejections=strict',
      ],
    });
    browserWSEndpoint = await browser.wsEndpoint();
  }
  
  var {html, ttRenderMs} = await ssr(`${originURL}${req.url}`, browserWSEndpoint);

  console.info("timed render %s: %s ms", req.url, ttRenderMs);

  // html = html.replace('</head>', `<meta http-equiv="refresh" content="10; URL=${originURL}${req.url}" /></head>`)

  return res.status(200).send(html); 
});

app.listen(port, () => console.log('Server started at port %s. Press Ctrl+C to quit', port));
