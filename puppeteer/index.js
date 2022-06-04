const puppeteer = require('puppeteer');
const CRED = require('./creds.rem');

const sleep = async (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, ms)
  });
}

const ID = {
  login: '#email',
  pass: '#pass'
};

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  let login = async () => {
    // login
    await page.goto('https://facebook.com/marketplace', {
      waitUntil: 'networkidle2'
    });
    await page.waitForSelector(ID.login);
    console.log(CRED.user);
    console.log(ID.login);
    await page.type(ID.login, CRED.user);

    await page.type(ID.pass, CRED.pass);
    await sleep(1000);

    await page.click("button[name='login']")

    console.log("login done");

    await page.click("button[name='login']")
    await page.waitForNavigation();
  }
  await login();
  await page.screenshot({
    path: 'facebook3.png'
  });
})();
