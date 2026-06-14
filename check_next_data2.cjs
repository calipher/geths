const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('bible_gen1.html', 'utf-8');
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

if (match) {
   const data = JSON.parse(match[1]);
   const content = data.props.pageProps.chapterInfo.content;
   const $ = cheerio.load(content);
   
   let verses = [];
   $('.verse').each((i, el) => {
       const vId = $(el).data('usfm'); // not sure if verse has class or data attr
       // extracting all text from the .verse element
       let text = $(el).find('.content').text().trim();
       if(text) verses.push(text);
   });
   
   console.log('Using .verse .content:', verses.slice(0, 3));
   
   if(verses.length === 0) {
      let temp = [];
      $('.content').each((i, el) => {
          temp.push($(el).text().trim());
      });
      console.log('all .content text:', temp.filter(x=>x).slice(0, 10).join(' '));
   }
}
