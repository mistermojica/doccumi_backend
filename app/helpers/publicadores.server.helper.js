const puppeteer = require('puppeteer'); // v13.0.0 or later

// const sgdYear = '2013';
// const sgdBrand = 'Daihatsu';
// const sgdModel = 'Charade';

exports.marketplace = (async (ctx) => {
    console.log('PROCESO INICIADO');
    console.log('ctx:', ctx);
    const sgdIndentifier = ctx.year.concat(' ').concat(ctx.brand).concat(' ').concat(ctx.model);

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
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
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
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
        await targetPage.setViewport({"width":1600,"height":600})
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto("https://www.facebook.com/login/?next=%2Fmarketplace%2F");
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Email or phone number"],["#email"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 223.5, y: 38.9296875} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Email or phone number"],["#email"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("comparainfo@gmail.com");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "comparainfo@gmail.com");
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
        const element = await waitForSelectors([["aria/Password"],["#pass"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("facebook@$!#2423OM");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "facebook@$!#2423OM");
        }
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([["aria/Log In[role=\"button\"]"],["#loginbutton"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 189.8599853515625, y: 21.449676513671875} });
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".aov4n071.bi6gxh9e.dhix69tm.wkznzc2l > a[role='link']"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 62.796875, y: 8} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".sonix8o1:nth-of-type(2) [role]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 35.5, y: 29.2890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(3) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 163, y: 32.7578125} });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/Auto/camioneta"],[".hv4rvrfc:nth-of-type(3) .nhd2j8a9"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 98, y: 10.0234375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(8) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 125, y: 16.7890625} });
    }
    {
      const targetPage = page;
      const element = await waitForSelectors([["aria/".concat(ctx.year)],[".hv4rvrfc:nth-of-type(8) .nhd2j8a9"]], targetPage, { timeout, visible: true });
      await scrollIntoViewIfNeeded(element, timeout);
      await element.click({ offset: { x: 98, y: 10.0234375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Marca[role=\"textbox\"]"],["#jsc_c_2d"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 300, y: 23.7890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Marca[role=\"textbox\"]"],["#jsc_c_2d"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type(ctx.brand);
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, ctx.brand);
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
        const element = await waitForSelectors([["aria/Modelo[role=\"textbox\"]"],["#jsc_c_2f"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type(ctx.model);
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, ctx.model);
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
        const element = await waitForSelectors([["aria/Kilometraje[role=\"textbox\"]"],["#jsc_c_2m"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("123444");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "123444");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Precio[role=\"textbox\"]"],["#jsc_c_2h"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 84, y: 26.8125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Precio[role=\"textbox\"]"],["#jsc_c_2h"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("RD$ 2.342.342");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "RD$ 2.342.342");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(15) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 170, y: 31.828125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Hatchback"],[".hv4rvrfc:nth-of-type(15) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 98, y: 10.0234375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/El título del vehículo no presenta inconvenientes."],["input[name='title_status']"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 16, y: 13.3515625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(18) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 206, y: 36.859375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Bueno"],[".hv4rvrfc:nth-of-type(18) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 115, y: 6.015625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(19) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 185, y: 32.859375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Gasolina"],[".hv4rvrfc:nth-of-type(19) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 115, y: 6.015625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(20) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 71, y: 9.015625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Transmisión automática"],[".hv4rvrfc:nth-of-type(20) .nhd2j8a9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 115, y: 6.015625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".ieid39z1"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 119, y: 15.71875} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Descripción[role=\"textbox\"]"],[".ieid39z1"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 123, y: 33.8828125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Descripción[role=\"textbox\"]"],[".ieid39z1"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("Esto es una prueba");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "Esto es una prueba");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".dati1w0a .aov4n071 [role]"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        // await element.click({ offset: { x: 9, y: 4.7578125} });
    }
    {
        const targetPage = page;
        const filepath = '/Users/omarmojica/Proyectos/documi/backend/public/uploads/amadita.png';
        const element = await targetPage.$('input[type="file"]');
        await element.uploadFile(filepath);
        console.log("FOTO CARGADA", filepath);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([[".s1i5eluu.qypqp5cg"]], targetPage, { timeout, visible: true });
        console.log("VEHICULO REVISADO");
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 66.421875, y: 7} });
    }
    {
        await delay(5000);

        //:not([disabled])
        const targetPage = page;
        await page.waitForXPath("//span[contains(text(),'Publicar')]");

        const element = await waitForSelectors([['aria/Publicar[role="button"]']], targetPage, { timeout, visible: true });
        console.log("VEHICULO PUBLICADO");
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 31.515625, y: 13} });

        await delay(5000);
        page.waitForXPath(`//span[contains(text(),'${sgdIndentifier}')]`).then((resSelector) => {
          console.log('Encontró el identificador:', sgdIndentifier);
          browser.close();
        }).catch(() => {
          console.log('No encontró el identificador:', sgdIndentifier);
        });
    }
})();

exports.instagram = (async () => {
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
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
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
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "bitubi.do");
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
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "btb@$!#2423OM");
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