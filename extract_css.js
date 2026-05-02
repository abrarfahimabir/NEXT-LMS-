const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    const styles = await page.evaluate(() => {
      return Array.from(document.styleSheets).map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n');
    });
    console.log(styles);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
