import https from 'node:https';
import fs from 'node:fs';

https.get("https://bicczim.org/app/hymn.html", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log(data.substring(0, 500));
    fs.writeFileSync('hymn.html', data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
