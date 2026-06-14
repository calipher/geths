import https from "https";

https.get("https://bicczim.org/app/hymn.html", (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
