const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('file:///Volumes/my/GitHub/CopyWebPagesLinks/promo.html');
  await page.screenshot({ path: 'promo.png', fullPage: true });
  await browser.close();
})();