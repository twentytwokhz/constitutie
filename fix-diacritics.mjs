import { readFileSync, writeFileSync } from 'fs';

// Fix cedilla → comma-below for 1991 and 2003
function fixCedilla(filePath) {
  let text = readFileSync(filePath, 'utf-8');
  const before = text.length;

  // Lowercase: ş → ș, ţ → ț
  text = text.replaceAll('\u015f', '\u0219'); // ş → ș
  text = text.replaceAll('\u0163', '\u021b'); // ţ → ț
  // Uppercase: Ş → Ș, Ţ → Ț
  text = text.replaceAll('\u015e', '\u0218'); // Ş → Ș
  text = text.replaceAll('\u0162', '\u021a'); // Ţ → Ț

  writeFileSync(filePath, text);
  console.log(`Fixed cedilla in ${filePath} (${before} chars)`);
}

fixCedilla('public/1991.md');
fixCedilla('public/2003.md');

// Verify
for (const f of ['public/1991.md', 'public/2003.md']) {
  const text = readFileSync(f, 'utf-8');
  const cedillaS = (text.match(/\u015f/g) || []).length;
  const cedillaT = (text.match(/\u0163/g) || []).length;
  const commaS = (text.match(/\u0219/g) || []).length;
  const commaT = (text.match(/\u021b/g) || []).length;
  console.log(`${f}: cedilla_s=${cedillaS} cedilla_t=${cedillaT} comma_s=${commaS} comma_t=${commaT}`);
}
