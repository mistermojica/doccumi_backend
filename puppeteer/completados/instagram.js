const puppeteer = require('puppeteer'); // v13.0.0 or later

(async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // await page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36');
    const timeout = 20000;
    page.setDefaultTimeout(timeout);

    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      if (!options.noexit){
        throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
      }
    }

    async function scrollIntoViewIfNeeded(element, timeout) {
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({threshold: 0});
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        });
      });
      await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }

    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({threshold: 0});
      }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
    {
        const targetPage = page;
        await targetPage.setViewport({"width":1000,"height":700})
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto("https://www.instagram.com/");
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([['input[name="username"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 108.84375, y: 18.9375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([['input[name="username"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("bitubi.do", { delay: 10 });
          console.log('Entrada usuario 1');
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "bitubi.do");
          console.log('Entrada usuario 2');
        }
    }
    {
        const targetPage = page;
        await targetPage.keyboard.down("Tab");
    }
    {
        const targetPage = page;
        await targetPage.keyboard.up("Tab");
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([['input[name="password"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("btb@$!#2423OM", { delay: 20 });
          console.log('Entrada contraseña 1');

        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "btb@$!#2423OM");
          console.log('Entrada contraseña 2');
        }
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([['button[type="submit"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 124.84375, y: 12.9375} });
        await Promise.all(promises);
        console.log('Click Botón Login');
    }
    // {
    //   const targetPage = page;
    //   const element = await waitForSelectors([["aria/Not Now"],[".cmbtv"]], targetPage, { timeout, visible: true }); //.cmbtv [type]
    //   await scrollIntoViewIfNeeded(element, timeout);
    //   await element.click({ offset: { x: 203, y: 27} });
    // }
    {
      await page.waitForXPath("//button[contains(text(),'Not Now')]");
      let next = await page.$x("//button[contains(text(),'Not Now')]");
      await next[0].click();
    }
    {
      await page.waitForXPath("//button[contains(text(),'Not Now')]");
      let next = await page.$x("//button[contains(text(),'Not Now')]");
      await next[0].click();
    }
    // {
    //     const targetPage = page;
    //     const element = await waitForSelectors([["aria/Not Now"],["button._a9--._a9_1"]], targetPage, { timeout, visible: true });
    //     await scrollIntoViewIfNeeded(element, timeout);
    //     await element.click({ offset: { x: 203, y: 27} });
    // }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/New post"],["button._abl-._abm2"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 14.5, y: 14} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Select from computer"],["button._acan._acap._acas"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        // await element.click({ offset: { x: 86.25, y: 16.5} });
    }
    {
      const targetPage = page;
      const filepath = __dirname + '/circulo.png';
      // await element.uploadFile(filepath);
      let fileInputs = await targetPage.$$('input[type="file"]');
      let input = fileInputs[fileInputs.length - 1];
      await input.uploadFile(filepath);
      console.log("FOTO CARGADA NUEVA", filepath);
    }
    {
      await page.waitForXPath("//button[contains(text(),'Next')]");
      let next = await page.$x("//button[contains(text(),'Next')]");
      await next[0].click();
      await delay(1000);
    }
    {
      await page.waitForXPath("//button[contains(text(),'Next')]");
      let next = await page.$x("//button[contains(text(),'Next')]");
      await next[0].click();
      console.debug('clicking next');
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Write a caption..."],["#mount_0_0_P5 > div > div:nth-child(1) > div > div:nth-child(4) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div > div > div > div > div > div._ac2r._ac2s > div._ac2v > div > div > div > div:nth-child(2) > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p > textarea"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 135.5, y: 13} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Write a caption..."],["#mount_0_0_P5 > div > div:nth-child(1) > div > div:nth-child(4) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div > div > div > div > div > div._ac2r._ac2s > div._ac2v > div > div > div > div:nth-child(2) > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p > textarea"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("Este es el caption");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "Este es el caption");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Add location[role=\"textbox\"]"],['input[name="creation-location-input"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 136.5, y: 31} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Add location[role=\"textbox\"]"],['input[name="creation-location-input"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("Santo Domingo, Dominican Republic");
          await delay(2000);
          await element.click({ offset: { x: 50, y: 120} });
          await delay(2000);
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "Santo Domingo, Dominican Republic");
          await delay(2000);
          await element.click({ offset: { x: 50, y: 120} });
          await delay(2000);
        }
    }
    await delay(3000);
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Share"],['button[type="button"]']], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        // await element.click({ offset: { x: 19.578125, y: 12} });
    }
    {
      await page.waitForXPath("//button[contains(text(),'Share')]");
      let next = await page.$x("//button[contains(text(),'Share')]");
      await next[0].click();
    }
    {
      await page.waitForXPath("//div[contains(text(),'Post shared')]");
      await delay(2000);
    }

    await browser.close();
})();

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}