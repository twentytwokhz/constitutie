// Check which characters in Romanian constitution text would be routed
// to which font, and identify potential black-spot characters

const testTexts = [
  'Constituția României',
  'drepturile și libertățile cetățenilor',
  '„Suveranitatea națională"',
  '1. România este stat de drept, democratic și social,',
  'în care demnitatea omului — drepturile şi libertăţile',
  'alegeri libere, periodice și corecte, precum și prin referendum.',
];

function isLatinExt(charCode) {
  return charCode >= 0x100;
}

// Google Fonts latin subset unicode ranges
function isInLatinSubset(charCode) {
  if (charCode >= 0x0000 && charCode <= 0x00FF) return true;
  if (charCode === 0x0131) return true;
  if (charCode >= 0x0152 && charCode <= 0x0153) return true;
  if (charCode >= 0x02BB && charCode <= 0x02BC) return true;
  if (charCode === 0x02C6 || charCode === 0x02DA || charCode === 0x02DC) return true;
  if (charCode === 0x0304 || charCode === 0x0308 || charCode === 0x0329) return true;
  if (charCode >= 0x2000 && charCode <= 0x206F) return true; // General Punctuation!
  if (charCode === 0x20AC) return true; // Euro sign
  if (charCode === 0x2122) return true;
  if (charCode === 0x2191 || charCode === 0x2193) return true;
  if (charCode === 0x2212 || charCode === 0x2215) return true;
  if (charCode === 0xFEFF || charCode === 0xFFFD) return true;
  return false;
}

// Google Fonts latin-ext subset unicode ranges (simplified)
function isInLatinExtSubset(charCode) {
  if (charCode >= 0x0100 && charCode <= 0x02AF) return true;
  // There are more ranges but this covers Romanian diacritics
  return false;
}

for (const text of testTexts) {
  process.stdout.write(`\nText: "${text}"\n`);
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);
    if (code > 0x7F) { // Only show non-ASCII
      const currentRouting = isLatinExt(code) ? 'InterExt' : 'Helvetica';
      const inLatin = isInLatinSubset(code);
      const inLatinExt = isInLatinExtSubset(code);
      const problem = !inLatin && !inLatinExt ? '⚠️ NOT IN EITHER SUBSET!' :
                      (currentRouting === 'InterExt' && !inLatinExt) ? '⚠️ WRONG ROUTING (in latin, sent to ext)' : '';
      process.stdout.write(`  '${char}' U+${code.toString(16).toUpperCase().padStart(4, '0')} → ${currentRouting} | latin:${inLatin} ext:${inLatinExt} ${problem}\n`);
    }
  }
}
