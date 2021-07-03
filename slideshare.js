const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var userAgent = require('user-agents');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteerExtra.use(StealthPlugin())
puppeteerExtra.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: '345feaa980a3b07345d810abd02f6511' },
    visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)


const initBrowser = async () =>{
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--disable-extensions-except='+__dirname+'/buster-master',
      '--load-extension='+__dirname+'/buster-master',
    ]
  });
  return browser;
};

const initNewPage = async (browser) =>{
  const page = await browser.newPage();
  return page;
}

const cookiesFilePath = __dirname+'/cookies.json';
const previousSession = fs.existsSync(cookiesFilePath);
const cookiesString = fs.readFileSync(cookiesFilePath);

const login = async (page,email,password) =>{
  if (previousSession) {
    const cookiesString = fs.readFileSync(cookiesFilePath);
    if (cookiesString.length != 0) {
      const parsedCookies = JSON.parse(cookiesString);
      if (parsedCookies.length !== 0) {
          for (let cookie of parsedCookies) {
            await page.setCookie(cookie);
        }
        await page.goto('https://www.slideshare.net');
      }
    }else{
        await page.setDefaultNavigationTimeout(0);
        await page.goto('https://www.linkedin.com/login');
        await page.waitForSelector('#username');
        await page.type('#username',email);
        await page.waitForSelector('#password');
        await page.type('#password',password);
        await page.click('[data-litms-control-urn="login-submit"]');
        await page.waitForTimeout(2000);
        await page.goto('https://www.slideshare.net/login');
        await page.click('[class="j-linkedin-connect button button-social button-li radius"]');
        await page.waitForTimeout(2000);

        // Save Session Cookies
        const cookiesObject = await page.cookies();

        fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
        function(err) { 
            if (err) {
            console.log('The file could not be written.', err)
            }
            console.log('Session has been successfully saved')
        });
    }
  }
}

const inputIklan = async (page,browser,file,judul,desc,harga,caption) =>{
    await page.setUserAgent(userAgent.toString());
    await page.setDefaultNavigationTimeout(0); 
    await page.goto('https://www.slideshare.net/upload');
    await page.waitForTimeout(2000);
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('.fileupload')
    ]);
    await fileChooser.accept(['file/'+file]).then(() => {}).catch(async(err) => {
      console.log('Gambar harus .jpg atau Gambar tidak tersedia. Silahkan cek kembali!');
      await browser.close();
    });
    await page.waitForSelector('[name="title"]')
    await page.type('[name="title"]', judul ,{delay:10});
    await page.waitForTimeout(1000);
    await page.keyboard.press("Tab");
    await page.keyboard.type('Telp/WA 08211-7777-699, Outbound Team Building, Outbound Team Leader, Outbound Team Building Games, Pelatihan Outbound di Malang, Info Pelatihan Outbound, Lembaga Pelatihan Outbound, Outbound Pelatihan Kepemimpinan, Pelatihan Kepemimpinan Outbound')
    await page.waitForTimeout(1000);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.waitForSelector('[class="tag-editor"]')
    await page.type('[class="tag-editor"]', 'outbound, jasa, edukasi, pendidikan',{delay: 20});
    await page.waitForTimeout(1000);
    await page.waitForSelector('[name="top_cat"]')
    await page.select('[name="top_cat"]', '6');
    await page.waitForTimeout(2000);
    await page.click('#recaptcha-v2');
    await page.waitForTimeout(2000);
    await page.click('[id="solver-button"]');

    const content = await page.evaluate(() => location.href) + "\n";
    fs.appendFile(__dirname +'/hasil.txt', content, err => {
      if (err) {
        console.error(err);
        return
      }
    });
}

const liner = new lineByLine(__dirname + '/dataBlasting.txt');

(async () => {
    let line;
    let descResult;
    let caption ="";
    let email ="";
    let password ="";

    const browser = await initBrowser();
    const page = await initNewPage(browser);

    const lineDesc = new lineByLine(__dirname + '/caption.txt');

    while (descResult = lineDesc.next()) {
        caption += descResult.toString();
    }

    if(cookiesString.length != 0){
      console.log('Anda Sudah Login');
      readline.question('Apakah Anda Ingin Ganti Akun (Y/N)', ch => {
        if (ch == "Y" || ch == "y") {
          readline.question('Email : ', inputEmail => {
            email = inputEmail;
              readline.question('Password : ', inputPassword => {
                password = inputPassword;
                readline.close();
              });
          });
        }else{
          readline.close();
        }
      });
    }else{
      console.log('Login Slide Share');
      readline.question('Email : ', inputEmail => {
        email = inputEmail;
          readline.question('Password : ', inputPassword => {
            password = inputPassword;
            readline.close();
          });
      });
    }

    readline.on("close", async() => {
      await login(page,email,password).then(() => {
        if (cookiesString.length == 0) {
          console.log('login berhasil ke akun '+email);
        }
      }).catch(async(err) => {
        console.log('login gagal');
        await browser.close();
      });

      while (line = liner.next()) {
        const lineString = line.toString();
        const data = lineString.split('|');
        const file = data[0];
        const judul = data[1];
        const desc = data[2];
        const harga = data[3];
        await inputIklan(page,browser,file,judul,desc,harga,caption);
        console.log('Iklan berhasil di upload: '+judul)
      }
      await browser.close();
    });
})();