const fs = require('fs');

const html = fs.readFileSync('bible_gen1.html', 'utf-8');
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

if (match) {
   const data = JSON.parse(match[1]);
   // find where the text is
   const chapters = data.props.pageProps.chapterInfo.content;
   if(chapters) {
      console.log('content type:', typeof chapters); // might be HTML string!
      console.log('content sample:', chapters.substring(0, 300));
   } else {
      console.log("No content found inside chapterInfo");
      console.log(Object.keys(data.props.pageProps));
   }
} else {
   console.log("No NEXT DATA");
}
