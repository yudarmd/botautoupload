// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');


const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const cookiesFilePath = __dirname+'/youtube/cookies.json';
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
    const dataBlasting = new lineByLine(__dirname + '/youtube/dataBlasting.txt');

    console.log(figlet.textSync('Tools Youtube', {horizontalLayout: 'fitted'}));
    console.log('                                                                   by YudaRmd\n');

    await login(page,$options,email,password)

    const lineCaption = new lineByLine(__dirname + '/youtube/caption.txt');

    while (captResult = lineCaption.next()) {
        caption += captResult.toString();
    }
    
    while (line = dataBlasting.next()) {
      const lineString = line.toString();
      const data = lineString.split('|');
      const video = data[0];
      const title = data[1];
      const desc = data[2];
      await uploadPin(page,$options,video,title,caption,desc);
      console.log('Iklan berhasil di upload: '+title);
    }

    // await browser.close();
})();

const login = async(page,$options,email,password) =>{
  if (cookiesString.length == 0) {
    console.log('Login Ke Youtube');
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
        await page.goto('https://www.youtube.com/',$options);
      }
    }
  }
}

const inputLogin = async(page,$options,email,password) =>{
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://www.youtube.com/',$options);

  await page.waitForSelector('#buttons > ytd-button-renderer > a');
  const buttonToLogin = await page.$('#buttons > ytd-button-renderer > a');
      await buttonToLogin.click();
      await buttonToLogin.dispose();
      
  await page.waitForSelector('input#identifierId');
  const emailField = await page.$('input#identifierId');
      await emailField.type(email);
      await emailField.dispose();

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

  await page.waitForTimeout(1000);
  await page.waitForSelector('input[name="password"]');
  const passwordField = await page.$('input[name="password"]');
      await passwordField.type(password);
      await passwordField.dispose();

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

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

const uploadPin = async(page,$options,video,title,caption,desc) =>{
  await page.setDefaultNavigationTimeout(0);
  await page.goto("https://studio.youtube.com/",$options);

  await page.waitForSelector('#create-icon');
  const btnCreate = await page.$('#create-icon');
      await btnCreate.click();
      await btnCreate.dispose();

  await page.waitForSelector('#text-item-0');
  const btnUpload = await page.$('#text-item-0');
      await btnUpload.click();
      await btnUpload.dispose();
    
    await page.waitForSelector('#select-files-button');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('#select-files-button')
    ]);
    
    await fileChooser.accept(['./youtube/video/'+video]);
    
    await page.waitForSelector('ytcp-mention-input#input')
    await page.keyboard.press('Backspace');

    await page.waitForTimeout(2000);
    await page.keyboard.type(title);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    await page.keyboard.type(desc + caption);

    await page.waitForSelector('ytcp-video-metadata-playlists > ytcp-text-dropdown-trigger > ytcp-dropdown-trigger > div');
    const choosePlayListSelect = await page.$('ytcp-video-metadata-playlists > ytcp-text-dropdown-trigger > ytcp-dropdown-trigger > div');
    await choosePlayListSelect.click();
    await choosePlayListSelect.dispose();

    await page.waitForSelector('#checkbox-container[class="style-scope ytcp-checkbox-lit"]');
    const choosePlayList = await page.$('#checkbox-container[class="style-scope ytcp-checkbox-lit"]');
    await choosePlayList.click();
    await choosePlayList.dispose();

    await page.waitForSelector('ytcp-button.done-button.action-button.style-scope.ytcp-playlist-dialog > div[class="label style-scope ytcp-button"]');
    const btnDone = await page.$('ytcp-button.done-button.action-button.style-scope.ytcp-playlist-dialog > div[class="label style-scope ytcp-button"]');
    await btnDone.click();
    await btnDone.dispose();

    await page.waitForSelector('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]');
    const radioMadeForKids = await page.$('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]');
    await radioMadeForKids.click();
    await radioMadeForKids.dispose();

    await page.waitForSelector('ytcp-button#next-button');
    const btnNext1 = await page.$('ytcp-button#next-button');
    await btnNext1.click();
    await btnNext1.dispose();

    await page.waitForSelector('ytcp-button#next-button');
    const btnNext2 = await page.$('ytcp-button#next-button');
    await btnNext2.click();
    await btnNext2.dispose();

    await page.waitForSelector('ytcp-button#next-button');
    const btnNext3 = await page.$('ytcp-button#next-button');
    await btnNext3.click();
    await btnNext3.dispose();

    await page.waitForSelector('tp-yt-paper-radio-button[name="PUBLIC"]');
    const choosePublic = await page.$('tp-yt-paper-radio-button[name="PUBLIC"]');
    await choosePublic.click();
    await choosePublic.dispose();

    const arrayLink = await page.evaluate(
      () => Array.from(
        document.querySelectorAll('#scrollable-content > ytcp-uploads-review > div.right-col.style-scope.ytcp-uploads-review > ytcp-video-info > div > div.row.style-scope.ytcp-video-info > div.left.style-scope.ytcp-video-info > div.value.style-scope.ytcp-video-info > span > a'),
        a => a.getAttribute('href')
      )
    );
    
    let link = arrayLink.toString() + '\n';
    fs.appendFile(__dirname +'/youtube/hasil.txt', link, err => {
      if (err) {
        console.error(err);
        return
      }
    });

    await page.waitForSelector('ytcp-button#done-button');
    const btnPublish = await page.$('ytcp-button#done-button');
    await btnPublish.click();
    await btnPublish.dispose();

    await page.waitForTimeout(10000);
}