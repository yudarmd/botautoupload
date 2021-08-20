const puppeteer = require('puppeteer');
const fs = require("fs");
const lineByLine = require('n-readlines');
const readlineSync = require('readline-sync');
const figlet = require('figlet');

const cookiesFilePath = __dirname+'/facebookGroup/cookies.json';
const cookiesString = fs.readFileSync(cookiesFilePath);
(async () => {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null
    });
    const page = await browser.newPage();
    var email = null;
    var password = null;
    var caption = '';
    var line;
    const $options = {waitUntil:'networkidle2'};
    const dataBlasting = new lineByLine(__dirname + '/facebookGroup/dataBlasting.txt');

    console.log(figlet.textSync('Tools Facebook', {horizontalLayout: 'fitted'}));
    console.log('                                                                   by YudaRmd\n');

    await login(page,$options,email,password);

    const lineCaption = new lineByLine(__dirname + '/facebookGroup/caption.txt');

    while (captResult = lineCaption.next()) {
        caption += captResult.toString();
    }

    var row = 0;

    while (line = dataBlasting.next()) {
      const lineString = line.toString();
      const data = lineString.split('|');
      const img = data[0];
      const link = data[1];
      const desc = data[2];

      row += 1;

      await uploadPost(page,$options,link,img,caption,desc,row);
      console.log('Baris '+row+' Sukses Di Upload');
    }

    await browser.close();
})();

const login = async(page,$options,email,password) =>{
  if (cookiesString.length == 0) {
    console.log('Login Ke Facebook');
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
        await page.goto('https://www.facebook.com/');
      }
    }
  }
}

const inputLogin = async(page,$options,email,password) =>{
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://www.facebook.com/',$options);

  await page.waitForSelector('#email');
  const emailField = await page.$('#email');
      await emailField.type(email);
      await emailField.dispose();

  await page.waitForSelector('#pass');
  const passwordField = await page.$('#pass');
      await passwordField.type(password);
      await passwordField.dispose();

  const submitField = await page.$('button[name="login"]');
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

const uploadPost = async(page,$options,link,img,caption,desc,row) =>{
    await page.setDefaultNavigationTimeout(0);
    await page.goto(link,$options);
    
    await page.waitForSelector('div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb.ka73uehy > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div.bp9cbjyn.j83agx80.cbu4d94t.d2edcug0 > div.rq0escxv.d2edcug0.ecyo15nh.hv4rvrfc.dati1w0a.cxgpxx05 > div > div.rq0escxv.l9j0dhe7.du4w35lb.qmfd67dx.hpfvmrgz.gile2uim.buofh1pr.g5gj957u.aov4n071.oi9244e8.bi6gxh9e.h676nmdw.aghb5jc5 > div:nth-child(1) > div > div > div.tvfksri0.taijpn5t.cbu4d94t.j83agx80 > div.tw6a2znq.sj5x9vvc.d1544ag0.fdg1wqfs > div > div > div.bp9cbjyn.j83agx80.taijpn5t.c4xchbtz.by2jbhx6.a0jftqn4 > div > span > span');
    const btnPosting = await page.$('div > div:nth-child(1) > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.pfnyh3mw.jifvfom9.gs1a9yip.owycx6da.btwxx1t3.buofh1pr.dp1hu0rb.ka73uehy > div.rq0escxv.l9j0dhe7.du4w35lb.j83agx80.cbu4d94t.g5gj957u.d2edcug0.hpfvmrgz.rj1gh0hx.buofh1pr.dp1hu0rb > div > div > div.bp9cbjyn.j83agx80.cbu4d94t.d2edcug0 > div.rq0escxv.d2edcug0.ecyo15nh.hv4rvrfc.dati1w0a.cxgpxx05 > div > div.rq0escxv.l9j0dhe7.du4w35lb.qmfd67dx.hpfvmrgz.gile2uim.buofh1pr.g5gj957u.aov4n071.oi9244e8.bi6gxh9e.h676nmdw.aghb5jc5 > div:nth-child(1) > div > div > div.tvfksri0.taijpn5t.cbu4d94t.j83agx80 > div.tw6a2znq.sj5x9vvc.d1544ag0.fdg1wqfs > div > div > div.bp9cbjyn.j83agx80.taijpn5t.c4xchbtz.by2jbhx6.a0jftqn4 > div > span > span');
    await btnPosting.click();
    await btnPosting.dispose();
    
    await page.waitForTimeout(2000);
    await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > form > div > div.rq0escxv.pmk7jnqg.du4w35lb.pedkr2u6.oqq733wu.ms05siws.pnx7fd3z.b7h9ocf4.j9ispegn.kr520xx4 > div > div.j83agx80.btwxx1t3 > div > div.q5bimw55.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.eg9m0zos.l9j0dhe7.du4w35lb.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.l56l04vs.r57mb794.kh7kg01d.c3g1iek1.buofh1pr > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div > div.o6r2urh6.buofh1pr.datstx6m.l9j0dhe7.oh7imozk.x68sjeil > div.rq0escxv.buofh1pr.df2bnetk.hv4rvrfc.dati1w0a.l9j0dhe7.k4urcfbm.du4w35lb.gbhij3x4 > div > div > div > div > div._1p1t');
    const typeCaption = await page.$('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > form > div > div.rq0escxv.pmk7jnqg.du4w35lb.pedkr2u6.oqq733wu.ms05siws.pnx7fd3z.b7h9ocf4.j9ispegn.kr520xx4 > div > div.j83agx80.btwxx1t3 > div > div.q5bimw55.rpm2j7zs.k7i0oixp.gvuykj2m.j83agx80.cbu4d94t.ni8dbmo4.eg9m0zos.l9j0dhe7.du4w35lb.ofs802cu.pohlnb88.dkue75c7.mb9wzai9.l56l04vs.r57mb794.kh7kg01d.c3g1iek1.buofh1pr > div.j83agx80.cbu4d94t.buofh1pr.l9j0dhe7 > div > div.o6r2urh6.buofh1pr.datstx6m.l9j0dhe7.oh7imozk.x68sjeil > div.rq0escxv.buofh1pr.df2bnetk.hv4rvrfc.dati1w0a.l9j0dhe7.k4urcfbm.du4w35lb.gbhij3x4 > div > div > div > div > div._1p1t');
    await typeCaption.type(desc + caption);
    await typeCaption.dispose();
    
    await page.waitForTimeout(1000);
    await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > form > div > div.rq0escxv.pmk7jnqg.du4w35lb.pedkr2u6.oqq733wu.ms05siws.pnx7fd3z.b7h9ocf4.j9ispegn.kr520xx4 > div > div.j83agx80.btwxx1t3 > div > div.ihqw7lf3.discj3wi.l9j0dhe7 > div.scb9dxdr.sj5x9vvc.dflh9lhu.cxgpxx05.dhix69tm.wkznzc2l.i1fnvgqd.j83agx80.rq0escxv.ibutc8p7.l82x9zwi.uo3d90p7.pw54ja7n.ue3kfks5.tr4kgdav.eip75gnj.ccnbzhu1.dwg5866k.cwj9ozl2.bp9cbjyn > div.j83agx80 > div:nth-child(2) > div > span > div > div > div:nth-child(1) > div > div > div.bp9cbjyn.j83agx80.datstx6m.taijpn5t.l9j0dhe7.k4urcfbm');
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > form > div > div.rq0escxv.pmk7jnqg.du4w35lb.pedkr2u6.oqq733wu.ms05siws.pnx7fd3z.b7h9ocf4.j9ispegn.kr520xx4 > div > div.j83agx80.btwxx1t3 > div > div.ihqw7lf3.discj3wi.l9j0dhe7 > div.scb9dxdr.sj5x9vvc.dflh9lhu.cxgpxx05.dhix69tm.wkznzc2l.i1fnvgqd.j83agx80.rq0escxv.ibutc8p7.l82x9zwi.uo3d90p7.pw54ja7n.ue3kfks5.tr4kgdav.eip75gnj.ccnbzhu1.dwg5866k.cwj9ozl2.bp9cbjyn > div.j83agx80 > div:nth-child(2) > div > span > div > div > div:nth-child(1) > div > div > div.bp9cbjyn.j83agx80.datstx6m.taijpn5t.l9j0dhe7.k4urcfbm')
    ]);
    
    await fileChooser.accept(['./facebookGroup/img/'+img]);

    await page.waitForTimeout(5000);
    await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > form > div > div.rq0escxv.pmk7jnqg.du4w35lb.pedkr2u6.oqq733wu.ms05siws.pnx7fd3z.b7h9ocf4.j9ispegn.kr520xx4 > div > div.j83agx80.btwxx1t3 > div > div.ihqw7lf3.discj3wi.l9j0dhe7 > div.k4urcfbm.dati1w0a.hv4rvrfc.i1fnvgqd.rq0escxv > div > div');
    const btnKirim = await page.$('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > form > div > div.rq0escxv.pmk7jnqg.du4w35lb.pedkr2u6.oqq733wu.ms05siws.pnx7fd3z.b7h9ocf4.j9ispegn.kr520xx4 > div > div.j83agx80.btwxx1t3 > div > div.ihqw7lf3.discj3wi.l9j0dhe7 > div.k4urcfbm.dati1w0a.hv4rvrfc.i1fnvgqd.rq0escxv > div > div');
    await btnKirim.click();
    await btnKirim.dispose();

    await page.waitForTimeout(3000);
    await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div:nth-child(2) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div.dati1w0a.hv4rvrfc.ihqw7lf3.cbu4d94t.j83agx80.aovydwv3 > div > div:nth-child(2) > div.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.pq6dq46d.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.l9j0dhe7.abiwlrkh.p8dawk7l.cbu4d94t.taijpn5t.k4urcfbm > div');
    const btnLainKaliAcara = await page.$('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div:nth-child(2) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div.dati1w0a.hv4rvrfc.ihqw7lf3.cbu4d94t.j83agx80.aovydwv3 > div > div:nth-child(2) > div.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.pq6dq46d.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.l9j0dhe7.abiwlrkh.p8dawk7l.cbu4d94t.taijpn5t.k4urcfbm > div');
    await btnLainKaliAcara.click();
    await btnLainKaliAcara.dispose();

    // await page.waitForTimeout(3000);
    // await page.waitForSelector('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div:nth-child(2) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div.dati1w0a.hv4rvrfc.ihqw7lf3.cbu4d94t.j83agx80.aovydwv3 > div > div:nth-child(1) > div.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.pq6dq46d.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.l9j0dhe7.abiwlrkh.p8dawk7l.cbu4d94t.taijpn5t.k4urcfbm > div');
    // const btnKirimPesan = await page.$('div > div:nth-child(1) > div > div:nth-child(7) > div > div > div:nth-child(2) > div > div > div.rq0escxv.l9j0dhe7.du4w35lb > div > div.iqfcb0g7.tojvnm2t.a6sixzi8.k5wvi7nf.q3lfd5jv.pk4s997a.bipmatt0.cebpdrjk.qowsmv63.owwhemhu.dp1hu0rb.dhp61c6y.l9j0dhe7.iyyx5f41.a8s20v7p > div > div > div > div.dati1w0a.hv4rvrfc.ihqw7lf3.cbu4d94t.j83agx80.aovydwv3 > div > div:nth-child(1) > div.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.pq6dq46d.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.l9j0dhe7.abiwlrkh.p8dawk7l.cbu4d94t.taijpn5t.k4urcfbm > div');
    // await btnKirimPesan.click();
    // await btnKirimPesan.dispose();

    await page.waitForTimeout(3000);
    const content = 'Baris '+row+' Sukses Di Upload\n';
    fs.appendFile(__dirname +'/facebookGroup/hasil.txt', content, err => {
      if (err) {
        console.error(err);
        return
      }
    });
}