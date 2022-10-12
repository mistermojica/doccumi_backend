const webdriver = require('selenium-webdriver');

async function runTestWithCaps (capabilities) {
  console.log({capabilities});

  let driver = await new webdriver.Builder().forBrowser('chrome').build();

  driver.get("https://login.yahoo.com/account/create");
  driver.findElement(webdriver.By.xpath("//input[@id='usernamereg-firstName']")).sendKeys("Your-Name"); // Will send values to First Name tab
  driver.findElement(webdriver.By.xpath("//input[@id='usernamereg-lastName']")).sendKeys("Your-Last_name"); //xpath for last name box
  driver.findElement(webdriver.By.xpath("//input[@id='usernamereg-yid']")).sendKeys("email@yahoo.com"); //xpath for email box
}

const capabilities1 = {
  'bstack:options' : {
      "os": "Windows",
      "osVersion": "11",
      "buildName" : "browserstack-build-1",
      "sessionName" : "Parallel test 1",
  },
  "browserName": "Chrome",
  "browserVersion": "103.0",
}

const capabilities2 = {
  'bstack:options' : {
      "os": "Windows",
      "osVersion": "10",
      "buildName" : "browserstack-build-1",
      "sessionName" : "Parallel test 2",
  },
  "browserName": "Firefox",
  "browserVersion": "102.0",
}

const capabilities3 = {
  'bstack:options' : {
      "os": "OS X",
      "osVersion": "Big Sur",
      "buildName" : "browserstack-build-1",
      "sessionName" : "Parallel test 3",
  },
  "browserName": "Safari",
  "browserVersion": "14.1",
}

runTestWithCaps(capabilities1);
// runTestWithCaps(capabilities2);
// runTestWithCaps(capabilities3);