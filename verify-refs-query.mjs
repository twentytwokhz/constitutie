import { neon } from '@neondatabase/serverless';

var DATABASE_URL = 'postgresql://neondb_owner:npg_TXlyYQEj94nV@ep-icy-wildflower-a9o8sf1c-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
var sql = neon(DATABASE_URL);

// Query by source article (article_id=261 which has 2 references in sample)
var bySource = await sql('SELECT ar.id, ar.source_article_id, ar.target_article_id, ar.reference_text, a.number as source_num, a2.number as target_num FROM article_references ar JOIN articles a ON ar.source_article_id = a.id JOIN articles a2 ON ar.target_article_id = a2.id WHERE ar.source_article_id = 261');
console.log('Query by source (article_id=261):', bySource.length, 'references found');
bySource.forEach(function(r) {
  console.log('  Art.', r.source_num, '->', 'Art.', r.target_num, '| Text:', r.reference_text);
});

// Query by target article (article_id=192 which is targeted by 2 refs in sample)
var byTarget = await sql('SELECT ar.id, ar.source_article_id, ar.target_article_id, ar.reference_text, a.number as source_num, a2.number as target_num FROM article_references ar JOIN articles a ON ar.source_article_id = a.id JOIN articles a2 ON ar.target_article_id = a2.id WHERE ar.target_article_id = 192');
console.log('\nQuery by target (article_id=192):', byTarget.length, 'references found');
byTarget.forEach(function(r) {
  console.log('  Art.', r.source_num, '->', 'Art.', r.target_num, '| Text:', r.reference_text);
});

// Verify reference_text is meaningful for all
var allRefs = await sql('SELECT reference_text FROM article_references');
var withText = allRefs.filter(function(r) { return r.reference_text && r.reference_text.trim().length > 0; });
console.log('\nAll references with meaningful text:', withText.length, '/', allRefs.length);

// Check reference_text patterns
var patterns = {};
allRefs.forEach(function(r) {
  var text = (r.reference_text || '').toLowerCase();
  if (text.includes('art.')) patterns['art.'] = (patterns['art.'] || 0) + 1;
  if (text.includes('articol')) patterns['articol'] = (patterns['articol'] || 0) + 1;
  if (text.includes('alineat')) patterns['alineat'] = (patterns['alineat'] || 0) + 1;
});
console.log('Reference text patterns:', JSON.stringify(patterns));

console.log('\n=== Query verification complete ===');
