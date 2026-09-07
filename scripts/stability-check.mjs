import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`\n[stability-check] ${message}`);
  process.exit(1);
};
const requireFile = (file) => {
  if (!fs.existsSync(path.join(root, file))) fail(`Arquivo obrigatório ausente: ${file}`);
};
const requireText = (content, text, label) => {
  if (!content.includes(text)) fail(`Marcador crítico ausente em ${label}: ${text}`);
};

const requiredFiles = [
  'index.html',
  'src/main.jsx',
  'src/styles.css',
  'src/config/runtime.js',
  'src/core/storage.js',
  'src/core/currency.js',
  'src/core/text.js',
  'src/core/time.js',
  'public/creator-ads-preview.js',
  'public/creator-ads-home-card-cleanup.js',
  'public/creator-ads-upload-meus-videos.js',
  'public/creator-ads-video-status.js',
  'public/creator-ads-placement.js',
  'public/creator-ads-campaign-organizer.js',
  'public/shopee-affiliate-link.js',
  'public/employment-opportunities.js',
  'public/creator-admin.html',
  'public/creator-admin.js'
];
requiredFiles.forEach(requireFile);

const main = read('src/main.jsx');
[
  'class AppErrorBoundary',
  'function App()',
  'Minha Crediti',
  'Caminhos Crediti',
  'Crediti Protege',
  'Melhore seu Score',
  'Crediti Shop',
  'Renda Extra Crediti',
  'Converse com a Crediti IA',
  'createRoot('
].forEach((marker) => requireText(main, marker, 'src/main.jsx'));

const index = read('index.html');
const secondaryScripts = [
  '/creator-ads-preview.js?v=20260904-6',
  '/creator-ads-home-card-cleanup.js?v=20260904-1',
  '/creator-ads-upload-meus-videos.js?v=20260904-2',
  '/creator-ads-video-status.js?v=20260904-2',
  '/creator-ads-placement.js?v=20260904-3',
  '/creator-ads-campaign-organizer.js?v=20260904-1',
  '/shopee-affiliate-link.js?v=20260904-2',
  '/employment-opportunities.js?v=20260907-1'
];
secondaryScripts.forEach((script) => requireText(index, script, 'index.html'));
requireText(index, 'loadScriptSequentially', 'index.html');
requireText(index, 'script.async = false', 'index.html');
requireText(index, '#FDCA01', 'index.html');
requireText(index, '/src/main.jsx', 'index.html');

const employment = read('public/employment-opportunities.js');
[
  'Encontre seu emprego',
  'K5dgwoZuUob6ezkbTkeJWb',
  'GZemMLWmnhiCKJH4VtdoR4'
].forEach((marker) => requireText(employment, marker, 'public/employment-opportunities.js'));

const runtime = read('src/config/runtime.js');
requireText(runtime, 'crediti-ia-api.onrender.com', 'src/config/runtime.js');
requireText(runtime, 'crediti_local_bills_v1', 'src/config/runtime.js');

const storage = read('src/core/storage.js');
['readLocalList', 'readLocalObject', 'saveLocalList', 'saveLocalObject'].forEach((m) =>
  requireText(storage, m, 'src/core/storage.js')
);

const currency = read('src/core/currency.js');
['parseCurrencyBR', 'formatCurrencyBR', 'maskCurrencyBR'].forEach((m) =>
  requireText(currency, m, 'src/core/currency.js')
);

if (/placeholder|TODO: substituir app|app tempor[aá]rio/i.test(main.slice(0, 4000))) {
  fail('Foi detectado conteúdo temporário no início do main.jsx.');
}

console.log('[stability-check] OK: estrutura crítica preservada.');
