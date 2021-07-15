const puppeteer = require('puppeteer');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');

const cookiesFilePath = __dirname+'/tumblr/cookies.json';
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
    const dataBlasting = new lineByLine(__dirname + '/tumblr/dataBlasting.txt');

    console.log(figlet.textSync('Tools Tumblr', {horizontalLayout: 'fitted'}));
    console.log('                                                             by YudaRmd\n');

    await login(page,$options,email,password);

    const lineCaption = new lineByLine(__dirname + '/tumblr/caption.txt');

    while (captResult = lineCaption.next()) {
        caption += captResult.toString();
    }
    while (line = dataBlasting.next()) {
      const lineString = line.toString();
      const data = lineString.split('|');
      const title = data[0];
      const img = data[1];
      const desc = data[2];
      const tag = data[3];
      await uploadPost(page,$options,title,img,caption,desc,tag);
      console.log('Iklan Berhasil Diupload : '+title);
    }

    // await browser.close();
})();

const login = async(page,$options,email,password) =>{
  if (cookiesString.length == 0) {
    console.log('Login Ke Tumblr');
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
      await page.goto('https://www.tumblr.com/dashboard',$options);
    }
  }
}

const inputLogin = async(page,$options,email,password) =>{
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://www.tumblr.com/login',$options);

  await page.waitForSelector('input[name="email"]');
  const emailField = await page.$('input[name="email"]');
      await emailField.type(email);
      await emailField.dispose();

  await page.waitForSelector('button[type="submit"]');
  const nextButtonLogin = await page.$('button[type="submit"]');
      await nextButtonLogin.click();
      await nextButtonLogin.dispose();

  await page.waitForSelector('input[name="password"]');
  const passwordField = await page.$('input[name="password"]');
      await passwordField.type(password);
      await passwordField.dispose();
  
  await page.waitForSelector('div > form > button[type="submit"]');
  const submitField = await page.$('div > form > button[type="submit"]');
      await submitField.click();
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

const uploadPost = async(page,$options,title,img,caption,desc,tag) =>{
    await page.waitForTimeout(2000);
    await page.goto('https://www.tumblr.com/new/text',$options)

    // await page.waitForTimeout(3000);
    // await page.waitForSelector('div.editor.editor-plaintext');
    // const btnTitle = await page.$('div.editor.editor-plaintext');
    // await btnTitle.click();
    // await btnTitle.dispose();
    
    // await page.waitForSelector('div > div > div > div > div.DraftEditor-editorContainer > div > div > div');
    // const typeTitle = await page.$('div > div > div > div > div.DraftEditor-editorContainer > div > div > div');
    // await typeTitle.type(title);
    // await typeTitle.dispose();
    await page.waitForTimeout(2000);


    
    await page.waitForSelector('div.editor-wrapper > div > div.inline-controls > div.tray > div.control.add-image > input[type=file]');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('div.editor-wrapper > div > div.inline-controls > div.tray > div.control.add-image > input[type=file]')
    ]);
    
    await fileChooser.accept(['./tumblr/img/'+img]);
    
    await page.waitForTimeout(2000);
    
    await page.keyboard.type(desc);
    await page.waitForTimeout(2000);
    await page.keyboard.type(caption);
    
    // await page.waitForSelector('div > div > div > div.DR-8X > div.DraftEditor-root > div > div > div > div > div > span > p > div');
    // const typeDescCaption = await page.$('div > div > div > div.DR-8X > div.DraftEditor-root > div > div > div > div > div > span > p > div');
    // await typeDescCaption.type(desc + caption);
    // await typeDescCaption.dispose();
    await page.waitForTimeout(2000);
    await page.waitForSelector('div._2UPya > div > span > span > textarea');
    const typeTag = await page.$('div._2UPya > div > span > span > textarea');
    await typeTag.type(tag);
    await typeTag.dispose();

    await page.keyboard.press("Tab");
    await page.keyboard.type(title);

    await page.waitForTimeout(2000);
    await page.waitForSelector('button._1F1cG.dE0It');
    const btnPost = await page.$('button._1F1cG.dE0It');
    await btnPost.click();
    await btnPost.dispose();

    const elementHandles = await page.$$('div._3hOxd > div._2YKZE > div.kW_rp > main > div._3quxC > div:nth-child(2) > div:nth-child(2) > div > div > article > header > a');
    const propertyJsHandles = await Promise.all(
      elementHandles.map(handle => handle.getProperty('href'))
    );

    const arrayLink = await Promise.all(
      propertyJsHandles.map(handle => handle.jsonValue())
    );
    
    let link = arrayLink.toString();

    fs.appendFile(__dirname +'/tumblr/hasil.txt', link , err => {
      if (err) {
        console.error(err);
        return
      }
    });

    fs.appendFile(__dirname +'/tumblr/hasil.txt', '\n' , err => {
      if (err) {
        console.error(err);
        return
      }
    });
}