const puppeteer = require('puppeteer');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');

const cookiesFilePath = __dirname+'/pinterest/cookies.json';
const cookiesString = fs.readFileSync(cookiesFilePath);
(async () => {
    const browser = await await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });
    const page = await browser.newPage();
    var email = null;
    var password = null;
    var caption = '';
    var line;
    const $options = {waitUntil:'networkidle2'};
    const dataBlasting = new lineByLine(__dirname + '/pinterest/dataBlasting.txt');

    console.log(figlet.textSync('Tools Pinterest', {horizontalLayout: 'fitted'}));
    console.log('                                                                   by YudaRmd\n');

    await login(page,$options,email,password).then(() => {console.log("Login Berhasil")}).catch(async(err) => {
      console.log('Login Gagal');
    });

    const lineCaption = new lineByLine(__dirname + '/pinterest/caption.txt');

    while (captResult = lineCaption.next()) {
        caption += captResult.toString();
    }
    
    while (line = dataBlasting.next()) {
      const lineString = line.toString();
      const data = lineString.split('|');
      const img = data[0];
      const title = data[1];
      const desc = data[2];
      const link = data[3];
      const category = data[4];
      await uploadPin(page,$options,img,title,caption,desc,link,category).then(() => {
          return console.log('\x1b[32m%s\x1b[0m','Iklan Berhasil Diupload: '+title);
      })
      .catch((err) => {
          return console.log('\x1b[31m%s\x1b[0m','Iklan Gagal Diupload: '+title);
      })
      fs.appendFile(__dirname +'/pinterest/hasil.txt', "\n", err => {
        if (err) {
          console.error(err);
          return
        }
      });
    }

    await browser.close();
})();

const login = async(page,$options,email,password) =>{
  if (cookiesString.length == 0) {
    console.log('Login Ke Pinterest');
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
  await page.goto('https://id.pinterest.com/',$options);

  const buttonToLogin = await page.$('[data-test-id="simple-login-button"]');
      await buttonToLogin.click();
      await buttonToLogin.dispose();

  const emailField = await page.$('#email');
      await emailField.type(email);
      await emailField.dispose();
  
  const passwordField = await page.$('#password');
      await passwordField.type(password);
      await passwordField.dispose();

  const submitField = await page.$('button[type="submit"]');
      await submitField.click(password);
      await submitField.dispose();

  await page.waitForTimeout(5000);
  const cookiesObject = await page.cookies();

  fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
  function(err) { 
      if (err) {
      console.log('The file could not be written.', err)
      }
      // console.log('Session has been successfully saved')
  });
}

const uploadPin = async(page,$options,img,title,caption,desc,link,category) =>{
  await page.goto("https://id.pinterest.com/pin-builder/",$options);
    
    await page.waitForSelector('input[type="file"]');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('input[type="file"]')
    ]);
    
    await fileChooser.accept(['./pinterest/img/'+img]);
    
    await page.waitForTimeout(2000);
    await page.waitForSelector('#__PWS_ROOT__ > div.App.AppBase > div.appContent > div > div > div > div.XiG.gpV.ujU.zI7.iyn.Hsu > div.XbT.zI7.iyn.Hsu > div > div > div > div.Jea.hs0.zI7.iyn.Hsu > div > div > div > div > div > div:nth-child(2) > div > div.l7T.ujU.zI7.iyn.Hsu > div > div:nth-child(1) > div.CDp.xcv.L4E.zI7.iyn.Hsu > div > div > div.XiG.xcv.L4E.zI7.iyn.Hsu > textarea');
    const addTitle = await page.$('#__PWS_ROOT__ > div.App.AppBase > div.appContent > div > div > div > div.XiG.gpV.ujU.zI7.iyn.Hsu > div.XbT.zI7.iyn.Hsu > div > div > div > div.Jea.hs0.zI7.iyn.Hsu > div > div > div > div > div > div:nth-child(2) > div > div.l7T.ujU.zI7.iyn.Hsu > div > div:nth-child(1) > div.CDp.xcv.L4E.zI7.iyn.Hsu > div > div > div.XiG.xcv.L4E.zI7.iyn.Hsu > textarea');
    await addTitle.type(title,{delay:10});
    await addTitle.dispose();

    await page.keyboard.press('Tab');
    await page.keyboard.type(caption);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.keyboard.type(desc);
    await page.keyboard.press('Tab');
    await page.keyboard.type(link);

    await page.waitForSelector('button[data-test-id="board-dropdown-select-button"]');
    const chooseCategory = await page.$('button[data-test-id="board-dropdown-select-button"]');
    await chooseCategory.click();
    await chooseCategory.dispose();

    await page.waitForSelector('input#pickerSearchField');
    const searchCategory = await page.$('input#pickerSearchField');
    await searchCategory.type(category);
    await searchCategory.dispose();

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForSelector('button[data-test-id="board-dropdown-save-button"]');
    const btnSave = await page.$('button[data-test-id="board-dropdown-save-button"]');
    await btnSave.click();
    await btnSave.dispose();

    await page.waitForSelector('div[data-test-id="seeItNow"]');
    const btnSeeItNow = await page.$('div[data-test-id="seeItNow"]');
    await btnSeeItNow.click();
    await btnSeeItNow.dispose();

    await page.waitForTimeout(3000);
    const content = await page.evaluate(() => location.href);
    fs.appendFile(__dirname +'/pinterest/hasil.txt', content, err => {
      if (err) {
        console.error(err);
        return
      }
    });
}