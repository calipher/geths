const fs = require('fs');
try {
  let raw = fs.readFileSync('public/kjv.json', 'utf8');
  let data = JSON.parse(raw);
  console.log("Parsed KJV books:", data.length);
  // Reformat to our schema
  let newKjv = data.map(b => ({
      abbrev: b.abbrev.toLowerCase(),
      name: b.name,
      chapters: b.chapters
  }));
  fs.writeFileSync('public/kjv.json', JSON.stringify(newKjv));
  console.log("Successfully transformed KJV!");
} catch (e) {
  console.error("Error parsing/writing:", e.message);
}
