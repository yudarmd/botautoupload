const puppeteer = require('puppeteer');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');

const cookiesFilePath = __dirname+'/jualo/cookies.json';
const cookiesString = fs.readFileSync(cookiesFilePath);

(async () => {
  const browser = await await puppeteer.launch({
    // headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  var email = null;
  var password = null;
  var caption = '';
  var line;
  const $options = {waitUntil:'networkidle2'};
  const dataBlasting = new lineByLine(__dirname + '/jualo/dataBlasting.txt');

  await page.setViewport({"width": 0,"height": 0});

  const lineDesc = new lineByLine(__dirname + '/jualo/caption.txt');

  while (captResult = lineDesc.next()) {
      caption += captResult.toString();
  }

  console.log(figlet.textSync('Tools Jualo', {horizontalLayout: 'fitted'}));
  console.log('                                                            by YudaRmd\n');

  await login(page,$options,email,password);
  var row = 0;
  while (line = dataBlasting.next()) {
    const lineString = line.toString();
    const data = lineString.split('|');
    const img = data[0];
    const title = data[1];
    const desc = data[2];
    const price = data[3];
    row += 1;
    await uploadIklan(page,$options,browser,img,title,desc,price,caption,row);
    console.log('Iklan berhasil di upload: '+title)
  }
  await browser.close();

})();

const login = async(page,$options,email,password) =>{
  if (cookiesString.length == 0) {
    console.log('Login Ke Jualo');
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
  await page.goto('https://www.jualo.com/iklan/pasang-iklan-gratis',$options);

  await page.waitForSelector('#fileupload');
  const buttonToLogin = await page.$('#fileupload');
      await buttonToLogin.click();
      await buttonToLogin.dispose();

  await page.waitForSelector('#submitLoginModal > div > div.input-div > div.mainbox__email.input-with-icon.first-child > input[name="user[email]"]');
  const emailField = await page.$('#submitLoginModal > div > div.input-div > div.mainbox__email.input-with-icon.first-child > input[name="user[email]"]');
      await emailField.type(email,{delay:10});
      await emailField.type(email,{delay:10});
      await emailField.dispose();
  
  await page.waitForSelector('#submitLoginModal > div > div.input-div > div.mainbox__password.input-with-icon.last-child > input[name="user[password]"]');
  const passwordField = await page.$('#submitLoginModal > div > div.input-div > div.mainbox__password.input-with-icon.last-child > input[name="user[password]"]');
      await passwordField.type(password);
      await passwordField.dispose();

  await page.waitForSelector('#loginBtn');
  const submitField = await page.$('#loginBtn');
      await submitField.click();
      await submitField.dispose();

  await page.waitForSelector('[class="alert fade in alert-success "]');
  const alertSuccess = await page.$('[class="alert fade in alert-success "]');
      await alertSuccess.click();
      await alertSuccess.dispose();

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

const uploadIklan = async (page,$options,browser,img,title,desc,price,caption,row) =>{
    await page.setDefaultNavigationTimeout(0); 
    await page.goto('https://www.jualo.com/iklan/pasang-iklan-gratis',$options);

    await page.waitForSelector('#fileupload');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('#fileupload')
    ]);

    await fileChooser.accept(['./jualo/img/'+img]).then(() => {}).catch(async(err) => {
      console.log('Gambar harus .jpg atau Gambar tidak tersedia. Silahkan cek kembali!');
      await browser.close();
    });

    await page.waitForSelector('#ad_ad_name');
    const inputTitle = await page.$('#ad_ad_name');
        await inputTitle.type(title);
        await inputTitle.dispose();

    await page.waitForTimeout(2000);
    await page.waitForSelector('#create_ad_one');
    const btnNext1 = await page.$('#create_ad_one');
        await btnNext1.click();
        await btnNext1.dispose();

    await page.waitForTimeout(1000);
    await page.waitForSelector('.edit-cat-btn');
    const selectCategory = await page.$('.edit-cat-btn');
        await selectCategory.click();
        await selectCategory.dispose();

    await page.waitForTimeout(1000);
    await page.waitForSelector('[data-slug="jasa"]');
    const selectSubCategory = await page.$('[data-slug="jasa"]');
        await selectSubCategory.click();
        await selectSubCategory.dispose();
    
    await page.waitForTimeout(1000);
    await page.waitForSelector('[data-value="1164"]');
    const selectSubSubCategory = await page.$('[data-value="1164"]');
        await selectSubSubCategory.click();
        await selectSubSubCategory.dispose();

    await page.waitForSelector('#ad_ad_type_id_1');
    await page.evaluate(() => {
      document.querySelector('#ad_ad_type_id_1').click();
    });

    await page.waitForTimeout(1000);
    await page.waitForSelector('[name="ad[detail_attributes][description]"]');
    const inputDesc = await page.$('[name="ad[detail_attributes][description]"]');
        await inputDesc.type(desc + caption);
        await inputDesc.dispose();

    await page.waitForSelector('#ad_price');
    const inputPrice = await page.$('#ad_price');
        await inputPrice.type(price);
        await inputPrice.dispose();
    
    await page.waitForTimeout(2000);
    await page.waitForSelector('#create_ad_two');
    const btnNext2 = await page.$('#create_ad_two');
        await btnNext2.click();
        await btnNext2.dispose();
    
    await page.waitForTimeout(1000);
    await page.waitForSelector('#create-ad-3 > div > div.panel.panel-white.step-three-border-radius > div.ad-terms-and-condition');
    const chackboxAgreement = await page.$('#create-ad-3 > div > div.panel.panel-white.step-three-border-radius > div.ad-terms-and-condition');
        await chackboxAgreement.click();
        await chackboxAgreement.dispose();

    page.on('dialog', async (dialog) => {
      await dialog. accept().then(() => {}).catch((err) => {});
    });
    ` `
    await page.waitForTimeout(1000);
    await page.waitForSelector('#submit_button');
    const btnSubmit = await page.$('#submit_button');
        await btnSubmit.click();
        await btnSubmit.dispose();

    await page.waitForNavigation();
    const arrayLink = await page.evaluate(
      () => Array.from(
        document.querySelectorAll('body > div.pasang-iklan-success > div.success-info-section > a.button-left'),
        a => a.getAttribute('href')
      )
    );
    
    let link = arrayLink.toString() + '\n';
    
    fs.appendFile(__dirname +'/jualo/hasil.txt', link, err => {
      if (err) {
        console.error(err);
        return
      }
    });

    // await page.waitForTimeout(1000);
    // await page.waitForSelector('body > div.pasang-iklan-success > div.success-info-section > a.button-left');
    // const redirectToIklan = await page.$('body > div.pasang-iklan-success > div.success-info-section > a.button-left');
    //     await redirectToIklan.click();
    //     await redirectToIklan.dispose();

    // await page.waitForTimeout(2000);
    // await page.screenshot({path: './jualo/hasil/iklan'+row+'.jpg'});
}