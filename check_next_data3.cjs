const fs = require('fs');

const html = fs.readFileSync('bible_gen1.html', 'utf-8');
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);

if (match) {
   const data = JSON.parse(match[1]);
   console.log(Object.keys(data.props.pageProps.versionData));
   try { console.log(data.props.pageProps.versionData.books.slice(0, 2)); } catch(e){}
}
