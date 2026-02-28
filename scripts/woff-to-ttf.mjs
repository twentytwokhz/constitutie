/**
 * Convert WOFF to raw OTF/TTF by decompressing the table data.
 * WOFF is just a compressed wrapper around OpenType tables.
 * @react-pdf/fontkit has known issues with WOFF parsing that cause
 * glyph lookup failures for certain Unicode ranges.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function woffToOtf(woffBuffer) {
  // WOFF header: https://www.w3.org/TR/WOFF/#WOFFHeader
  const signature = woffBuffer.readUInt32BE(0);
  if (signature !== 0x774f4646) {
    throw new Error("Not a valid WOFF file (signature: 0x" + signature.toString(16) + ")");
  }

  const sfntFlavor = woffBuffer.readUInt32BE(4);
  const numTables = woffBuffer.readUInt16BE(12);
  const totalSfntSize = woffBuffer.readUInt32BE(16);

  // Build the OTF/TTF output
  // OTF header: 12 bytes + 16 bytes per table record
  const headerSize = 12 + numTables * 16;

  // Read WOFF table directory (starts at offset 44)
  const tables = [];
  let woffOffset = 44;
  for (let i = 0; i < numTables; i++) {
    const tag = woffBuffer.toString("ascii", woffOffset, woffOffset + 4);
    const offset = woffBuffer.readUInt32BE(woffOffset + 4);
    const compLength = woffBuffer.readUInt32BE(woffOffset + 8);
    const origLength = woffBuffer.readUInt32BE(woffOffset + 12);
    const origChecksum = woffBuffer.readUInt32BE(woffOffset + 16);
    tables.push({ tag, offset, compLength, origLength, origChecksum });
    woffOffset += 20;
  }

  // Decompress each table
  const decompressedTables = [];
  for (const table of tables) {
    const compData = woffBuffer.subarray(table.offset, table.offset + table.compLength);
    let data;
    if (table.compLength === table.origLength) {
      // Not compressed
      data = compData;
    } else {
      data = zlib.inflateSync(compData);
    }
    if (data.length !== table.origLength) {
      throw new Error(`Table ${table.tag}: expected ${table.origLength} bytes, got ${data.length}`);
    }
    decompressedTables.push({ ...table, data });
  }

  // Calculate output size
  let outputSize = headerSize;
  for (const t of decompressedTables) {
    // Each table is 4-byte aligned
    outputSize += t.origLength;
    const padding = (4 - (t.origLength % 4)) % 4;
    outputSize += padding;
  }

  const output = Buffer.alloc(outputSize);

  // Write OTF header
  output.writeUInt32BE(sfntFlavor, 0);
  output.writeUInt16BE(numTables, 4);

  // searchRange, entrySelector, rangeShift
  let searchRange = 1;
  let entrySelector = 0;
  while (searchRange * 2 <= numTables) {
    searchRange *= 2;
    entrySelector++;
  }
  searchRange *= 16;
  output.writeUInt16BE(searchRange, 6);
  output.writeUInt16BE(entrySelector, 8);
  output.writeUInt16BE(numTables * 16 - searchRange, 10);

  // Write table records and data
  let dataOffset = headerSize;
  for (let i = 0; i < decompressedTables.length; i++) {
    const t = decompressedTables[i];
    const recordOffset = 12 + i * 16;

    // Write table record
    output.write(t.tag, recordOffset, 4, "ascii");
    output.writeUInt32BE(t.origChecksum, recordOffset + 4);
    output.writeUInt32BE(dataOffset, recordOffset + 8);
    output.writeUInt32BE(t.origLength, recordOffset + 12);

    // Write table data
    t.data.copy(output, dataOffset);
    dataOffset += t.origLength;
    const padding = (4 - (t.origLength % 4)) % 4;
    dataOffset += padding;
  }

  return output;
}

// Convert all WOFF files in public/fonts/
const fontsDir = path.join(process.cwd(), "public", "fonts");
const conversions = [
  ["Inter-Latin-Regular.woff", "Inter-Latin-Regular.otf"],
  ["Inter-Latin-Bold.woff", "Inter-Latin-Bold.otf"],
  ["Inter-Regular.woff", "Inter-LatinExt-Regular.otf"],
  ["Inter-Bold.woff", "Inter-LatinExt-Bold.otf"],
];

for (const [src, dst] of conversions) {
  const srcPath = path.join(fontsDir, src);
  const dstPath = path.join(fontsDir, dst);
  if (!fs.existsSync(srcPath)) {
    console.log(`SKIP: ${src} not found`);
    continue;
  }
  const woffBuf = fs.readFileSync(srcPath);
  const otfBuf = woffToOtf(woffBuf);
  fs.writeFileSync(dstPath, otfBuf);
  console.log(`${src} (${woffBuf.length} bytes) -> ${dst} (${otfBuf.length} bytes)`);
}

console.log("\nDone! OTF files written to public/fonts/");
