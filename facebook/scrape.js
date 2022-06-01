const puppeteer = require('puppeteer')
var fs = require('fs')

var arrayOfItems;

// update with your location reference from step 4
let locationRef = 'sydney'

// list of terms you want to search for
let searchTerms = ['surfboard', 'pokemon cards']


async function getItems(){
  // open JSON file of past items
  fs.readFile('./pastItems.json', 'utf-8', function(err, data) {
	arrayOfItems = JSON.parse(data);
  })
  // setting up puppeteer
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // loop through terms you want to search
  for (var i=0;i<searchTerms.length;i++){
  	// create an empty list where we will store item objects
  	var newItems = [];
  	// format any spaces in the search term before inclusion in the search URL
  	var searchTerm = searchTerms[i].replace(/ /g,'%20');
  	console.log(`\nResults for ${searchTerms[i]}:\n`)
  	// direct puppeteer to search URL
  	// the url includes a parameter to only show items listed in the last day
  	await page.goto(`https://www.facebook.com/marketplace/${locationRef}/search/?daysSinceListed=1&sortBy=best_match&query=${searchTerm}&exact=false`)
  	// evaluate the entire page HTML including script tags
  	let bodyHTML = await page.evaluate(() => document.body.outerHTML);
  	// take out the search results and parse it as JSON
  	let searchResult = JSON.parse(bodyHTML.split(/(?:"marketplace_search":|,"marketplace_seo_page")+/)[2]);
  	let items = searchResult["feed_units"]["edges"]
    // check if there are any search results
  	// loop through each item and create an item object with attributes
    if (items.length > 1){
    	items.forEach((val, index)=>{
    	  var ID = val['node']['listing']['id'];
    	  var link = `https://www.facebook.com/marketplace/item/${val['node']['listing']['id']}`;
    	  var title = val['node']['listing']['marketplace_listing_title'];
    	  var price = val['node']['listing']['listing_price']['formatted_amount'];

    	  var item = {title: title, price: price, link: link}
    	  // check if item exists in JSON file of pastItems
    	  if (arrayOfItems.pastItems.includes(ID)){
    	  } else {
    	  	arrayOfItems.pastItems.push(ID)
    	  	newItems.push(item);  
    	  	console.log(item)
    	  }
    	});
    }

  };
  await browser.close()
  fs.writeFile('./pastItems.json', JSON.stringify(arrayOfItems), 'utf-8', function(err) {
		if (err) throw err
		console.log('Updated past items')
	})
}

getItems()