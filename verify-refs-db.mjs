import { neon } from '@neondatabase/serverless';

var DATABASE_URL = 'postgresql://neondb_owner:npg_TXlyYQEj94nV@ep-icy-wildflower-a9o8sf1c-pooler.gwc.azure.neon.tech/neondb?sslmode=require';
var sql = neon(DATABASE_URL);

// Step 1: Count all references
var countResult = await sql('SELECT COUNT(*) as total FROM article_references');
console.log('Step 1 - Total references:', countResult[0].total);

// Step 2: Check reference_text population
var nullTextCount = await sql('SELECT COUNT(*) as total FROM article_references WHERE reference_text IS NULL OR reference_text = \'\'');
console.log('Step 2 - References with NULL/empty reference_text:', nullTextCount[0].total);

// Step 3: Sample references with text
var sampleRefs = await sql('SELECT ar.id, ar.source_article_id, ar.target_article_id, ar.reference_text FROM article_references ar LIMIT 10');
console.log('\nStep 3 - Sample references:');
sampleRefs.forEach(function(r) {
  console.log('  ID:', r.id, '| Source:', r.source_article_id, '-> Target:', r.target_article_id, '| Text:', (r.reference_text || '').substring(0, 80));
});

// Step 4: Verify all source_article_id references valid articles
var invalidSources = await sql('SELECT ar.id, ar.source_article_id FROM article_references ar LEFT JOIN articles a ON ar.source_article_id = a.id WHERE a.id IS NULL');
console.log('\nStep 4 - Invalid source_article_id references:', invalidSources.length);

// Step 5: Verify all target_article_id references valid articles
var invalidTargets = await sql('SELECT ar.id, ar.target_article_id FROM article_references ar LEFT JOIN articles a ON ar.target_article_id = a.id WHERE a.id IS NULL');
console.log('Step 5 - Invalid target_article_id references:', invalidTargets.length);

// Step 6: Verify queryable by source article
var bySource = await sql('SELECT ar.*, a.number as source_number FROM article_references ar JOIN articles a ON ar.source_article_id = a.id WHERE a.number = 148 LIMIT 5');
console.log('\nStep 6 - References from article 148:', bySource.length);
bySource.forEach(function(r) { console.log('  -> Target article_id:', r.target_article_id, '| Text:', (r.reference_text || '').substring(0, 60)); });

// Step 7: Verify queryable by target article
var byTarget = await sql('SELECT ar.*, a.number as target_number FROM article_references ar JOIN articles a ON ar.target_article_id = a.id WHERE a.number = 1 LIMIT 5');
console.log('\nStep 7 - References targeting article 1:', byTarget.length);
byTarget.forEach(function(r) { console.log('  <- Source article_id:', r.source_article_id, '| Text:', (r.reference_text || '').substring(0, 60)); });

console.log('\n=== All verification steps complete ===');
