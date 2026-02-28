import fs from "fs";
import path from "path";

const imagesDir = path.resolve("public/images");
const years = [1866, 1923, 1938, 1948, 1952, 1965];

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
    console.log("sharp library found, converting to WebP...");
  } catch {
    console.log("sharp not available, trying alternative...");
    // If sharp is not available, we'll just keep the JPGs and reference them directly
    console.log("Will use JPG files directly (Next.js Image handles optimization)");
    return;
  }

  for (const year of years) {
    const src = path.join(imagesDir, `stema-${year}.jpg`);
    const dest = path.join(imagesDir, `stema-${year}.webp`);

    if (!fs.existsSync(src)) {
      console.log(`  ${year}: source JPG not found, skipping`);
      continue;
    }

    try {
      await sharp(src)
        .webp({ quality: 85 })
        .toFile(dest);
      const srcSize = fs.statSync(src).size;
      const destSize = fs.statSync(dest).size;
      console.log(`  ${year}: ${srcSize} bytes JPG -> ${destSize} bytes WebP (${Math.round(destSize/srcSize*100)}%)`);
    } catch (err) {
      console.error(`  ${year}: conversion failed: ${err.message}`);
    }
  }

  console.log("Done converting.");
}

main();
