const puppeteer = require('puppeteer');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');

const cookiesFilePath = __dirname+'/kaskus/cookies.json';
const cookiesString = fs.readFileSync(cookiesFilePath);

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  var email = null;
  var password = null;
  const $options = {waitUntil:'networkidle2'};

  await page.setViewport({"width": 0,"height": 0});

  console.log(figlet.textSync('Tools Kaskus', {horizontalLayout: 'fitted'}));
  console.log('                                                            by YudaRmd\n');

  await login(page,$options,email,password).then(() => {console.log("Login Berhasil")}).catch(async(err) => {
    console.log('Login Gagal');
  });

  total = readlineSync.question('Jumlah Pengaktifan : ');

  for (let i = 0; i < total; i++) {
     await relistProduct(page,$options);
     console.log("Baris ke "+i+" Sudah Aktif");
  }
  await browser.close();

})();

const login = async(page,$options,email,password) =>{
  if (cookiesString.length == 0) {
    console.log('Login Ke kaskus');
    email = readlineSync.question('Email : ');
    password = readlineSync.question('Password : ', {
      hideEchoBack: true
    });

    await inputLogin(page,$options,email,password);
  }else{
    var gantiAkun = readlineSync.question('Anda Sudah Login. Apakah Anda ingin Ganti Akun (Y/N) : ');

    if (gantiAkun == "Y" || gantiAkun == "y") {
      email = readlineSync.question('Email : ');
      password = readlineSync.question('Password : ', {
        hideEchoBack: true
      });
      await inputLogin(page,$options,email,password);
    }else{
      const parsedCookies = JSON.parse(cookiesString);
      if (parsedCookies.length !== 0) {
          for (let cookie of parsedCookies) {
            await page.setCookie(cookie);
        }
      }
    }
  }
}

const inputLogin = async(page,$options,email,password) =>{
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://www.kaskus.co.id/',$options);
  await page.waitForSelector('[data-modal="jsModalSignin"]');
  await page.click('[data-modal="jsModalSignin"]');
  await page.waitForSelector('#username');
  await page.type('#username', email,{delay:10});
  await page.waitForSelector('#password');
  await page.type('#password', password,{delay:10});
  await page.click('[value="Masuk"]');

  await page.waitForTimeout(3000);
  const cookiesObject = await page.cookies();

  fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
  function(err) { 
      if (err) {
      console.log('The file could not be written.', err)
      }
      // console.log('Session has been successfully saved')
  });
}

const relistProduct = async (page,$options) =>{
    await page.setDefaultNavigationTimeout(0); 
    await page.goto('https://fjb.kaskus.co.id/selling/ended',$options);

    await page.waitForSelector('#main > div > div.listing-wrapper > div > div > div.user-home.fjb.clearfix > div.col-xs-10.bar0 > div > div.block__box__container > div:nth-child(2) > div > div > div.pull-right > div > ul > li > a');
    const clickAktif = await page.$('#main > div > div.listing-wrapper > div > div > div.user-home.fjb.clearfix > div.col-xs-10.bar0 > div > div.block__box__container > div:nth-child(2) > div > div > div.pull-right > div > ul > li > a');
        await clickAktif.click();
        await clickAktif.dispose();

    await page.waitForTimeout(1000);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await page.waitForNavigation();
    
    // await page.waitForSelector('#form-sold-out > div.modal-footer > a.btn.btn-green > i');
    // const clickRelist = await page.$('#form-sold-out > div.modal-footer > a.btn.btn-green > i');
    //     await clickRelist.click();
    //     await clickRelist.dispose();
}