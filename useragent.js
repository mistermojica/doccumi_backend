
const puppeteer = require('puppeteer');

async function scrape() {
   const browser = await puppeteer.launch({});
   const page = await browser.newPage();

   await page.goto('https://www.facebook.com/marketplace/create/vehicle', { waitUntil: 'networkidle0' });
  //  for(i = 1; i < 6; i++){
    // var element = await page.waitForSelector("").outerHTML;
   const data = await page.evaluate(() => document.querySelector('*').outerHTML);
   // var element = await page.waitForSelector("#meanings > div.css-ixatld.e15rdun50 > ul > li:nth-child(" + i + ") > a");
    // var text = await page.evaluate(element => element.textContent, element);
    console.log(data);
  //  }
   browser.close();
}
scrape();

// =====================

// var webPage = require('webpage');
// var page = webPage.create();

// console.log('The default user agent is ' + page.settings.userAgent);
// page.settings.userAgent = 'SpecialAgent';
// page.open('http://www.httpuseragent.org', function(status) {
//   if (status !== 'success') {
//     console.log('Unable to access network');
//   } else {
//     var ua = page.evaluate(function() {
//       return document.getElementById('qua').textContent;
//     });
//     console.log(ua);
//   }
//   phantom.exit();
// });