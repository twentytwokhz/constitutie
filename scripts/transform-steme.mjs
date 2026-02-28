import sharp from "sharp";
import path from "path";
import fs from "fs";

// Transform coat of arms images:
// 1. Remove white background (make transparent)
// 2. Trim excess transparent space
// 3. Resize to match existing reference images (~300-360px wide)

var imagesDir = path.resolve("public/images");
var years = [1866, 1923, 1938, 1948, 1952, 1965];

// White threshold: pixels with R,G,B all above this value become transparent
var WHITE_THRESHOLD = 245;

// Target dimensions to match existing logo images (logo1991=300x420, logo2003=300x427)
var TARGET_WIDTH = 360;
var TARGET_MAX_HEIGHT = 450;

for (var i = 0; i < years.length; i++) {
  var year = years[i];
  var srcPath = path.join(imagesDir, "stema-" + year + ".webp");
  var outPath = path.join(imagesDir, "stema-" + year + "-new.webp");

  if (!fs.existsSync(srcPath)) {
    console.log(year + ": source not found, skipping");
    continue;
  }

  console.log(year + ": processing...");

  // Step 1: Read image and get raw pixel data
  var image = sharp(srcPath);
  var meta = await image.metadata();
  var rawBuffer = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer();

  var width = meta.width;
  var height = meta.height;
  var pixelCount = width * height;

  console.log("  Source: " + width + "x" + height);

  // Step 2: Make white/near-white pixels transparent
  // Process RGBA buffer (4 bytes per pixel)
  for (var p = 0; p < pixelCount; p++) {
    var offset = p * 4;
    var r = rawBuffer[offset];
    var g = rawBuffer[offset + 1];
    var b = rawBuffer[offset + 2];

    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      rawBuffer[offset + 3] = 0; // set alpha to 0 (transparent)
    }
  }

  // Step 3: Create image from modified buffer, trim, and resize
  var trimmed = await sharp(rawBuffer, {
    raw: { width: width, height: height, channels: 4 }
  })
    .trim()  // Remove transparent borders
    .toBuffer({ resolveWithObject: true });

  console.log("  Trimmed: " + trimmed.info.width + "x" + trimmed.info.height);

  // Step 4: Resize to target width, maintaining aspect ratio
  var result = await sharp(trimmed.data, {
    raw: { width: trimmed.info.width, height: trimmed.info.height, channels: 4 }
  })
    .resize({ width: TARGET_WIDTH, height: TARGET_MAX_HEIGHT, fit: "inside" })
    .webp({ quality: 90, effort: 6 })
    .toFile(outPath);

  var srcSize = fs.statSync(srcPath).size;
  var outSize = fs.statSync(outPath).size;
  console.log("  Output: " + result.width + "x" + result.height + ", " + outSize + " bytes (was " + srcSize + ")");
}

console.log("\nDone! New files saved as stema-YYYY-new.webp");
console.log("Review them, then rename to replace originals.");
