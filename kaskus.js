const puppeteer = require('puppeteer');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


const initBrowser = async () =>{
  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null
  });
  return browser;
};

const initNewPage = async (browser) =>{
  const page = await browser.newPage();
  return page;
}

const login = async (page,email,password) =>{
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://www.kaskus.co.id/');
  await page.waitForTimeout(2000);
  await page.waitForSelector('[data-modal="jsModalSignin"]');
  await page.click('[data-modal="jsModalSignin"]');
  await page.waitForSelector('#username');
  await page.type('#username', email,{delay:10});
  await page.waitForSelector('#password');
  await page.type('#password', password,{delay:10});
  await page.click('[value="Masuk"]');
  await page.waitForTimeout(2000);
}

const inputIklan = async (page,browser,img,judul,desc,harga,caption,tag) =>{
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://fjb.kaskus.co.id/sell');
  await page.waitForTimeout(1000);
  await page.waitForSelector('#maincategory');
  await page.select('#maincategory','202');
  await page.waitForTimeout(1000);
  await page.waitForSelector('#subcategory-0');
  await page.select('#subcategory-0','885');
  await page.waitForTimeout(1000);
  await page.waitForSelector('#title');
  await page.type('#title', judul);
  await page.waitForTimeout(500);
  await page.waitForSelector('#formatted_price');
  await page.type('#formatted_price', harga);
  await page.waitForTimeout(500);
  await page.waitForSelector('#location');
  await page.select('#location','11');
  await page.waitForTimeout(1500);
  await page.waitForSelector('#fjb-description-editor');
  await page.type('#fjb-description-editor', desc + caption);
  await page.waitForTimeout(2000);
  await page.waitForSelector('#upload-image-1');
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('#upload-image-1')
  ]);
  await fileChooser.accept(['./kaskus/img/'+img]).then(() => {}).catch(async(err) => {
    console.log('Gambar harus .jpg atau Gambar tidak tersedia. Silahkan cek kembali!');
    await browser.close();
  });
  await page.waitForTimeout(500);
  await page.waitForSelector('#tag');
  await page.type('#tag', tag);
  // await page.waitForTimeout(1000);
  // await page.waitForSelector('#button-submit');
  // await page.click('#button-submit');
  // await page.waitForTimeout(1000);
  // await page.waitForSelector('#sundul_message');
  // await page.click('#sundul_message');
  await page.waitForNavigation();
  await page.waitForTimeout(3000);
  const content = await page.evaluate(() => location.href) + "\n";
  fs.appendFile(__dirname +'/kaskus/hasil.txt', content, err => {
    if (err) {
      console.error(err);
      return
    }
  });
}

const liner = new lineByLine(__dirname + '/kaskus/dataBlasting.txt');
const lineDesc = new lineByLine(__dirname + '/kaskus/caption.txt');

(async () => {
    let line;
    let descResult;
    let caption ="";
    let email ="";
    let password ="";

    const browser = await initBrowser();
    const page = await initNewPage(browser);

    while (descResult = lineDesc.next()) {
        caption += descResult.toString();
    }
    console.log('Auto Upload Kaskus by YudaRmd');
    readline.question('Email : ', inputEmail => {
      email += inputEmail;
        readline.question('Password : ', inputPassword => {
          password += inputPassword;
          readline.close();
        });
    });

    readline.on("close", async() => {
      await login(page,email,password).then(() => {
        console.log('login berhasil ke akun '+email);
      }).catch(async(err) => {
        console.log('login gagal');
        // await browser.close();
      });

      while (line = liner.next()) {
        const lineString = line.toString();
        const data = lineString.split('|');
        const img = data[0];
        const judul = data[1];
        const desc = data[2];
        const harga = data[3];
        const tag = data[4];
        await inputIklan(page,browser,img,judul,desc,harga,caption,tag);
        console.log('Iklan berhasil di upload: '+judul);
      }

      await browser.close();
    });
})();