import https from "https";
import fs from "fs";
import path from "path";

const images = [
  { year: 1866, url: "https://www.constitutia.ro/wp-content/uploads/2000/01/constitutia-romaniei-stema-1866.jpg" },
  { year: 1923, url: "https://www.constitutia.ro/wp-content/uploads/2000/01/constitutia-romaniei-stema-1923.jpg" },
  { year: 1938, url: "https://www.constitutia.ro/wp-content/uploads/2000/01/constitutia-romaniei-stema-1938.jpg" },
  { year: 1948, url: "https://www.constitutia.ro/wp-content/uploads/2000/01/constitutia-romaniei-stema-1948.jpg" },
  { year: 1952, url: "https://www.constitutia.ro/wp-content/uploads/2000/01/constitutia-romaniei-stema-1952.jpg" },
  { year: 1965, url: "https://www.constitutia.ro/wp-content/uploads/2000/01/constitutia-romaniei-stema-1965.jpg" },
];

const outDir = path.resolve("public/images");

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, `stema-${item.year}.jpg`);
    https.get(item.url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        console.log(`  ${item.year}: redirect to ${res.headers.location}`);
        https.get(res.headers.location, { headers: { "User-Agent": "Mozilla/5.0" } }, (res2) => {
          handleResponse(res2, dest, item.year, resolve, reject);
        }).on("error", reject);
        return;
      }
      handleResponse(res, dest, item.year, resolve, reject);
    }).on("error", reject);
  });
}

function handleResponse(res, dest, year, resolve, reject) {
  if (res.statusCode !== 200) {
    console.log(`  ${year}: HTTP ${res.statusCode}`);
    resolve(false);
    return;
  }
  const chunks = [];
  res.on("data", (d) => chunks.push(d));
  res.on("end", () => {
    const buf = Buffer.concat(chunks);
    fs.writeFileSync(dest, buf);
    console.log(`  ${year}: saved ${buf.length} bytes -> ${dest}`);
    resolve(true);
  });
  res.on("error", reject);
}

async function main() {
  console.log("Downloading coat of arms images...");
  for (const item of images) {
    try {
      await download(item);
    } catch (err) {
      console.error(`  ${item.year}: ERROR ${err.message}`);
    }
  }
  console.log("Done.");
}

main();
