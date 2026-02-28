import sharp from "sharp";
import path from "path";

var imagesDir = path.resolve("public/images");
var files = [
  "logo1991.webp", "logo2003.webp", "logo1952.webp", "logo1986.webp",
  "stema-1866.webp", "stema-1923.webp", "stema-1938.webp",
  "stema-1948.webp", "stema-1952.webp", "stema-1965.webp"
];

for (var i = 0; i < files.length; i++) {
  var f = files[i];
  try {
    var m = await sharp(path.join(imagesDir, f)).metadata();
    console.log(f, m.width + "x" + m.height, m.format, m.hasAlpha ? "alpha" : "no-alpha", m.channels + "ch");
  } catch (e) {
    console.log(f, "ERROR:", e.message);
  }
}
