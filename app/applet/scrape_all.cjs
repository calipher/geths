const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const https = require('https');

const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

const abbrevMap = {
  'gn': 'GEN', 'ex': 'EXO', 'lv': 'LEV', 'nm': 'NUM', 'dt': 'DEU', 'js': 'JOS', 'jud': 'JDG', 'rt': 'RUT', '1sm': '1SA', 
  '2sm': '2SA', '1kgs': '1KI', '2kgs': '2KI', '1ch': '1CH', '2ch': '2CH', 'ezr': 'EZR', 'ne': 'NEH', 'et': 'EST', 
  'job': 'JOB', 'ps': 'PSA', 'prv': 'PRO', 'ec': 'ECC', 'so': 'SNG', 'is': 'ISA', 'jr': 'JER', 'lm': 'LAM', 'ez': 'EZK', 
  'dn': 'DAN', 'ho': 'HOS', 'jl': 'JOL', 'am': 'AMO', 'ob': 'OBA', 'jn': 'JON', 'mi': 'MIC', 'na': 'NAM', 'hk': 'HAB', 
  'zp': 'ZEP', 'hg': 'HAG', 'zc': 'ZEC', 'ml': 'MAL', 'mt': 'MAT', 'mk': 'MRK', 'lk': 'LUK', 'jo': 'JHN', 'act': 'ACT', 
  'rm': 'ROM', '1co': '1CO', '2co': '2CO', 'gl': 'GAL', 'eph': 'EPH', 'ph': 'PHP', 'cl': 'COL', '1ts': '1TH', '2ts': '2TH', 
  '1tm': '1TI', '2tm': '2TI', 'tt': 'TIT', 'phm': 'PHM', 'hb': 'HEB', 'jm': 'JAS', '1pe': '1PE', '2pe': '2PE', '1jo': '1JN', 
  '2jo': '2JN', '3jo': '3JN', 'jd': 'JUD', 're': 'REV'
};

async function scrapeBible(versionId, ext, outFile) {
  const kjvData = JSON.parse(fs.readFileSync('public/kjv.json', 'utf-8'));
  let tasks = [];
  
  for (let bIndex = 0; bIndex < kjvData.length; bIndex++) {
    const book = kjvData[bIndex];
    const usfm = abbrevMap[book.abbrev] || book.abbrev.toUpperCase();
    for (let cIndex = 0; cIndex < book.chapters.length; cIndex++) {
       tasks.push({ bIndex, cIndex, usfm, abbrev: book.abbrev, bookName: book.name, chapter: cIndex + 1 });
    }
  }

  const results = [];
  let completed = 0;
  
  const worker = async (task) => {
     let retries = 5;
     while(retries > 0) {
       try {
         const url = `https://www.bible.com/bible/${versionId}/${task.usfm}.${task.chapter}.${ext}`;
         const res = await axios.get(url, {
           headers: { 'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/100.0.0.0 Safari/537.36` },
           httpsAgent,
           timeout: 15000
         });
         
         const match = res.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
         let htmlContent = '';
         if (match) {
           const d = JSON.parse(match[1]);
           htmlContent = d.props?.pageProps?.chapterInfo?.content || '';
         }
         if (!htmlContent) {
           htmlContent = res.data;
         }
         
         const $ = cheerio.load(htmlContent);
         let verses = [];
         $('.verse').each((i, el) => {
             let text = $(el).find('.content').text().trim();
             if(text) verses.push(text);
         });
         
         if(verses.length === 0) {
            $('.content').each((i, el) => {
                let text = $(el).text().trim();
                if(text && !text.match(/^[\d\s]+$/)) {
                  verses.push(text);
                }
            });
         }
         // Sometimes classes change, fallback string extract
         if(verses.length === 0) {
            $('span[data-usfm]').each((i, el) => {
                // remove numbers
                $(el).find('.label').remove();
                verses.push($(el).text().trim());
            });
         }
         
         return { ...task, verses };
       } catch (e) {
         retries--;
         if(retries === 0) {
            console.error(`Failed ${task.usfm} ${task.chapter}: ${e.message}`);
            return { ...task, verses: [] };
         }
         await new Promise(r => setTimeout(r, 1000));
       }
     }
  };

  const CONCURRENCY = 30; // 30 concurrent requests
  const active = new Set();
  
  for (let i = 0; i < tasks.length; i++) {
     const p = worker(tasks[i]).then(r => {
        results.push(r);
        active.delete(p);
        completed++;
        if(completed % 200 === 0) console.log(`Completed ${completed}/${tasks.length} for ${ext}`);
     });
     active.add(p);
     if (active.size >= CONCURRENCY) {
        await Promise.race(active);
     }
  }
  await Promise.all(active);

  console.log(`All done for ${ext}. Assembling JSON...`);
  const finalBible = kjvData.map(b => ({
     abbrev: b.abbrev.toLowerCase(),
     name: b.name, 
     chapters: []
  }));
  
  results.forEach(r => {
     if(!finalBible[r.bIndex].chapters) finalBible[r.bIndex].chapters = [];
     finalBible[r.bIndex].chapters[r.cIndex] = r.verses;
  });
  
  fs.writeFileSync(outFile, JSON.stringify(finalBible));
  console.log(`Saved to ${outFile} length:`, finalBible.length);
}

async function run() {
  console.log("Starting Ndebele scrape...");
  await scrapeBible('1626', 'BEN', 'public/ndebele_bible.json');
  console.log("Starting Shona scrape...");
  await scrapeBible('32', 'BDSC', 'public/shona_bible.json');
  console.log("Done.");
}

run().catch(console.error);
