const puppeteer = require('puppeteer'); // v13.0.0 or later
const path = require('path');
const http = require('http');
const fs = require('fs');
const {resolve} = require("path");

exports.marketplace = function(ctx) {
  var promise = new Promise(function(resolve, reject) {
    (async () => {
      try {
        console.log('PROCESO marketplace INICIADO');
        console.log('ctx:', ctx);

        ctx.identificador = ctx?.year.concat(' ').concat(ctx?.brand).concat(' ').concat(ctx?.model);

        let omLaunchOptions = {};

        if (ctx.show){
          omLaunchOptions = {
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=es-ES,es']
          }
        }

        const browser = await puppeteer.launch(omLaunchOptions);
        const page = await browser.newPage();
        const timeout = 20000;
        page.setDefaultTimeout(timeout);

        await page.setExtraHTTPHeaders({
          'Accept-Language': 'es'
        });

        // Set the language forcefully on javascript
        // await page.evaluateOnNewDocument(() => {
        //   Object.defineProperty(navigator, "language", {
        //       get: function() {
        //           return "bn-BD";
        //       }
        //   });
        //   Object.defineProperty(navigator, "languages", {
        //       get: function() {
        //           return ["bn-BD", "bn"];
        //       }
        //   });
        // });

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

        Log('STEP:', 1);

        {
            const targetPage = page;
            await targetPage.setViewport({"width":1600,"height":600})
        }

        Log('STEP:', 2);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            await targetPage.goto("https://www.facebook.com/login/?next=%2Fmarketplace%2F");
            await Promise.all(promises);
        }

        Log('STEP:', 3);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Correo electrónico o número de teléfono"],["#email"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 223.5, y: 38.9296875} });
        }

        Log('STEP:', 4);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Correo electrónico o número de teléfono"],["#email"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conFBUsuario);
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conFBUsuario);
            }
        }

        Log('STEP:', 5);

        {
            const targetPage = page;
            await targetPage.keyboard.down("Tab");
        }

        Log('STEP:', 6);

        {
            const targetPage = page;
            await targetPage.keyboard.up("Tab");
        }

        Log('STEP:', 7);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Contraseña"],["#pass"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conFBContrasena);
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conFBContrasena);
            }
        }

        Log('STEP:', 8);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            const element = await waitForSelectors([["aria/Iniciar sesión[role=\"button\"]"],["#loginbutton"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 189.8599853515625, y: 21.449676513671875} });
            await Promise.all(promises);
        }

        Log('STEP:', 9);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".x1e56ztr.x1xmf6yo.x1d52u69.xktsk01 > a[role='link']"]], targetPage, { timeout, visible: true });
            // const element = await waitForSelectors([[".aov4n071.bi6gxh9e.dhix69tm.wkznzc2l > a[role='link']"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 62.796875, y: 8} });
        }

        Log('STEP:', 10);

        {
            // const targetPage = page;
            // const element = await waitForSelectors([[".sonix8o1:nth-of-type(2) [role]"]], targetPage, { timeout, visible: true });
            // await scrollIntoViewIfNeeded(element, timeout);
            // await element.click({ offset: { x: 35.5, y: 29.2890625} });

            await page.waitForXPath("//span[contains(text(),'Vehículo en venta')]");
            let next = await page.$x("//span[contains(text(),'Vehículo en venta')]");
            await next[0].click();
        }

        Log('STEP:', 11);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(3) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 163, y: 32.7578125} });
        }

        Log('STEP:', 12);

        {
          const targetPage = page;
          const element = await waitForSelectors([["aria/Auto/camioneta"],[".hv4rvrfc:nth-of-type(3) .nhd2j8a9"]], targetPage, { timeout, visible: true });
          await scrollIntoViewIfNeeded(element, timeout);
          await element.click({ offset: { x: 98, y: 10.0234375} });
        }

        Log('STEP:', 13);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(8) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 125, y: 16.7890625} });
        }

        Log('STEP:', 14);

        {
          const targetPage = page;
          const element = await waitForSelectors([["aria/".concat(ctx.year)],[".hv4rvrfc:nth-of-type(8) .nhd2j8a9"]], targetPage, { timeout, visible: true });
          await scrollIntoViewIfNeeded(element, timeout);
          await element.click({ offset: { x: 98, y: 10.0234375} });
        }

        Log('STEP:', 15);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Marca[role=\"textbox\"]"],["#jsc_c_2d"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 300, y: 23.7890625} });
        }

        Log('STEP:', 16);

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

        Log('STEP:', 17);

        {
            const targetPage = page;
            await targetPage.keyboard.down("Tab");
        }

        Log('STEP:', 18);

        {
            const targetPage = page;
            await targetPage.keyboard.up("Tab");
        }

        Log('STEP:', 19);

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

        Log('STEP:', 20);

        {
            const targetPage = page;
            await targetPage.keyboard.down("Tab");
        }

        Log('STEP:', 21);

        {
            const targetPage = page;
            await targetPage.keyboard.up("Tab");
        }

        Log('STEP:', 22);

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

        Log('STEP:', 23);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Precio[role=\"textbox\"]"],["#jsc_c_2h"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 84, y: 26.8125} });
        }

        Log('STEP:', 24);

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

        Log('STEP:', 25);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(15) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 170, y: 31.828125} });
        }

        Log('STEP:', 26);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Hatchback"],[".hv4rvrfc:nth-of-type(15) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 98, y: 10.0234375} });
        }

        Log('STEP:', 27);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/El título del vehículo no presenta inconvenientes."],["input[name='title_status']"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 16, y: 13.3515625} });
        }

        Log('STEP:', 28);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(18) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 206, y: 36.859375} });
        }

        Log('STEP:', 29);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Bueno"],[".hv4rvrfc:nth-of-type(18) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 115, y: 6.015625} });
        }

        Log('STEP:', 30);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(19) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 185, y: 32.859375} });
        }

        Log('STEP:', 31);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Gasolina"],[".hv4rvrfc:nth-of-type(19) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 115, y: 6.015625} });
        }

        Log('STEP:', 32);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".hv4rvrfc:nth-of-type(20) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 71, y: 9.015625} });
        }

        Log('STEP:', 33);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Transmisión automática"],[".hv4rvrfc:nth-of-type(20) .nhd2j8a9"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 115, y: 6.015625} });
        }

        Log('STEP:', 34);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".ieid39z1"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 119, y: 15.71875} });
        }

        Log('STEP:', 35);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Descripción[role=\"textbox\"]"],[".ieid39z1"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 123, y: 33.8828125} });
        }

        Log('STEP:', 36);

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

        Log('STEP:', 37);

        {
            const targetPage = page;
            const element = await waitForSelectors([[".dati1w0a .aov4n071 [role]"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            // await element.click({ offset: { x: 9, y: 4.7578125} });
        }

        Log('STEP:', 38);

        {
            const targetPage = page;
            // const filepath = ctx.image;
            // const element = await targetPage.$('input[type="file"]');
            // await element.uploadFile(filepath);
            const element = await waitForSelectors([[".pq6dq46d.q676j6op"]], targetPage, { timeout, visible: true });
            // await page.waitForXPath("//span[contains(text(),'Agregar fotos')]");
            // const element = await waitForSelectors([['aria/Agregar fotos[role="button"]']], targetPage, { timeout, visible: true });
            // console.log("element", element);
            const [fileChooser] = await Promise.all([
              targetPage.waitForFileChooser(),
              element.click()
            ]);
            await fileChooser.accept(ctx.image);
            console.log("FOTO CARGADA", ctx.image);
        }

        Log('STEP:', 39);

        {
            const targetPage = page;
            // let element = "";
            // targetPage.querySelector("span").forEach(elem => {
            //   if (elem.textContent.includes("Seguiente")) {
            //     element = elem;
            //   }
            // });
            // const element = await waitForSelectors([["//span[contains(text(),'Siguiente')]"]], targetPage, { timeout, visible: true });
            await page.waitForXPath("//span[contains(text(),'Siguiente')]");
            const element = await waitForSelectors([['aria/Siguiente[role="button"]']], targetPage, { timeout, visible: true });
            // console.log("element:", element);
            // const element = await waitForSelectors([[".s1i5eluu.qypqp5cg"]], targetPage, { timeout, visible: true });
            console.log("VEHICULO REVISADO");
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 66.421875, y: 7} });
        }

        Log('STEP:', 40);

        {
            await delay(5000);

            //:not([disabled])
            const targetPage = page;
            await page.waitForXPath("//span[contains(text(),'Publicar')]");

            const element = await waitForSelectors([['aria/Publicar[role="button"]']], targetPage, { timeout, visible: true });
            console.log("INVENTARIO PUBLICADO");
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 31.515625, y: 13} });

            await delay(5000);
            page.waitForXPath(`//span[contains(text(),'${ctx.identificador}')]`).then((resSelector) => {
              console.log('Encontró el identificador FB 1:', ctx.identificador);
              browser.close();
              resolve({success: true, message: "Archivo publicado exitosamente FB. 1", result: null});
            }).catch((errSelector) => {
              console.log('No encontró el identificador FB 1:', ctx.identificador, errSelector);
              reject({success: false, message: "Archivo no pudo ser publicado. FB 1", result: errSelector});
            });
        }
      } catch (error) {
        console.log('No encontró el identificador FB 2:', ctx.identificador, error);
        reject({success: false, message: "Archivo no pudo ser publicado. FB 2", result: error});
      } 
    })();

  });

  return promise;
}

exports.marketplacelogin = function(ctx) {
  var promise = new Promise(function(resolve, reject) {
    (async () => {

      let browsercatch = null;

      try {
        console.log('PROCESO marketplace INICIADO');
        console.log('ctx:', ctx);

        // ctx.identificador = ctx?.year.concat(' ').concat(ctx?.brand).concat(' ').concat(ctx?.model);

        let omLaunchOptions = {};

        if (ctx.show){
          omLaunchOptions = {
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          }
        }

        Log('STEP:', 1);

        const browser = await puppeteer.launch(omLaunchOptions);
        browsercatch = browser;
        const page = await browser.newPage();
        const timeout = 20000;
        page.setDefaultTimeout(timeout);

        Log('STEP:', 2);

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

        Log('STEP:', 3);

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

        Log('STEP:', 4);

        async function waitForConnected(element, timeout) {
          await waitForFunction(async () => {
            return await element.getProperty('isConnected');
          }, timeout);
        }

        Log('STEP:', 5);

        async function waitForInViewport(element, timeout) {
          await waitForFunction(async () => {
            return await element.isIntersectingViewport({threshold: 0});
          }, timeout);
        }

        Log('STEP:', 6);

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

        Log('STEP:', 7);


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

        Log('STEP:', 8);

        async function querySelectorsAll(selectors, frame) {
          for (const selector of selectors) {
            const result = await querySelectorAll(selector, frame);
            if (result.length) {
              return result;
            }
          }
          return [];
        }

        Log('STEP:', 9);

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

        Log('STEP:', 10);

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

        Log('STEP:', 11);

        {
            const targetPage = page;
            await targetPage.setViewport({"width":1600,"height":600})
        }

        Log('STEP:', 12);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            await targetPage.goto("https://www.facebook.com/login/?next=%2Fmarketplace%2F");
            await Promise.all(promises);
        }

        Log('STEP:', 13);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Email or phone number"],["#email"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 223.5, y: 38.9296875} });
        }

        Log('STEP:', 14);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Email or phone number"],["#email"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conFBUsuario);
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conFBUsuario);
            }
        }

        Log('STEP:', 15);

        {
            const targetPage = page;
            await targetPage.keyboard.down("Tab");
        }

        Log('STEP:', 16);

        {
            const targetPage = page;
            await targetPage.keyboard.up("Tab");
        }

        Log('STEP:', 17);

        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Password"],["#pass"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conFBContrasena);
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conFBContrasena);
            }
        }

        Log('STEP:', 18);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            const element = await waitForSelectors([["aria/Log In[role=\"button\"]"],["#loginbutton"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 189.8599853515625, y: 21.449676513671875} });
            await Promise.all(promises);
        }

        Log('STEP:', 19);

        {
            const targetPage = page;
            const element = await waitForSelectors([["a[role='link']"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 62.796875, y: 8} });
        }

        Log('STEP:', 20);

        {
          console.log('Login realizado  exitosamente. FB 4');
          browser.close();
          resolve({success: true, message: "Login realizado exitosamente.", result: null});
        }
      } catch (error) {
          browsercatch.close();
          console.log('No encontró el identificador de login. FB 4', error);
          reject({success: false, message: "Login no pudo ser realizado.", result: error});
      } 
    })();
  });

  return promise;
}

exports.instagram = function(ctx) {
  var promise = new Promise(function(resolve, reject) {

    (async () => {
      try {
        console.log('PROCESO instagram INICIADO');
        console.log('ctx:', ctx);

        let omLaunchOptions = {};

        if (ctx.show){
          omLaunchOptions = {
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          }
        }

        const browser = await puppeteer.launch(omLaunchOptions);
        const page = await browser.newPage();
        Log('STEP:', 1);
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
        Log('STEP:', 5);

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
        Log('STEP:', 6);

        async function waitForConnected(element, timeout) {
          await waitForFunction(async () => {
            return await element.getProperty('isConnected');
          }, timeout);
        }
        Log('STEP:', 7);

        async function waitForInViewport(element, timeout) {
          await waitForFunction(async () => {
            return await element.isIntersectingViewport({threshold: 0});
          }, timeout);
        }
        Log('STEP:', 8);

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
        Log('STEP:', 9);

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
        Log('STEP:', 10);

        async function querySelectorsAll(selectors, frame) {
          for (const selector of selectors) {
            const result = await querySelectorAll(selector, frame);
            if (result.length) {
              return result;
            }
          }
          return [];
        }
        Log('STEP:', 11);

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
        Log('STEP:', 12);

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
        Log('STEP:', 13);

        {
            const targetPage = page;
            await targetPage.setViewport({"width":1000,"height":700})
        }
        Log('STEP:', 14);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            await targetPage.goto("https://www.instagram.com/");
            await Promise.all(promises);
        }
        Log('STEP:', 15);

        {
            const targetPage = page;
            const element = await waitForSelectors([['input[name="username"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 108.84375, y: 18.9375} });
        }
        Log('STEP:', 16);

        {
            const targetPage = page;
            const element = await waitForSelectors([['input[name="username"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conIGUsuario, { delay: 10 }); //"bitubi.do"
              console.log('Entrada usuario 1');
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conIGUsuario); //"bitubi.do"
              console.log('Entrada usuario 2');
            }
        }
        Log('STEP:', 17);

        {
            const targetPage = page;
            await targetPage.keyboard.down("Tab");
        }
        Log('STEP:', 18);

        {
            const targetPage = page;
            await targetPage.keyboard.up("Tab");
        }
        Log('STEP:', 19);

        {
            const targetPage = page;
            const element = await waitForSelectors([['input[name="password"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conIGContrasena, { delay: 20 }); //"btb@$!#2423OM"
              console.log('Entrada contraseña 1');

            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conIGContrasena); //"btb@$!#2423OM"
              console.log('Entrada contraseña 2');
            }
        }
        Log('STEP:', 20);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            // const element = await waitForSelectors([['button[type="submit"]']], targetPage, { timeout, visible: true });
            const element = await waitForSelectors([["aria/Log In","aria/[role=\"generic\"]"],["#loginForm > div > div:nth-child(3) > button > div"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 124.84375, y: 12.9375} });
            await Promise.all(promises);
            console.log('Click Botón Login');
        }
        Log('STEP:', 21);
        {
          await page.waitForXPath("//button[contains(text(),'Not Now')]");
          let next = await page.$x("//button[contains(text(),'Not Now')]");
          await next[0].click();
        }
        Log('STEP:', 22);

        if (ctx.show) {
          {
            await page.waitForXPath("//button[contains(text(),'Not Now')]");
            let next = await page.$x("//button[contains(text(),'Not Now')]");
            await next[0].click();
          }
        }
        Log('STEP:', 23);

        {
          const targetPage = page;
          const element = await waitForSelectors([["aria/New post"],["button._abl-._abm2"]], targetPage, { timeout, visible: true });
          await scrollIntoViewIfNeeded(element, timeout);
          await element.click({ offset: { x: 14.5, y: 14} });
        }
        Log('STEP:', 24);
        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Select from computer"],["button._acan._acap._acas"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            // await element.click({ offset: { x: 86.25, y: 16.5} });
        }
        Log('STEP:', 25);
        {
          const targetPage = page;
          // const filepath = ctx.image;
          // await element.uploadFile(filepath);
          // let fileInputs = await targetPage.$$('input[type="file"]');
          // let input = fileInputs[fileInputs.length - 1];
          // console.log("fileInputs:", fileInputs);
          // console.log("input:", input);
          // await input.uploadFile(filepath);
          
          const element = await waitForSelectors([["aria/Select from computer"],["button._acan._acap._acas"]], targetPage, { timeout, visible: true });
          const [fileChooser] = await Promise.all([
            targetPage.waitForFileChooser(),
            element.click()
          ]);
          await fileChooser.accept(ctx.image);

          console.log("FOTO CARGADA NUEVA", ctx.image);
        }
        Log('STEP:', 26);
        {
          await page.waitForXPath("//button[contains(text(),'Next')]");
          let next = await page.$x("//button[contains(text(),'Next')]");
          await next[0].click();
          await delay(1000);
        }
        Log('STEP:', 27);
        {
          await page.waitForXPath("//button[contains(text(),'Next')]");
          let next = await page.$x("//button[contains(text(),'Next')]");
          await next[0].click();
          console.debug('clicking next');
        }
        Log('STEP:', 28);
        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Write a caption..."],["#mount_0_0_P5 > div > div:nth-child(1) > div > div:nth-child(4) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div > div > div > div > div > div._ac2r._ac2s > div._ac2v > div > div > div > div:nth-child(2) > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p > textarea"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 135.5, y: 13} });
        }
        Log('STEP:', 29);
        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Write a caption..."],["#mount_0_0_P5 > div > div:nth-child(1) > div > div:nth-child(4) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div > div > div > div > div > div._ac2r._ac2s > div._ac2v > div > div > div > div:nth-child(2) > div._ab8w._ab94._ab99._ab9f._ab9m._ab9p > textarea"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.caption);
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.caption);
            }
        }
        Log('STEP:', 30);
        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Add location[role=\"textbox\"]"],['input[name="creation-location-input"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 136.5, y: 31} });
        }
        Log('STEP:', 31);
        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Add location[role=\"textbox\"]"],['input[name="creation-location-input"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.location);
              await delay(2000);
              await element.click({ offset: { x: 50, y: 120} });
              await delay(2000);
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.location);
              await delay(2000);
              await element.click({ offset: { x: 50, y: 120} });
              await delay(2000);
            }
        }
        Log('STEP:', 32);
        await delay(3000);
        Log('STEP:', 33);
        {
            const targetPage = page;
            const element = await waitForSelectors([["aria/Share"],['button[type="button"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            // await element.click({ offset: { x: 19.578125, y: 12} });
        }
        Log('STEP:', 34);
        {
          await page.waitForXPath("//button[contains(text(),'Share')]");
          let next = await page.$x("//button[contains(text(),'Share')]");
          await next[0].click();
        }
        // {
        //   await page.waitForXPath("//div[contains(text(),'Post shared')]");
        //   await delay(2000);
        // }
        // await browser.close();
        Log('STEP:', 35);

        page.waitForXPath("//div[contains(text(),'Post shared')]").then((resSelector) => {
          console.log('Encontró el identificador de publicación. IG 1');
          browser.close();
          resolve({success: true, message: "Archivo publicado exitosamente. IG 1", result: null});
        }).catch((errSelector) => {
          console.log('No encontró el identificador de publicación. IG 1', errSelector);
          reject({success: false, message: "Archivo no pudo ser publicado. IG 1", result: errSelector});
        });
      } catch (error) {
          console.log('No encontró el identificador de publicación. IG 2', error);
          reject({success: false, message: "Archivo no pudo ser publicado. IG 2", result: error});
      } 
    })();
  });

  return promise;
}

exports.instagramlogin = function(ctx) {
  var promise = new Promise(function(resolve, reject) {

    (async () => {
      let browsercatch = null;

      try {
        console.log('PROCESO instagram INICIADO');
        console.log('ctx:', ctx);

        let omLaunchOptions = {};

        if (ctx.show){
          omLaunchOptions = {
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          }
        }

        const browser = await puppeteer.launch(omLaunchOptions);
        browsercatch = browser;
        const page = await browser.newPage();
        Log('STEP:', 1);
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
        Log('STEP:', 5);

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
        Log('STEP:', 6);

        async function waitForConnected(element, timeout) {
          await waitForFunction(async () => {
            return await element.getProperty('isConnected');
          }, timeout);
        }
        Log('STEP:', 7);

        async function waitForInViewport(element, timeout) {
          await waitForFunction(async () => {
            return await element.isIntersectingViewport({threshold: 0});
          }, timeout);
        }
        Log('STEP:', 8);

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
        Log('STEP:', 9);

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
        Log('STEP:', 10);

        async function querySelectorsAll(selectors, frame) {
          for (const selector of selectors) {
            const result = await querySelectorAll(selector, frame);
            if (result.length) {
              return result;
            }
          }
          return [];
        }
        Log('STEP:', 11);

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
        Log('STEP:', 12);

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
        Log('STEP:', 13);

        {
            const targetPage = page;
            await targetPage.setViewport({"width":1000,"height":700})
        }
        Log('STEP:', 14);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            await targetPage.goto("https://www.instagram.com/");
            await Promise.all(promises);
        }
        Log('STEP:', 15);

        {
            const targetPage = page;
            const element = await waitForSelectors([['input[name="username"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 108.84375, y: 18.9375} });
        }
        Log('STEP:', 16);

        {
            const targetPage = page;
            const element = await waitForSelectors([['input[name="username"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conIGUsuario, { delay: 10 }); //"bitubi.do"
              console.log('Entrada usuario 1');
            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conIGUsuario); //"bitubi.do"
              console.log('Entrada usuario 2');
            }
        }
        Log('STEP:', 17);

        {
            const targetPage = page;
            await targetPage.keyboard.down("Tab");
        }
        Log('STEP:', 18);

        {
            const targetPage = page;
            await targetPage.keyboard.up("Tab");
        }
        Log('STEP:', 19);

        {
            const targetPage = page;
            const element = await waitForSelectors([['input[name="password"]']], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            const type = await element.evaluate(el => el.type);
            if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
              await element.type(ctx.conIGContrasena, { delay: 20 }); //"btb@$!#2423OM"
              console.log('Entrada contraseña 1');

            } else {
              await element.focus();
              await element.evaluate((el, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
              }, ctx.conIGContrasena); //"btb@$!#2423OM"
              console.log('Entrada contraseña 2');
            }
        }
        Log('STEP:', 20);

        {
            const targetPage = page;
            const promises = [];
            promises.push(targetPage.waitForNavigation());
            // const element = await waitForSelectors([['button[type="submit"]']], targetPage, { timeout, visible: true });
            const element = await waitForSelectors([["aria/Log In","aria/[role=\"generic\"]"],["#loginForm > div > div:nth-child(3) > button > div"]], targetPage, { timeout, visible: true });
            await scrollIntoViewIfNeeded(element, timeout);
            await element.click({ offset: { x: 124.84375, y: 12.9375} });
            await Promise.all(promises);
            console.log('Click Botón Login');
        }
        Log('STEP:', 21);

        {
          await page.waitForXPath("//button[contains(text(),'Not Now')]");
          let next = await page.$x("//button[contains(text(),'Not Now')]");
          await next[0].click();
        }

        console.log('Login realizado  exitosamente. IG 3');
        browser.close();
        resolve({success: true, message: "Login realizado  exitosamente. IG 3", result: null});
      } catch (error) {
          browsercatch.close();
          console.log('No encontró el identificador de login. IG 3', error);
          reject({success: false, message: "Login no pudo ser realizado. IG 3", result: error});
      } 
    })();
  });

  return promise;
}

const screenshot = async (page, file) => {
  await page.screenshot({path: file});
}

const Log = async (label, value) => {
  console.log(label, value);
}

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

exports.download = function (ctx) {
  let downPath = resolve('./public/uploads') + '/' + new Date().getMilliseconds();
  // let downPath = '/Users/omarmojica/Proyectos/documi/backend/public/uploads/' + new Date().getMilliseconds();
  // let downPath = '/home/ec2-user/doccumi/backend/public/uploads/' + new Date().getMilliseconds();
  console.log('download() || downPath:', downPath);
  let ext = path.extname(ctx.url);
  let fileName = downPath.concat(ext);
  console.log('download() || fileName:', fileName);
  var file = fs.createWriteStream(fileName);
  http.get(ctx.url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(ctx.cb({"id": ctx.id, "to": ctx.to, "res": ctx.res, "file": fileName}));  // close() is async, call cb after close completes.
      // ctx.cb({"id": ctx.id, "file": fileName});
    });
  }).on('error', (err) => { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    console.log('err.message:', err.message);
  });
};
