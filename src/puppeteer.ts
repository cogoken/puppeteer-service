import type { Browser, Viewport } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import { config } from './config';
import { validateUrl } from './url.utils';

const inBrowser = async <T>(callback: (browser: Browser) => T) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: config.chromeBinaryPath,
    // https://github.com/buildkite/docker-puppeteer/blob/master/example/integration-tests/index.test.js
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const result = await callback(browser);

  await browser.close();

  return result;
};

export const htmlToPdf = async (html: string) => {
  return await inBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setContent(html);

    return await page.pdf({ format: 'a4', printBackground: true });
  });
};

export const htmlToPng = async (html: string, viewport: Viewport) => {
  return await inBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setContent(html);
    await page.setViewport(viewport);

    return await page.screenshot({ type: 'png' });
  });
};

export const urlToPng = async (url: string, viewport: Viewport) => {
  validateUrl(url);

  return await inBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, {
      waitUntil: ['load','networkidle0','domcontentloaded'], // Wait for all non-lazy loaded images to load
    });
    await page.setViewport(viewport);
    // await page.waitForSelector('div.dc-chart');
    // await page.mouse.move(1000, 40);
    await page.waitForTimeout(5000);
    return await page.screenshot({ type: 'png' });
  });
};

export const urlToPdf = async (url: string) => {
  validateUrl(url);

  return await inBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.goto(url);

    return await page.pdf({ format: 'a4', printBackground: true });
  });
};



