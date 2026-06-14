const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function testScrape() {
  const url = 'https://www.bible.com/bible/1626/GEN.1.BEN';
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  
  const $ = cheerio.load(res.data);
  let verses = [];
  $('span.ChapterContent_verse__57FIw').each((i, el) => {
     let v = $(el).find('.ChapterContent_content__RrUqA').text();
     verses.push(v);
  });
  
  if (verses.length === 0) {
     $('span[class^="ChapterContent_verse"]').each((i, el) => {
         verses.push($(el).text());
     });
  }

  console.log('Found verses:', verses.length);
  console.log(verses.slice(0, 3));
}

testScrape().catch(console.error);
