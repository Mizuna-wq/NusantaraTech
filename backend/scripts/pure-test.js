// Uji murni untuk recommendationService dan cvService (tidak butuh MySQL).
import assert from 'node:assert/strict';
import {
  extractSkills, extractIjazah, extractSertifikat,
  scoreJob, recommendJobs, relevanceLabel,
  SKILL_KEYWORDS,
} from '../src/services/recommendationService.js';
import { extractPdfText } from '../src/services/cvService.js';
import zlib from 'node:zlib';

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) { passed += 1; console.log(`  OK    ${name}`); }
  else { failed += 1; console.log(`  GAGAL ${name} ${detail}`); }
}

console.log('=== recommendationService ===');

check('skill keyword ada', SKILL_KEYWORDS.some(k => k === 'react'));
check('skill keyword ada', SKILL_KEYWORDS.some(k => k === 'data analyst'));

check('extractSkills: react ditemukan', extractSkills('Saya pandai React dan Node.js').includes('react'));
check('extractSkills: sql ditemukan', extractSkills('SQL dan Excel').includes('sql'));
check('extractSkills: tidak mengekstrak kepribadian', extractSkills('saya sedang lapar').length === 0);

check('extractIjazah: s1 ditemukan', extractIjazah('Saya lulus SMA').includes('sma'));
check('extractIjazah: s2/kuliah ditemukan', extractIjazah('Magister').includes('magister'));

check('extractSertifikat: sertifikat ditemukan', extractSertifikat('Punya sertifikat cloud').includes('sertifikat'));

const job = {
  title: 'Data Analyst',
  department: 'Data',
  description: 'Merapikan data dan membuat laporan',
  responsibilities: 'Bersihkan data mentah',
  qualifications: 'Menguasai SQL, Excel, dan statistik',
};
check('scoreJob: skill cocok', scoreJob(job, ['sql', 'excel'], [], []) >= 4);

// Data Analyst cocok (SQL+Excel), Frontend tidak (tidak ada skill SQL/Excel)
const jobs = [
  { title: 'Frontend Dev', department: 'Engineering', description: 'React', responsibilities: '', qualifications: 'React, JavaScript' },
  { title: 'Data Analyst', department: 'Data', description: 'SQL', responsibilities: '', qualifications: 'SQL, Excel' },
];
const recs = recommendJobs(jobs, ['sql', 'excel'], [], []);
check('recommendJobs: Data Analyst paling atas', recs[0].title === 'Data Analyst');
check('recommendJobs: hanya 1 yang matches skill', recs.length === 1, `got ${recs.length}`);

check('relevanceLabel: >=6', relevanceLabel(6) === 'Sangat relevan');
check('relevanceLabel: >=3', relevanceLabel(3) === 'Relevan');
check('relevanceLabel: <1', relevanceLabel(0) === 'Tidak terdeteksi');

console.log('=== cvService (PDF text extraction) ===');

// Buat PDF mini yang valid: stream terkompresi FlateDecode, isi "Hello World".
function makePdf(content) {
  const compressed = zlib.deflateSync(Buffer.from(content, 'utf8'));
  return [
    '%PDF-1.4',
    '1 0 obj', '<< /Type /Catalog /Pages 2 0 R >>', 'endobj',
    '2 0 obj', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'endobj',
    '3 0 obj', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >>', 'endobj',
    '4 0 obj', `<< /Length ${compressed.length} /Filter /FlateDecode >>`, 'stream', compressed.toString('latin1'), 'endstream', 'endobj',
    '5 0 obj', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', 'endobj',
    'xref', '0 6', '0000000000 65535 f ', '0000000010 00000 n ', '0000000060 00000 n ', '0000000110 00000 n ', '0000000170 00000 n ', '0000000230 00000 n ',
    'TRAILER', '<< /Size 6 /Root 1 0 R >>', 'startxref', '300', '%%EOF',
  ].join('\n');
}

const pdf1 = makePdf('BT\n/F1 12 Tf\n100 700 Td\n(Hello World) Tj\nET');
const text1 = extractPdfText(Buffer.from(pdf1, 'binary'));
check('PDF: ekstrak teks "Hello World"', text1.includes('Hello World'), text1);

// Sertakan skill dalam PDF
const pdf2 = makePdf('BT\n/F1 12 Tf\n100 700 Td\n(React, Node.js, SQL, sertifikat Cloud) Tj\nET');
const text2 = extractPdfText(Buffer.from(pdf2, 'binary'));
check('PDF: skill diekstrak', text2.includes('React') && text2.includes('Node.js') && text2.includes('SQL'), text2);

console.log(`\nTotal: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
