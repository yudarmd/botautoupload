// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra')
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');


const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const cookiesFilePathBlog = __dirname+'/blog/cookies_blog.json';
const cookiesStringBlog = fs.readFileSync(cookiesFilePathBlog);

const cookiesFilePathWp = __dirname+'/blog/cookies_wp.json';
const cookiesStringWp = fs.readFileSync(cookiesFilePathWp);
(async () => {
    const browser = await await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });
    const page = await browser.newPage();
    var emailBlog = null;
    var passwordBlog = null;
    var linkWp = null;
    var emailWp = null;
    var passwordWp = null;
    var line;
    const $options = {waitUntil:'networkidle2'};
    const dataBlasting = new lineByLine(__dirname + '/blog/dataBlasting.txt');

    console.log(figlet.textSync('Tools Blogger', {horizontalLayout: 'fitted'}));
    console.log('                                                               by YudaRmd\n');

    await login(page,$options,emailBlog,passwordBlog,linkWp,emailWp,passwordWp)
    
    while (line = dataBlasting.next()) {
      const lineString = line.toString();
      const data = lineString.split('|');
      const title = data[0];
      const linkArtikel = data[1];
      const label = data[2];
      const date = data[3];
      const time = data[4];
      const permalink = data[5];
      await uploadArtikel(page,$options,title,linkArtikel,label,date,time,permalink);
      console.log('Iklan berhasil di upload: '+title);
    }

    // await browser.close();
})();

const login = async(page,$options,emailBlog,passwordBlog,linkWp,emailWp,passwordWp) =>{
  if (cookiesStringBlog.length == 0 && cookiesStringWp.length == 0) {
    console.log('Login Ke Blog');
      emailBlog = readlineSync.question('Email Blog : ');
      passwordBlog = readlineSync.question('Password Blog : ', {
        hideEchoBack: true
    });

    console.log('Login Ke Wordpress');
    linkWp = readlineSync.question('Link Login Wordpress : ');
    emailWp = readlineSync.question('Email Wordpress : ');
    passwordWp = readlineSync.question('Password Wordpress : ', {
      hideEchoBack: true
    });

    await inputLogin(page,$options,emailBlog,passwordBlog,linkWp,emailWp,passwordWp);
  }else{
    var gantiAkun = readlineSync.question('Anda Sudah Login. Apakah Anda ingin Ganti Akun (Y/N) : ');

    if (gantiAkun == "Y" || gantiAkun == "y") {
      console.log('Login Ke Blog');
      emailBlog = readlineSync.question('Email Blog : ');
      passwordBlog = readlineSync.question('Password Blog : ', {
        hideEchoBack: true
      });
      console.log('Login Ke Wordpress');
      linkWp = readlineSync.question('Link Login Wordpress : ');
      emailWp = readlineSync.question('Email Wordpress : ');
      passwordWp = readlineSync.question('Password Wordpress : ', {
        hideEchoBack: true
      });
      await inputLogin(page,$options,emailBlog,passwordBlog,linkWp,emailWp,passwordWp);
    }else{
      const parsedCookiesBlog = JSON.parse(cookiesStringBlog);
      const parsedCookiesWp = JSON.parse(cookiesStringWp);
      if (parsedCookiesBlog.length !== 0 && parsedCookiesWp.length !== 0) {
          for (let cookieBlog of parsedCookiesBlog) {
            await page.setCookie(cookieBlog);
          }
          for (let cookieWp of parsedCookiesWp) {
            await page.setCookie(cookieWp);
          }
      }
    }
  }
}

const inputLogin = async(page,$options,emailBlog,passwordBlog,linkWp,emailWp,passwordWp) =>{
  await page.setDefaultNavigationTimeout(0);
  await page.goto("https://www.blogger.com/",$options);
  
  await page.waitForSelector('body > header > div.header--content > div.header--buttons > a.sign-in.ga-header-sign-in');
  const btnToLogin = await page.$('body > header > div.header--content > div.header--buttons > a.sign-in.ga-header-sign-in');
  await btnToLogin.click();
  await btnToLogin.dispose();

  await page.waitForNavigation();
      
  await page.waitForSelector('input#identifierId');
  const emailBlogField = await page.$('input#identifierId');
      await emailBlogField.type(emailBlog);
      await emailBlogField.dispose();

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

  await page.waitForTimeout(1000);
  await page.waitForSelector('input[name="password"]');
  const passwordBlogField = await page.$('input[name="password"]');
      await passwordBlogField.type(passwordBlog);
      await passwordBlogField.dispose();

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');

  await page.waitForTimeout(5000);
  const cookiesObjectBlog = await page.cookies();

  fs.writeFile(cookiesFilePathBlog, JSON.stringify(cookiesObjectBlog),
  function(err) { 
      if (err) {
      console.log('The file could not be written.', err)
      }
      // console.log('Session has been successfully saved')
  });

  await page.setDefaultNavigationTimeout(0);
  await page.goto(linkWp,$options);

  await page.waitForSelector('#user_login');
  const emailWpField = await page.$('#user_login');
      await emailWpField.type(emailWp);
      await emailWpField.dispose();

  await page.waitForTimeout(1000);
  await page.waitForSelector('#user_pass');
  const passwordWpField = await page.$('#user_pass');
      await passwordWpField.type(passwordWp);
      await passwordWpField.dispose();

  await page.waitForTimeout(1000);
  await page.waitForSelector('#wp-submit');
  const wpSubmit = await page.$('#wp-submit');
      await wpSubmit.click();
      await wpSubmit.dispose();

  await page.waitForTimeout(5000);
  const cookiesObjectWp = await page.cookies();

  fs.writeFile(cookiesFilePathWp, JSON.stringify(cookiesObjectWp),
  function(err) { 
      if (err) {
      console.log('The file could not be written.', err)
      }
      // console.log('Session has been successfully saved')
  });
  
}

const uploadArtikel = async(page,$options,title,linkArtikel,label,date,time,permalink) =>{
  await page.setDefaultNavigationTimeout(0);
  await page.goto(linkArtikel,$options);

  await page.waitForSelector('#content-html');
  const btnToText = await page.$('#content-html');
      await btnToText.click();
      await btnToText.dispose();

  await page.waitForTimeout(5000);
  await page.waitForSelector('#content');
  await page.click('#content');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');

  await page.keyboard.down('Control');
  await page.keyboard.press('C');
  await page.keyboard.up('Control');

  await page.goto("https://www.blogger.com/",$options);

  await page.waitForSelector('#gb > div.gb_Cc.gb_Ac.gb_Fc.gb_Hc.gb_la > div.gb_Ic > div > c-wiz > div.kiQDlf > div > div > div.ZFr60d.CeoRYc');
  const btnPosting = await page.$('#gb > div.gb_Cc.gb_Ac.gb_Fc.gb_Hc.gb_la > div.gb_Ic > div > c-wiz > div.kiQDlf > div > div > div.ZFr60d.CeoRYc');
      await btnPosting.click();
      await btnPosting.dispose();

  await page.waitForTimeout(2000);
  await page.waitForSelector('c-wiz:nth-child(16) > div > c-wiz > div > div.LYkI7 > div.rFrNMe.rzHh9c.l8Ahzd.zKHdkd.sdJrJc > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
  const titleFiled = await page.$('c-wiz:nth-child(16) > div > c-wiz > div > div.LYkI7 > div.rFrNMe.rzHh9c.l8Ahzd.zKHdkd.sdJrJc > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
      await titleFiled.type(title);
      await titleFiled.dispose();
  
  // await page.waitForSelector('#yDmH0d > c-wiz:nth-child(16) > div > c-wiz > div > div.MJkged > div > div > div.y3IDJd.Fx3kmc.fmzcZd > span > div > div.P8hSs.pEg5pc.CDANdb.ZsY9oc > div.Qy5T6b.O3LMFb.QduVPe > div.Wdqgzf > div.gw7PYd > div > div:nth-child(1) > div.ry3kXd.YuHtjc > div.MocG8c.m5D6Fd.LMgvRb.KKjvXb');
  // const btnSwitchArticle = await page.$('#yDmH0d > c-wiz:nth-child(16) > div > c-wiz > div > div.MJkged > div > div > div.y3IDJd.Fx3kmc.fmzcZd > span > div > div.P8hSs.pEg5pc.CDANdb.ZsY9oc > div.Qy5T6b.O3LMFb.QduVPe > div.Wdqgzf > div.gw7PYd > div > div:nth-child(1) > div.ry3kXd.YuHtjc > div.MocG8c.m5D6Fd.LMgvRb.KKjvXb');
  //     await btnSwitchArticle.click();
  //     await btnSwitchArticle.dispose();

  // await page.waitForSelector('#yDmH0d > c-wiz:nth-child(16) > div > c-wiz > div > div.MJkged > div > div > div.y3IDJd.Fx3kmc.fmzcZd > span > div > div.CDANdb.fVFpRb.fH9kK > div.oqVKcb > div.hANwub > div.gw7PYd > div > div.OA0qNb.ncFHed.WYEltf > div.MocG8c.m5D6Fd.LMgvRb.KKjvXb');
  // const btnSwitchHTML = await page.$('#yDmH0d > c-wiz:nth-child(16) > div > c-wiz > div > div.MJkged > div > div > div.y3IDJd.Fx3kmc.fmzcZd > span > div > div.CDANdb.fVFpRb.fH9kK > div.oqVKcb > div.hANwub > div.gw7PYd > div > div.OA0qNb.ncFHed.WYEltf > div.MocG8c.m5D6Fd.LMgvRb.KKjvXb');
  //     await btnSwitchHTML.click();
  //     await btnSwitchHTML.dispose();

  await page.waitForSelector('#yDmH0d > c-wiz:nth-child(16) > div > c-wiz > div > div.MJkged > div > div > div.y3IDJd.Fx3kmc.fmzcZd > span > div > div.CDANdb.fVFpRb.fH9kK > div.QPhiZ > div > div > div > div.CodeMirror-scroll');
  const clickForWrite = await page.$('#yDmH0d > c-wiz:nth-child(16) > div > c-wiz > div > div.MJkged > div > div > div.y3IDJd.Fx3kmc.fmzcZd > span > div > div.CDANdb.fVFpRb.fH9kK > div.QPhiZ > div > div > div > div.CodeMirror-scroll');
      await clickForWrite.click();
      await clickForWrite.dispose();
      
  await page.waitForTimeout(2000);
  await page.keyboard.down('Control');
  await page.keyboard.press('V');
  await page.keyboard.up('Control');
      
  await page.waitForTimeout(1000);
  await page.waitForSelector('div > div.edhGSc.zKHdkd.QM47Xb > div.RpC4Ne.oJeWuf > div.Pc9Gce.Wic03c > textarea');
  const labelFiled = await page.$('div > div.edhGSc.zKHdkd.QM47Xb > div.RpC4Ne.oJeWuf > div.Pc9Gce.Wic03c > textarea');
      await labelFiled.type(label);
      await labelFiled.dispose();
      
  await page.waitForTimeout(1000);
  await page.waitForSelector('span > c-wiz > div > div.Ovbbsc > div:nth-child(2) > div > div > span.DPvwYc.igNPrb');
  const clickDatePublish = await page.$('span > c-wiz > div > div.Ovbbsc > div:nth-child(2) > div > div > span.DPvwYc.igNPrb');
      await clickDatePublish.click();
      await clickDatePublish.dispose();

  await page.waitForTimeout(1000);
  await page.click('div > div > div:nth-child(2) > div.efl9jf > div.rFrNMe.AIDG3c.zKHdkd.Tyc9J.CDELXb > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(date);

  await page.waitForTimeout(1000);
  await page.click('div > div > div:nth-child(2) > div.efl9jf > div.EZtl7e > div > div.d1dlne.WvJxMd > div.rFrNMe.Ax4B8.JdbXdd.zKHdkd.Tyc9J.CDELXb > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(time);

  await page.waitForTimeout(1000);      
  await page.waitForSelector('span > c-wiz > div > div.Ovbbsc > div:nth-child(3) > div > div > span.DPvwYc.igNPrb');
  const clickPermalink = await page.$('span > c-wiz > div > div.Ovbbsc > div:nth-child(3) > div > div > span.DPvwYc.igNPrb');
      await clickPermalink.click();
      await clickPermalink.dispose();

  await page.waitForTimeout(1000);        
  await page.waitForSelector('div.q6mdaf > div:nth-child(2) > span > div > div:nth-child(2) > div.zJKIV.A2ZHsc.i9xfbb > div.SCWude > div');
  const clickLinkKhusus = await page.$('div.q6mdaf > div:nth-child(2) > span > div > div:nth-child(2) > div.zJKIV.A2ZHsc.i9xfbb > div.SCWude > div');
      await clickLinkKhusus.click();
      await clickLinkKhusus.dispose();

  await page.waitForTimeout(1000);
  await page.waitForSelector('div.q6mdaf > div:nth-child(3) > div > div > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
  const linkKhususFiled = await page.$('div.q6mdaf > div:nth-child(3) > div > div > div.aCsJod.oJeWuf > div > div.Xb9hP > input');
      await linkKhususFiled.type(permalink);
      await linkKhususFiled.dispose();
  
  await page.waitForTimeout(1000);
  await page.waitForSelector('c-wiz:nth-child(16) > div > c-wiz > div > div.LYkI7 > div.vAOvBb > div.U26fgb.O0WRkf.zZhnYe.e3Duub.C0oVfc.jPVgtf.iRR07e.M9Bg4d > span');
  const btnPublish = await page.$('c-wiz:nth-child(16) > div > c-wiz > div > div.LYkI7 > div.vAOvBb > div.U26fgb.O0WRkf.zZhnYe.e3Duub.C0oVfc.jPVgtf.iRR07e.M9Bg4d > span');
      await btnPublish.click();
      await btnPublish.dispose();
  
  await page.waitForTimeout(1000);
  await page.waitForSelector('div.llhEMd.iWO5td > div > div.g3VIld.OFqiSb.Up8vH.J9Nfi.iWO5td > div.XfpsVe.J9fJmf > div.U26fgb.O0WRkf.oG5Srb.HQ8yf.C0oVfc.kHssdc.HvOprf.M9Bg4d > span > span');
  const btnConfirm = await page.$('div.llhEMd.iWO5td > div > div.g3VIld.OFqiSb.Up8vH.J9Nfi.iWO5td > div.XfpsVe.J9fJmf > div.U26fgb.O0WRkf.oG5Srb.HQ8yf.C0oVfc.kHssdc.HvOprf.M9Bg4d > span > span');
      await btnConfirm.click();
      await btnConfirm.dispose();
  
  // await page.waitForTimeout(1000);
  // await page.waitForSelector('c-wiz:nth-child(17) > div > c-wiz > c-wiz > div > div > div > div:nth-child(1) > div > span > div > div > div.jn15V');
  // const toArtikel = await page.$('c-wiz:nth-child(17) > div > c-wiz > c-wiz > div > div > div > div:nth-child(1) > div > span > div > div > div.jn15V');
  //     await toArtikel.click();
  //     await toArtikel.dispose();
  
  // await page.waitForTimeout(1000);
  // await page.waitForSelector('#c29 > span > c-wiz > div > div.Ovbbsc > div:nth-child(3) > div > span > div');
  // const clickToPermalink = await page.$('#c29 > span > c-wiz > div > div.Ovbbsc > div:nth-child(3) > div > span > div');
  //     await clickToPermalink.click();
  //     await clickToPermalink.dispose();

//   await page.waitForTimeout(2000);
//   const link = await page.evaluate(() => {
//     return document.querySelector("div.q6mdaf > span").textContent;
//  });
  const content = "Artikel Berhasil : "+title;
  fs.appendFile(__dirname +'/blog/hasil.txt', content , err => {
    if (err) {
      console.error(err);
      return
    }
  });
}