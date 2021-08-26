// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const readlineSync = require('readline-sync');
const figlet = require('figlet');


const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await await puppeteer.launch({
        headless: false,
        defaultViewport: null
      });
    const page = await browser.newPage();
    const $options = {waitUntil:'networkidle2'};

    console.log(figlet.textSync('Pingler Website', {horizontalLayout: 'fitted'}));
    console.log('                                                        by YudaRmd\n');

    var title = readlineSync.question('Judul Website : ');
    var link = readlineSync.question('Url Website : ');
    
    // await smallSeo(page,$options,link);
    await myPageRank(page,$options,link);

    // await browser.close();
})();

const myPageRank = async(page,$options,link,title) =>{
    await page.setDefaultNavigationTimeout(0); 
    await page.goto("http://mypagerank.net/service_pingservice_index/",$options);

    await page.waitForSelector('#myforms > input[type=text]:nth-child(2)');
    const clickTitle = await page.$('#myforms > input[type=text]:nth-child(2)');
      await clickTitle.click();
      await clickTitle.dispose();

    await page.keyboard.type(title);

    await page.waitForSelector('#myforms > input[type=text]:nth-child(5)');
    const clickLink = await page.$('#myforms > input[type=text]:nth-child(5)');
      await clickLink.type(link);
      await clickLink.dispose();
    
    await page.keyboard.type(link);
    
    await page.waitForTimeout(2000);
    await page.waitForSelector('#list');
    const select = await page.$('#list');
      await select.click();
      await select.dispose();
    
    await page.waitForTimeout(2000);
    await page.waitForSelector('#b1');
    const submit = await page.$('#b1');
      await submit.click();
      await submit.dispose();
}

const smallSeo = async(page,$options,link) =>{
    await page.setDefaultNavigationTimeout(0); 
    await page.goto("https://smallseotools.com/online-ping-website-tool/",$options);

    await page.waitForTimeout(5000);
    await page.goto("https://smallseotools.com/online-ping-website-tool/",$options);
    
    await page.waitForTimeout(5000);
    await page.waitForSelector('#links');
    const inputLink = await page.$('#links');
      await inputLink.type(link);
      await inputLink.dispose();
    
    await page.waitForTimeout(5000);
    await page.waitForSelector('#ping_submition > div.button_box > button');
    const submit = await page.$('#ping_submition > div.button_box > button');
      await submit.click();
      await submit.dispose();
}