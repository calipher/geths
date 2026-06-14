const axios = require('axios');
const fs = require('fs');

async function getBooks() {
  const url = 'https://www.bible.com/bible/1626/GEN.1.BEN';
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = res.data;
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (match) {
    const data = JSON.parse(match[1]);
    const books = data.props.pageProps.versionData.books;
    console.log(`Found ${books.length} books`);
    console.log(books[0]);
    // Save books array structure
    fs.writeFileSync('ndebele_books.json', JSON.stringify(books, null, 2));
  }
}
getBooks().catch(console.error);
