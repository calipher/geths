const axios = require('axios');
const fs = require('fs');

async function updateTitles() {
  let hymns = JSON.parse(fs.readFileSync('public/shona_hymns.json', 'utf-8'));
  let page = 1;
  let hasNext = true;
  let matches = [];

  while (hasNext) {
    try {
      const url = page === 1 ? 'https://nziyo.com/afm_hymn/' : `https://nziyo.com/afm_hymn/page/${page}/`;
      const res = await axios.get(url);
      
      const regex = /<a href="([^"]+)" rel="bookmark">(.*?)<\/a>/g;
      let m;
      let count = 0;
      while ((m = regex.exec(res.data)) !== null) {
        if(m[1].includes('/afm_hymn/')) {
            matches.push(m[2]);
            count++;
        }
      }
      
      if (count === 0) hasNext = false;
      else page++;
    } catch (e) {
      if(e.response && e.response.status === 404) hasNext = false;
      else { console.error('Error', e.message); hasNext = false; }
    }
  }
  
  console.log("Found matches:", matches.length);
  
  // They look like: <strong>Hymn 1</strong>&nbsp;&nbsp;&nbsp;&nbsp;MUTSVENE, Mutsvene, Mwari wesimba
  
  matches.forEach(m => {
     let numMatch = m.match(/Hymn (\d+)/i);
     if (numMatch) {
       let num = numMatch[1];
       let titleText = m.replace(/<strong>Hymn \d+<\/strong>/i, '').replace(/&nbsp;/g, ' ').trim();
       // Find hymnal in our json
       let h = hymns.find(h => h.number === num);
       if (h) {
          h.title = titleText;
       }
     }
  });

  fs.writeFileSync('public/shona_hymns.json', JSON.stringify(hymns, null, 2));
  console.log("Updated hymns successfully!");
}

updateTitles().catch(console.error);
