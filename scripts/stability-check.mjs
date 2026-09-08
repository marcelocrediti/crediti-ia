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
const forbidText = (content, text, label) => {
  if (content.includes(text)) fail(`Marcador proibido presente em ${label}: ${text}`);
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
  'public/creator-ads-upload-meus-videos.js',
  'public/creator-ads-video-status.js',
  'public/creator-ads-campaign-organizer.js',
  'public/employment-opportunities.js',
  'public/solides-partnership.js',
  'public/ui-stability-controller.js',
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

if (Buffer.byteLength(main, 'utf8') < 150000) fail('main.jsx ficou pequeno demais; possível truncamento acidental.');
const styles = read('src/styles.css');
if (Buffer.byteLength(styles, 'utf8') < 70000) fail('styles.css ficou pequeno demais; possível truncamento acidental.');

const index = read('index.html');
[
  '/creator-ads-preview.js?v=20260904-6',
  '/employment-opportunities.js?v=20260908-2',
  '/solides-partnership.js?v=20260908-2',
  '/ui-stability-controller.js?v=20260908-',
  '/creator-ads-upload-meus-videos.js?v=20260904-2',
  '/creator-ads-video-status.js?v=20260904-2',
  '/creator-ads-campaign-organizer.js?v=20260904-1'
].forEach((script) => requireText(index, script, 'index.html'));
forbidText(index, '/shopee-affiliate-link.js', 'index.html');
forbidText(index, '/lojas-rede-link-fix.js', 'index.html');
forbidText(index, '/creator-ads-home-card-cleanup.js', 'index.html');
forbidText(index, '/creator-ads-placement.js', 'index.html');
requireText(index, 'html.crediti-home-visible #crediti-creator-ads-card', 'index.html');
requireText(index, 'linear-gradient(135deg,#087CFF 0%,#3157FF 48%,#D91FEA 100%)', 'index.html');
requireText(index, '#FDCA01', 'index.html');
requireText(index, '/src/main.jsx', 'index.html');

const employment = read('public/employment-opportunities.js');
['Encontre seu emprego','K5dgwoZuUob6ezkbTkeJWb','GZemMLWmnhiCKJH4VtdoR4','CreditiEmploymentOpportunities'].forEach((m) => requireText(employment, m, 'public/employment-opportunities.js'));
forbidText(employment, 'MutationObserver', 'public/employment-opportunities.js');

const solides = read('public/solides-partnership.js');
['Gestão de pessoas para sua empresa','https://indiquei.app/VOYKWVZ','Sólides','CreditiSolidesPartnership'].forEach((m) => requireText(solides, m, 'public/solides-partnership.js'));
forbidText(solides, 'MutationObserver', 'public/solides-partnership.js');

const controller = read('public/ui-stability-controller.js');
['crediti-home-visible','CreditiEmploymentOpportunities','CreditiSolidesPartnership','MutationObserver','Caminhos Crediti','insertAdjacentElement'].forEach((m) => requireText(controller, m, 'public/ui-stability-controller.js'));

const runtime = read('src/config/runtime.js');
requireText(runtime, 'crediti-ia-api.onrender.com', 'src/config/runtime.js');
requireText(runtime, 'crediti_local_bills_v1', 'src/config/runtime.js');

const storage = read('src/core/storage.js');
['readLocalList', 'readLocalObject', 'saveLocalList', 'saveLocalObject'].forEach((m) => requireText(storage, m, 'src/core/storage.js'));

const currency = read('src/core/currency.js');
['parseCurrencyBR', 'formatCurrencyBR', 'maskCurrencyBR'].forEach((m) => requireText(currency, m, 'src/core/currency.js'));

if (/placeholder|TODO: substituir app|app tempor[aá]rio/i.test(main.slice(0, 4000))) {
  fail('Foi detectado conteúdo temporário no início do main.jsx.');
}

console.log('[stability-check] OK: estrutura crítica preservada.');
