// facebook.js
require("dotenv").config();

const puppeteer = require('puppeteer');
async function facebook() {
  const {env} = process;
  // import { env } from 'process';
  console.log(env.FUSER);
  console.log(env.FPASS);
  if (!env.FUSER || !env.FPASS) throw 'Set FUSER and FPASS environement variables';
  const browser = await puppeteer.launch();//
  const page = await browser.newPage();
  await page.goto('https://www.facebook.com/login/?next=%2Fmarketplace%2F');
  // wait for Facebook login form
  await page.waitForSelector('#email');
  // click Accept cookies button if it exist
  await page.evaluate(() => document.querySelector('button[type="Submit"]') && [...document.querySelectorAll('button[type="Submit"]')].at(-1).click());
  // fill in and submit the form
  await page.evaluate((val) => email.value = val, env.FUSER);
  await page.evaluate((val) => pass.value = val, env.FPASS);
  await page.evaluate(selector => document.querySelector(selector).click(), 'input[value="Log In"],#loginbutton');
  console.log("clicked submit button");
  // console.log("location.href BEFORE:", document.location.href);
  await page.waitForFunction(() => {
    console.log("location.href AFTER 1:", window.location.href);
    document.location.href.includes('https://www.facebook.com/marketplace');
    console.log("location.href AFTER 2:", window.location.href);
  }, { timeout: 100000 });
  console.log("in facebook marketplace");
  //print user id
  await page.waitForFunction(() => window?.branch?.g, { timeout: 100000 });
  const myId = await page.evaluate(() => window?.branch?.g);
  console.log("myId:", myId);
}

facebook();