const axios = require('axios');
const fs = require('fs');

async function testScrape() {
  const url = 'https://www.bible.com/bible/1626/GEN.1.BEN';
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  fs.writeFileSync('bible_gen1.html', res.data);
  console.log('Saved to bible_gen1.html');
}

testScrape().catch(console.error);
