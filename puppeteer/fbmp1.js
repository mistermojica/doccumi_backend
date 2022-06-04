const puppeteer = require('puppeteer'); // v13.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
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
        await targetPage.setViewport({"width":1443,"height":1141})
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto("https://www.facebook.com/marketplace/?ref=app_tab");
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.hlyrhctz > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.bi6gxh9e.aahdfvyu > div > div > div.bi6gxh9e.aov4n071.dhix69tm.wkznzc2l > a > div > div.bp9cbjyn.j83agx80.taijpn5t.c4xchbtz.by2jbhx6.a0jftqn4 > div:nth-child(2) > span > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 73.796875, y: 11} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.cbu4d94t.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.g5gj957u.j83agx80.dp1hu0rb > div > div > div.il6165gk.k4urcfbm.aov4n071.lhclo0ds.btwxx1t3.j83agx80.o8rfisnq > div:nth-child(2) > div > span > div > a > div.j83agx80.l9j0dhe7.k4urcfbm.buofh1pr > div > div > div.q9uorilb.l9j0dhe7.pzggbiyp.du4w35lb > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 28.5, y: 17.7890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(3) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 8, y: 10.046875} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#jsc_c_47__0 > div.bp9cbjyn.j83agx80.btwxx1t3.buofh1pr.i1fnvgqd.hpfvmrgz"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 161, y: 6} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(8) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 5, y: 9.078125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(8) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 10, y: 8.078125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/2017"],["#jsc_c_4g__6"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 83, y: 6.046875} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Marca[role=\"textbox\"]"],["#jsc_c_4k"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 295, y: 21.7890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Marca[role=\"textbox\"]"],["#jsc_c_4k"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("Daihatsu");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "Daihatsu");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Modelo[role=\"textbox\"]"],["#jsc_c_4m"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 240, y: 18.7890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Modelo[role=\"textbox\"]"],["#jsc_c_4m"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("Charade");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "Charade");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Kilometraje[role=\"textbox\"]"],["#jsc_c_4t"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 156, y: 26.7890625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Kilometraje[role=\"textbox\"]"],["#jsc_c_4t"]], targetPage, { timeout, visible: true });
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
        const element = await waitForSelectors([["aria/Precio[role=\"textbox\"]"],["#jsc_c_4o"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 133, y: 34.8125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Precio[role=\"textbox\"]"],["#jsc_c_4o"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("RD$ 333.333");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "RD$ 333.333");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(15) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 5, y: 4.1171875} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#jsc_c_4v__3 > div.bp9cbjyn.j83agx80.btwxx1t3.buofh1pr.i1fnvgqd.hpfvmrgz > div > div > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 43, y: 6.0234375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/El título del vehículo no presenta inconvenientes."],["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(17) > div > label > div > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 11, y: 13.3515625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(18) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 12, y: 8.1484375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#jsc_c_4z__1 > div.bp9cbjyn.j83agx80.btwxx1t3.buofh1pr.i1fnvgqd.hpfvmrgz > div > div > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 77, y: 1.0078125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(19) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 7, y: 4.1484375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#jsc_c_53__2 > div.bp9cbjyn.j83agx80.btwxx1t3.buofh1pr.i1fnvgqd.hpfvmrgz > div > div > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 38, y: 12.015625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div:nth-child(20) > div > div > label > div > div.j83agx80 > div > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 11, y: 10.1484375} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#jsc_c_57__1 > div.bp9cbjyn.j83agx80.btwxx1t3.buofh1pr.i1fnvgqd.hpfvmrgz > div.j83agx80.cbu4d94t.ew0dbk1b.irj2b8pg > div > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 129, y: 9.71875} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Descripción[role=\"textbox\"]"],["#jsc_c_4q"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 201, y: 47.8828125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/Descripción[role=\"textbox\"]"],["#jsc_c_4q"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("Excelente vehiculo.");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "Excelente vehiculo.");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div.aahdfvyu.hv4rvrfc.dati1w0a > div.bi6gxh9e.aov4n071.l9j0dhe7 > div > div > div > div > div > div:nth-child(2) > div > div:nth-child(1) > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 86.84375, y: 10.7578125} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.du4w35lb.q5bimw55.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.d8ncny3e.buofh1pr.g5gj957u.tgvbjcpo.l56l04vs.r57mb794.kh7kg01d.eg9m0zos.c3g1iek1.l9j0dhe7.k4xni2cv > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div.aov4n071.j83agx80.cbu4d94t.buofh1pr > div > div > div.aahdfvyu.hv4rvrfc.dati1w0a > label:nth-child(2) > input"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type("C:\\fakepath\\Screen Shot 2022-05-27 at 2.20.41 PM.png");
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, "C:\\fakepath\\Screen Shot 2022-05-27 at 2.20.41 PM.png");
        }
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi.taijpn5t.pfnyh3mw.j83agx80.l6v480f0.bp9cbjyn > div > div > div > div > div.bp9cbjyn.j83agx80.taijpn5t.c4xchbtz.by2jbhx6.a0jftqn4 > div > span > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 58.421875, y: 7} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#mount_0_0_1j > div:nth-child(2) > div:nth-child(1) > div > div:nth-child(7) > div > div:nth-child(2) > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.j83agx80.cbu4d94t.h3gjbzrl.l9j0dhe7.du4w35lb.qsy8amke > div.rq0escxv.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.j83agx80.buofh1pr.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.j83agx80.cbu4d94t.d2edcug0.hpfvmrgz.pfnyh3mw.dp1hu0rb.rek2kq2y.o36gj0jk.tkr6xdv7.ldhj9swq > div > div.dati1w0a.ihqw7lf3.hv4rvrfc.discj3wi.taijpn5t.pfnyh3mw.j83agx80.l6v480f0.bp9cbjyn > div:nth-child(2) > div > div > div.bp9cbjyn.j83agx80.taijpn5t.c4xchbtz.by2jbhx6.a0jftqn4 > div > span > span"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 36.515625, y: 8} });
    }

    await browser.close();
})();
