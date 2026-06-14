const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeHymns() {
  let hymns = [];
  let page = 1;
  let hasNext = true;
  
  while (hasNext) {
    try {
      console.log(`Fetching page ${page}...`);
      const url = page === 1 ? 'https://nziyo.com/afm_hymn/' : `https://nziyo.com/afm_hymn/page/${page}/`;
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);
      
      const hymnLinks = [];
      $('a[rel="bookmark"]').each((i, el) => {
        hymnLinks.push($(el).attr('href'));
      });
      
      if (hymnLinks.length === 0) {
        hasNext = false;
        break;
      }
      
      const hymnPromises = hymnLinks.map(async (link) => {
        try {
          const hymnRes = await axios.get(link);
          const $hymn = cheerio.load(hymnRes.data);
          
          const titleText = $hymn('h1.entry-title').text().trim(); // "AFM 1..."
          let numberMatch = titleText.match(/Hymn (\d+)/i);
          let numberStr = numberMatch ? numberMatch[1] : null;
          let title = titleText;
          
          if (title.includes('–')) {
             title = title.split('–').slice(1).join('–').trim();
          } else if (title.includes('-')) {
             title = title.split('-').slice(1).join('-').trim();
          }

          let contentHtml = $hymn('div.entry-content').html() || "";
          let content = contentHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
          
          return {
             number: numberStr,
             title: title,
             lyrics: content
          };
        } catch (e) {
          console.error(`Error fetching hymn ${link}`, e.message);
          return null;
        }
      });
      
      const results = await Promise.all(hymnPromises);
      results.forEach(res => {
         if (res) {
            if (!res.number) res.number = String(hymns.length + 1);
            hymns.push(res);
         }
      });
      
      page++;
      fs.writeFileSync('public/shona_hymns.json', JSON.stringify(hymns, null, 2));
      
    } catch (e) {
      console.error(`Error on page ${page}`, e.message);
      hasNext = false;
    }
  }
  
  if (hymns.length > 0) {
    // Sort by number
    hymns.sort((a,b) => parseInt(a.number || "0") - parseInt(b.number || "0"));
    fs.writeFileSync('public/shona_hymns.json', JSON.stringify(hymns, null, 2));
    console.log(`Successfully saved ${hymns.length} shona hymns.`);
  } else {
    console.log("No hymns found.");
  }
}

scrapeHymns();
