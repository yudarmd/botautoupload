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
  var caption = '';
  var line;
  const $options = {waitUntil:'networkidle2'};
  const dataBlasting = new lineByLine(__dirname + '/kaskus/dataBlasting.txt');

  await page.setViewport({"width": 0,"height": 0});

  const lineDesc = new lineByLine(__dirname + '/kaskus/caption.txt');

  while (captResult = lineDesc.next()) {
      caption += captResult.toString();
  }

  console.log(figlet.textSync('Tools Kaskus', {horizontalLayout: 'fitted'}));
  console.log('                                                            by YudaRmd\n');

  await login(page,$options,email,password).then(() => {console.log("Login Berhasil")}).catch(async(err) => {
    console.log('Login Gagal');
  });

  while (line = dataBlasting.next()) {
    const lineString = line.toString();
    const data = lineString.split('|');
    const img = data[0];
    const title = data[1];
    const desc = data[2];
    const price = data[3];
    const tag = data[4];

    await uploadIklan(page,$options,browser,img,title,desc,price,caption,tag).then(() => {
          return console.log('Iklan Berhasil Diupload: '+title);
      })
      .catch((err) => {
          return console.log('Iklan Gagal Diupload: '+title);
      })
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

const uploadIklan = async (page,$options,browser,img,title,desc,price,caption,tag) =>{
  await page.setDefaultNavigationTimeout(0); 
  await page.goto('https://fjb.kaskus.co.id/sell',$options);

  await page.waitForSelector('#maincategory');
    const selectCategory = await page.$('#maincategory');
        await selectCategory.select('202');
        await selectCategory.dispose();

  await page.waitForSelector('#subcategory-0');
    const selectSubCategory = await page.$('#subcategory-0');
        await selectSubCategory.select('885');
        await selectSubCategory.dispose();

  await page.waitForSelector('#title');
  const titleField = await page.$('#title');
      await titleField.type(title);
      await titleField.dispose();

  await page.waitForSelector('#formatted_price');
  const priceField = await page.$('#formatted_price');
      await priceField.type(price);
      await priceField.dispose();

  await page.waitForSelector('#location');
  const locationField = await page.$('#location');
      await locationField.select('11');
      await locationField.dispose();

  await page.waitForSelector('#fjb-description-editor');
  const descriptionField = await page.$('#fjb-description-editor');
      await descriptionField.type(desc + caption);
      await descriptionField.dispose();

  await page.waitForSelector('#upload-image-1');
  const [fileChooser] = await Promise.all([
    page.waitForFileChooser(),
    page.click('#upload-image-1')
  ]);

  await fileChooser.accept(['./kaskus/img/'+img]).then(() => {}).catch(async(err) => {
    console.log('Gambar harus .jpg atau Gambar tidak tersedia. Silahkan cek kembali!');
    await browser.close();
  });

  await page.waitForTimeout(3000);
  await page.waitForSelector('#tag');
  const tagField = await page.$('#tag');
      await tagField.type(tag);
      await tagField.dispose();
      
  await page.waitForNavigation();
  await page.waitForTimeout(8000);
  const content = await page.evaluate(() => location.href) + "\n";
  fs.appendFile(__dirname +'/kaskus/hasil.txt', content, err => {
    if (err) {
      console.error(err);
      return
    }
  });
}