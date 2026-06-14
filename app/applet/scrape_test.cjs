const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://www.bible.com/bible/1626/GEN.1.BEN';
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(res.data);
  const verses = [];
  
  // Find verse spans
  $('.verse').each((i, el) => {
    const v = $(el).text();
    verses.push(v);
  });
  
  console.log('Verses class:', verses.slice(0, 5));
  
  // Try another possible class:
  const altVerses = [];
  $('span[class^="w w-"]').each((i, el) => {
    altVerses.push($(el).text());
  });
  
  console.log('Words:', altVerses.slice(0, 20).join(' '));
  
  console.log('HTML sample:', res.data.substring(0, 500));
}

testScrape().catch(console.error);
