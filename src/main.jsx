import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL =
  "https://crediti-ia-api.onrender.com";

const AI_REQUEST_TIMEOUT_MS =
  60000;

function warmAiServer() {
  fetch(`${API_URL}/health`, {
    method: "GET",
    cache: "no-store"
  }).catch(() => {
    // O envio da mensagem continua funcionando mesmo se o aquecimento falhar.
  });
}

const SUPABASE_URL =
  "https://vgdtywdpywezrwlrsawq.supabase.co/rest/v1";

const SUPABASE_KEY =
  "sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER";

const RENDA_EXTRA_URL =
  "https://crediti.startcapital.app/signIn";

const LOCAL_KEYS = {
  bills: "crediti_local_bills_v1",
  favorites: "crediti_local_favorites_v1",
  recent: "crediti_local_recent_v1",
  comparisons: "crediti_local_comparisons_v1",
  profile: "crediti_financial_profile_v1",
  simulations: "crediti_simulations_v1",
  serviceRequests: "crediti_service_requests_v1"
};

function readLocalList(key) {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(key) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readLocalObject(key, fallback) {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(key) || "null"
    );

    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalList(key, value) {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );
    return true;
  } catch {
    return false;
  }
}

function daysUntil(dateValue) {
  if (!dateValue) {
    return null;
  }

  const due = new Date(`${dateValue}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Math.ceil(
    (due.getTime() - today.getTime()) /
      86400000
  );
}

const SHOPEE_STORE_URL =
  "https://collshp.com/marceloachou?view=storefront";

const MAGALU_STORE_URL =
  "https://www.influenciadormagalu.com.br/creditishop";

const SHEIN_STORE_URL =
  "https://onelink.shein.com/50/609kponu54lj";

const AMAZON_STORE_URL =
  "https://amzn.to/46trmWP";

const BABYSTOCK_STORE_URL =
  "https://lmdee.link/PXX29qIp80c0";

const TOY_MANIA_STORE_URL =
  "https://compre.vc/QKO7qQTkTz5X";

const KIDY_STORE_URL =
  "https://acesse.vc/3DTYtW3WGPV3";

const XIAOMI_STORE_URL =
  "https://acesse.vc/CU3ka7zhk1gj";

const ITATIAIA_STORE_URL =
  "https://acesse.vc/Xj3TUddBwQxj";

const ELECTROLUX_STORE_URL =
  "https://electrolux.mais.app/NB2skA";

const NATURA_STORE_URL =
  "https://sovsls.com/c/np365ay?no_js=1";

const AVON_STORE_URL =
  "https://sovsls.com/c/q26ywcm?no_js=1";

const CEA_STORE_URL =
  "https://www.cea.com.br/minhacea/creditishop?utm_source=mais&utm_medium=minhacea&utm_campaign=creditisho";

const LOJA_MECANICO_STORE_URL =
  "https://www.lojadomecanico.com.br/parceiro/lY9lGtc1IvbYBrB5Fby8hQ==?utm_campaign=afiliado-lY9lGtc1IvbYBrB5Fby8hQ==&utm_source=afiliado&utm_medium=site";

const POLISHOP_STORE_URL =
  "https://mais.app/EKkAgs";

const TODOVINO_STORE_URL =
  "https://mais.app/70NJ9j";

const AMOKARITE_STORE_URL =
  "https://compre.vc/aI5Y0gg8RE01";

const LOJAS_REDE_STORE_URL =
  "https://compre.vc/aI5Y0gg8RE01";

const SIENO_STORE_URL =
  "https://compre.vc/GBUaEiswDUZE";

const BIOVITTARE_STORE_URL =
  "https://acesse.vc/Coanj81qEbhD";

const AMAKHA_STORE_URL =
  "https://acesse.vc/pAXYPEv9XW5p";

const CACAU_SHOW_STORE_URL =
  "https://compre.vc/chUDdUuBAOBU";

const COLOMBO_STORE_URL =
  "https://compre.vc/AlHR2L4TKTp6";

const CASA_ALIANCAS_STORE_URL =
  "https://compre.vc/xdp3aJFYUjbC";

const CICATRISSIM_STORE_URL =
  "https://compre.vc/smGApyfu2sBV";

const GAZIN_STORE_URL =
  "https://compre.vc/VaG6z8w2of4n";

const HIPERVAREJO_STORE_URL =
  "https://compre.vc/EIa6BAdRE5iN";

const KOMO_STORE_URL =
  "https://compre.vc/zEIrFZlxguEa";

const LALUNA_STORE_URL =
  "https://compre.vc/Iklt4z7TkZ9J";

const FREEWAY_STORE_URL =
  "https://compre.vc/YeuMj5D8FEN9";

const LELOYN_STORE_URL =
  "https://compre.vc/sxyzhqgxYK8N";

const MALWEE_STORE_URL =
  "https://compre.vc/D3ol81KqIMQU";

const SAWARY_STORE_URL =
  "https://acesse.vc/4k1A900Oi3Xv";

const MARIA_VALENTINA_STORE_URL =
  "https://compre.vc/iwPEuqNJcNix";

const FATOR5_STORE_URL =
  "https://compre.vc/bhDFUSLisjnF";

const PROMOFARMA_STORE_URL =
  "https://compre.vc/kXrmMU2SrwYh";

const ESTACIO_URL =
  "https://estacio.br/selecao?cod_agente=14369444&u=804215&end=1";

const EDUCATION_PARTNERS = [
  {
    id: "estacio",
    name: "Estácio",
    symbol: "◇",
    category: "GRADUAÇÃO, PÓS E CURSOS",
    title: "Escolha seu próximo passo",
    action: "CONHECER CURSOS ›",
    url: ESTACIO_URL
  },
  {
    id: "wyden",
    name: "Wyden",
    symbol: "W",
    category: "GRADUAÇÃO, PÓS E CURSOS TÉCNICOS",
    title: "Formação para transformar sua carreira",
    action: "CONHECER CURSOS ›",
    url: "https://wyden.com.br/selecao?cod_agente=14369444&u=805310&end=1"
  },
  {
    id: "uninter",
    name: "Uninter",
    symbol: "U",
    category: "PRESENCIAL, SEMIPRESENCIAL E EAD",
    title: "Estude com flexibilidade onde estiver",
    action: "VER OPÇÕES DE CURSOS ›",
    url: "https://fichadeinscricao.uninter.com/Inscricoes/Hash/70DgPqJpvjeEXJznyJXfu44e744BN1zPIXnEKsZszmFvRv1J-jy9YsxcfRbl17W0EpcUpmrhwFI"
  },
  {
    id: "unifatecie",
    name: "UniFatecie",
    symbol: "UF",
    category: "GRADUAÇÃO, PÓS E SEGUNDA GRADUAÇÃO",
    title: "Escolha sua formação presencial ou EAD",
    action: "CONHECER CURSOS ›",
    url: "https://afiliado.saberemrede.net/services?type=D&institution=UNIFATECIE%20-%20Consultores&campaign=unifatecie&&buyer=94410&campaign=unifatecie&shared=true"
  },
  {
    id: "idomed",
    name: "IDOMED",
    symbol: "+",
    category: "MEDICINA, ODONTOLOGIA E PÓS",
    title: "Formação para cuidar e transformar vidas",
    action: "CONHECER CURSOS ›",
    url: "https://www.idomed.com.br/selecao?cod_agente=14369444&u=805477"
  }
];

const PARTNER_PRODUCTS = {
  pravaler: {
    name: "Financiamento estudantil",
    partner: "Pravaler",
    logoText: "Pravaler",
    logoTone: "pravaler",
    url: "https://afiliado.saberemrede.net/checkout-pravaler/313855?sponsor=805324&e=1",
    button: "SIMULAR FINANCIAMENTO",
    eyebrow: "FINANCIAMENTO ESTUDANTIL",
    heading: "Simule seu financiamento para a faculdade",
    note: "Você será direcionado ao Pravaler. A análise, as condições e a contratação são de responsabilidade do Pravaler."
  },

  inss: {
    name: "Consignado INSS",
    partner: "Banco BRB",
    logo: "/partners/brb.jpeg",
    url: "https://solution.consig360.com.br/self-hire/EkCwaEb",
    button: "SIMULAR SEU CRÉDITO"
  },

  bpc: {
    name: "Consignado BPC / LOAS",
    partner: "Banco BRB",
    logo: "/partners/brb.jpeg",
    url: "https://solution.consig360.com.br/self-hire/EkCwaEb",
    button: "SIMULAR SEU CRÉDITO"
  },

  fgts: {
    name: "Antecipação do FGTS",
    partner: "Grandino Bank",
    logo: "/partners/grandino.png",
    url: "https://crediti.startcapital.app/credit/fgts",
    button: "SIMULAR SEU CRÉDITO"
  },

  energia: {
    name: "Crédito na conta de luz",
    partner: "Crefaz",
    logo: "/partners/crefaz.jpeg",
    url: "https://crediti.startcapital.app/credit/cdccontadeluz",
    button: "SIMULAR SEU CRÉDITO"
  },

  clt: {
    name: "Consignado CLT",
    partner: "Grandino Bank",
    logo: "/partners/grandino.png",
    url: "https://crediti.startcapital.app/credit/cltctps",
    button: "SIMULAR SEU CRÉDITO"
  },

  cartao: {
    name: "Empréstimo no cartão de crédito",
    partner: "Plataforma GYROO SaaS",
    logo: "/partners/gyroo.png",
    url: "https://crediti.emprestimodisponivel.com.br/?l=EW9XMSWNPMR8&u=uCwu5cFx4n6t",
    button: "SIMULAR SEU CRÉDITO"
  },

  "santander-pf": {
    name: "Conta Santander PF",
    partner: "Santander",
    logoText: "Santander",
    logoTone: "santander",
    url: "https://acesse.vc/wYzJqgRxYyeV",
    button: "ABRIR CONTA NO SANTANDER",
    eyebrow: "ABERTURA ONLINE",
    heading: "Abra sua conta diretamente no Santander",
    note: "Você será direcionado ao ambiente do Santander. A abertura da conta está sujeita à análise e aprovação cadastral do banco."
  },

};

const ANALYSTS = {
  samila: {
    name: "Samila",
    title: "Analista Samila",
    whatsapp: "5585994409719"
  },

  marcelino: {
    name: "Marcelino",
    title: "Analista Marcelino",
    whatsapp: "5585992032558"
  }
};

const products = [
  {
    id: "pravaler",
    name: "Financiamento estudantil",
    typeLabel: "FINANCIAMENTO PARA ESTUDAR",
    what:
      "É um financiamento estudantil privado que permite dividir o valor de um semestre da faculdade em mais parcelas.",
    forWho:
      "Calouros ou alunos que já estão matriculados em uma instituição participante e precisam reduzir o valor pago por mês.",
    how:
      "A pessoa escolhe a faculdade e o curso, faz a simulação online e envia os dados para análise da instituição parceira.",
    when:
      "Pode ajudar quem deseja começar ou continuar a faculdade e precisa de mais tempo para pagar as mensalidades.",
    tip:
      "Antes de contratar, confira o valor total, a taxa, o prazo e se as parcelas continuam cabendo no seu orçamento."
  },

  {
    id: "inss",
    name: "Consignado INSS",
    what:
      "Crédito para aposentados e pensionistas do INSS, com parcelas descontadas do benefício.",
    forWho:
      "Aposentados e pensionistas que querem verificar uma possibilidade de crédito.",
    how:
      "A Crediti faz uma análise inicial. A regra cadastrada atualmente considera idade de até 72 anos.",
    when:
      "Pode ajudar em uma necessidade específica ou na organização de despesas.",
    tip:
      "Não comprometa uma parte grande do benefício. A parcela precisa continuar confortável todo mês."
  },

  {
    id: "bpc",
    name: "BPC / LOAS",
    what:
      "Possibilidade de crédito analisada para quem recebe BPC/LOAS.",
    forWho:
      "Para quem recebe o próprio benefício e deseja verificar uma opção disponível.",
    how:
      "A Crediti faz uma análise inicial. Não atendemos representante legal nem casos de curatela.",
    when:
      "Pode ajudar quando o beneficiário precisa resolver uma necessidade financeira.",
    tip:
      "O benefício costuma pagar despesas essenciais. Evite assumir uma parcela que aperte o orçamento."
  },

  {
    id: "clt",
    name: "Consignado CLT",
    what:
      "Crédito voltado para trabalhadores com carteira assinada.",
    forWho:
      "Para quem trabalha registrado e quer verificar uma possibilidade de crédito.",
    how:
      "A regra cadastrada considera idade mínima de 22 anos e pelo menos 12 meses de carteira assinada.",
    when:
      "Pode ajudar em uma despesa necessária ou na reorganização financeira.",
    tip:
      "Veja se a parcela continuará cabendo no orçamento mesmo quando aparecer uma despesa inesperada."
  },

  {
    id: "bolsa",
    name: "Crédito Bolsa Família",
    what:
      "Possibilidade de crédito analisada para beneficiários do Bolsa Família.",
    forWho:
      "Maiores de 18 anos que recebem pelo Caixa Tem e querem verificar condições disponíveis.",
    how:
      "É necessário receber pelo Caixa Tem há pelo menos 30 dias e não possuir outro contrato ativo dessa modalidade.",
    when:
      "Pode ajudar em uma necessidade específica quando a parcela cabe no orçamento.",
    tip:
      "Não comprometa o dinheiro necessário para alimentação, água, energia e outras despesas da casa."
  },

  {
    id: "fgts",
    name: "FGTS",
    what:
      "Possibilidade de usar valores relacionados ao seu FGTS.",
    forWho:
      "Para quem possui saldo e acesso ao aplicativo FGTS.",
    how:
      "É necessário ter acesso ao aplicativo e saque-aniversário ativado.",
    when:
      "Pode ser uma alternativa para quem precisa de dinheiro e possui saldo disponível.",
    tip:
      "Use seu FGTS com objetivo claro. Esse dinheiro também pode ser importante no futuro."
  },

  {
    id: "cartao",
    name: "Crédito no cartão",
    what:
      "Possibilidade de transformar parte do limite disponível do cartão em dinheiro, conforme análise.",
    forWho:
      "Para quem é titular do cartão e possui limite disponível.",
    how:
      "O cartão utilizado precisa estar no nome da própria pessoa.",
    when:
      "Pode ajudar em uma necessidade pontual.",
    tip:
      "Limite não é dinheiro sobrando. Veja o custo antes de transformar o cartão em dívida."
  },

  {
    id: "energia",
    name: "Crédito na conta de luz",
    what:
      "Modalidade de crédito que considera a titularidade e o histórico da conta de energia.",
    forWho:
      "Para quem possui conta de luz no próprio nome.",
    how:
      "A regra cadastrada considera conta no nome do cliente há pelo menos 6 meses e idade mínima de 22 anos.",
    when:
      "Pode ser uma alternativa para quem precisa verificar uma opção de crédito.",
    tip:
      "Energia é despesa essencial. A nova obrigação não pode dificultar o pagamento das contas da casa."
  },

  {
    id: "garantia",
    name:
      "Crédito com garantia (carro ou moto)",
    what:
      "Crédito para quem já possui carro ou moto e deseja usar o veículo como garantia.",
    forWho:
      "Para quem já tem veículo no próprio nome e precisa de dinheiro.",
    how:
      "O veículo precisa estar no nome da pessoa, apto a rodar, com documentação regularizável e CPF sem restrição. Esta opção está disponível em todo o Brasil.",
    when:
      "Pode fazer sentido para quem possui um veículo e precisa levantar dinheiro.",
    tip:
      "Seu veículo é um patrimônio. Só use como garantia se tiver segurança para pagar as parcelas."
  },

  {
    id: "financiamento-carro",
    name: "Financiamento de carro",
    what:
      "Uma forma de comprar um carro agora e pagar o valor financiado em parcelas.",
    forWho:
      "Para quem precisa comprar um carro e não vai pagar todo o valor à vista.",
    how:
      "A regra inicial cadastrada considera CPF sem restrição, score a partir de 700, documentação e transferência. Disponível em Itapajé, Irauçuba e Uruburetama.",
    when:
      "Pode fazer sentido para quem precisa do veículo agora.",
    tip:
      "Não olhe apenas a parcela. Considere entrada, prazo e quanto ela representa da sua renda."
  },

  {
    id: "financiamento-moto",
    name: "Financiamento de moto",
    what:
      "Uma forma de comprar uma moto agora e pagar o valor financiado em parcelas.",
    forWho:
      "Para quem precisa ou deseja comprar uma moto.",
    how:
      "A regra inicial cadastrada considera CPF sem restrição, score a partir de 700, documentação e transferência. Disponível em Itapajé, Irauçuba e Uruburetama.",
    when:
      "Pode ser útil para trabalho, locomoção ou necessidade pessoal.",
    tip:
      "Além da parcela, considere combustível, manutenção, documentação e seguro."
  },

  {
    id: "seguro",
    name: "Seguro Auto",
    what:
      "Proteção para carro ou moto conforme as coberturas contratadas.",
    forWho:
      "Para quem possui veículo e quer reduzir o impacto financeiro de determinados imprevistos.",
    how:
      "As condições dependem do plano e da análise. O condutor principal deve possuir CNH.",
    when:
      "Pode fazer sentido principalmente para quem depende do veículo no dia a dia.",
    tip:
      "Não escolha apenas pelo preço. Veja quais situações realmente estão cobertas."
  },

  {
    id: "consorcio-carro",
    name: "Consórcio de carro",
    what:
      "Forma planejada de comprar um carro através de um grupo de consórcio.",
    forWho:
      "Para quem quer comprar um carro, mas pode esperar pela contemplação.",
    how:
      "O participante entra no grupo e aguarda a contemplação conforme as regras. Precisa estar com o nome limpo quando contemplado.",
    when:
      "Pode fazer sentido para quem consegue planejar a compra.",
    tip:
      "Não entre contando com contemplação imediata. Consórcio exige planejamento."
  },

  {
    id: "consorcio-moto",
    name: "Consórcio de moto",
    what:
      "Forma planejada de adquirir uma moto através de consórcio.",
    forWho:
      "Para quem quer uma moto, mas pode esperar pela contemplação.",
    how:
      "O participante entra no grupo e segue as regras de contemplação.",
    when:
      "Pode ser uma alternativa para uma compra futura planejada.",
    tip:
      "Se precisa da moto agora, compare com financiamento. Se pode esperar, avalie o consórcio."
  },

  {
    id: "consorcio-pesado",
    name:
      "Consórcio de caminhão pesado",
    what:
      "Consórcio voltado para aquisição de caminhões e veículos pesados.",
    forWho:
      "Para quem trabalha ou pretende trabalhar com transporte e consegue planejar a compra.",
    how:
      "O participante entra no grupo e aguarda a contemplação. Precisa estar com o nome limpo quando contemplado.",
    when:
      "Pode fazer sentido para uma aquisição planejada de veículo pesado.",
    tip:
      "Inclua combustível, manutenção, seguro e demais custos do caminhão no seu planejamento."
  },

  {
    id: "consorcio-servicos",
    name: "Consórcio de serviços",
    what:
      "Consórcio usado para contratar determinados serviços.",
    forWho:
      "Para quem deseja planejar financeiramente um serviço futuro.",
    how:
      "Depois da contemplação, deve seguir as regras da administradora e apresentar nota fiscal.",
    when:
      "Pode ajudar em projetos que não precisam ser realizados imediatamente.",
    tip:
      "Defina quanto realmente precisa antes de escolher o valor da carta."
  },

  {
    id: "santander-pf",
    name: "Conta Santander PF",
    typeLabel: "CONTA PARA VOCÊ",
    what:
      "Abertura de conta para pessoa física no Santander, com acesso aos serviços disponíveis após aprovação do banco.",
    forWho:
      "Pessoas físicas que desejam solicitar uma conta Santander.",
    how:
      "Toque no botão para continuar diretamente no Santander. A abertura está sujeita à análise e aprovação cadastral do banco.",
    when:
      "Pode ajudar a organizar recebimentos, pagamentos e movimentações do dia a dia em uma conta pessoal.",
    tip:
      "Antes de concluir, confira as condições, tarifas e serviços incluídos na conta escolhida."
  },

];

const DIRECT_PRODUCT_KEYS = [
  "pravaler",
  "inss",
  "bpc",
  "fgts",
  "clt",
  "cartao",
  "energia"
];

const CREDIT_FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "beneficio", label: "Benefícios" },
  { id: "trabalhador", label: "Trabalhador" },
  { id: "estudante", label: "Estudante" },
  { id: "outros", label: "Outras opções" }
];

const CREDIT_META = {
  pravaler: {
    category: "estudante",
    audience: "Para quem quer iniciar ou continuar uma faculdade.",
    detail: "Financiamento estudantil contratado no ambiente da instituição parceira."
  },
  inss: {
    category: "beneficio",
    audience: "Aposentados e pensionistas do INSS.",
    detail: "Consignado com análise e contratação no Banco BRB."
  },
  bpc: {
    category: "beneficio",
    audience: "Pessoas que recebem BPC/LOAS.",
    detail: "Consignado sujeito às regras e análise do Banco BRB."
  },
  fgts: {
    category: "trabalhador",
    audience: "Trabalhadores com saldo disponível no FGTS.",
    detail: "Antecipação do saque-aniversário pelo Grandino Bank."
  },
  clt: {
    category: "trabalhador",
    audience: "Trabalhadores com carteira assinada.",
    detail: "Crédito sujeito às regras e análise do Grandino Bank."
  },
  cartao: {
    category: "outros",
    audience: "Pessoas que possuem limite disponível no cartão.",
    detail: "Operação realizada pela plataforma GYROO SaaS."
  },
  energia: {
    category: "outros",
    audience: "Titulares de conta de energia elegíveis.",
    detail: "Crédito analisado e contratado no ambiente da Crefaz."
  }
};

const normalizeAppSearch = (value) =>
  value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const makeSearchKey = (type, value) =>
  "search-" +
  type +
  "-" +
  normalizeAppSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const isSearchWordClose = (
  first,
  second
) => {
  if (first === second) {
    return true;
  }

  if (
    Math.abs(
      first.length - second.length
    ) > 1
  ) {
    return false;
  }

  let left = 0;
  let right = 0;
  let changes = 0;

  while (
    left < first.length &&
    right < second.length
  ) {
    if (first[left] === second[right]) {
      left += 1;
      right += 1;
      continue;
    }

    changes += 1;

    if (changes > 1) {
      return false;
    }

    if (first.length > second.length) {
      left += 1;
    } else if (
      second.length > first.length
    ) {
      right += 1;
    } else {
      left += 1;
      right += 1;
    }
  }

  return true;
};

const SHOP_SEARCH_URLS = {
  Shopee: SHOPEE_STORE_URL,
  Amazon: AMAZON_STORE_URL,
  Magalu: MAGALU_STORE_URL,
  Gazin: GAZIN_STORE_URL,
  Itatiaia: ITATIAIA_STORE_URL,
  Electrolux: ELECTROLUX_STORE_URL,
  Polishop: POLISHOP_STORE_URL,
  Xiaomi: XIAOMI_STORE_URL,
  "Loja do Mecânico": LOJA_MECANICO_STORE_URL,
  Hipervarejo: HIPERVAREJO_STORE_URL,
  SHEIN: SHEIN_STORE_URL,
  "C&A": CEA_STORE_URL,
  "Camisaria Colombo": COLOMBO_STORE_URL,
  Malwee: MALWEE_STORE_URL,
  "Sawary Jeans": SAWARY_STORE_URL,
  "Maria Valentina": MARIA_VALENTINA_STORE_URL,
  "La Luna": LALUNA_STORE_URL,
  BabyStock: BABYSTOCK_STORE_URL,
  "Toy Mania": TOY_MANIA_STORE_URL,
  "Kidy Calçados": KIDY_STORE_URL,
  Freeway: FREEWAY_STORE_URL,
  Natura: NATURA_STORE_URL,
  Avon: AVON_STORE_URL,
  "Lojas Rede": LOJAS_REDE_STORE_URL,
  Amokarité: AMOKARITE_STORE_URL,
  "Sieno Perfumes": SIENO_STORE_URL,
  "Le Loyn Parfums": LELOYN_STORE_URL,
  "Fator 5": FATOR5_STORE_URL,
  "Amakha Paris": AMAKHA_STORE_URL,
  Biovittare: BIOVITTARE_STORE_URL,
  Promofarma: PROMOFARMA_STORE_URL,
  "Komo Wellness": KOMO_STORE_URL,
  Cicatrissim: CICATRISSIM_STORE_URL,
  "Cacau Show": CACAU_SHOW_STORE_URL,
  TodoVino: TODOVINO_STORE_URL,
  "Casa das Alianças": CASA_ALIANCAS_STORE_URL
};

const SHOP_SEARCH_ITEMS = [
  ["Shopee", ".shopee-store-card", "achadinhos compras ofertas"],
  ["Amazon", ".amazon-store-card", "produtos compras ofertas"],
  ["Magalu", ".magalu-store-card", "magazine luiza eletrodomésticos eletrônicos"],
  ["Gazin", ".gazin-store-card", "móveis eletrodomésticos casa"],
  ["Itatiaia", ".itatiaia-store-card", "móveis cozinhas armários casa"],
  ["Electrolux", ".electrolux-store-card", "eletrodomésticos geladeira fogão lavadora"],
  ["Polishop", ".polishop-store-card", "casa cozinha beleza saúde"],
  ["Xiaomi", ".xiaomi-store-card", "celular smartphone eletrônicos"],
  ["Loja do Mecânico", ".mecanico-store-card", "ferramentas oficina equipamentos"],
  ["Hipervarejo", ".hipervarejo-store-card", "autopeças pneus carro moto"],
  ["SHEIN", ".shein-store-card", "roupas moda acessórios"],
  ["C&A", ".cea-store-card", "roupas moda cupom"],
  ["Camisaria Colombo", ".colombo-store-card", "roupas moda masculina"],
  ["Malwee", ".malwee-store-card", "roupas moda"],
  ["Sawary Jeans", ".sawary-store-card", "roupas jeans moda"],
  ["Maria Valentina", ".mariavalentina-store-card", "roupas moda feminina"],
  ["La Luna", ".laluna-store-card", "roupas moda feminina"],
  ["BabyStock", ".babystock-store-card", "bebê infantil roupas"],
  ["Toy Mania", ".toymania-store-card", "brinquedos crianças"],
  ["Kidy Calçados", ".kidy-store-card", "calçados sapatos infantil cupom"],
  ["Freeway", ".freeway-store-card", "calçados sapatos"],
  ["Natura", ".natura-store-card", "perfumes cosméticos beleza"],
  ["Avon", ".avon-store-card", "perfumes cosméticos beleza"],
  ["Lojas Rede", ".lojasrede-store-card", "perfumes cosméticos beleza"],
  ["Amokarité", ".amokarite-store-card", "perfumes cosméticos beleza"],
  ["Sieno Perfumes", ".sieno-store-card", "perfumes fragrâncias"],
  ["Le Loyn Parfums", ".leloyn-store-card", "perfumes fragrâncias"],
  ["Fator 5", ".fator5-store-card", "perfumes cosméticos beleza"],
  ["Amakha Paris", ".amakha-store-card", "perfumes cosméticos beleza"],
  ["Biovittare", ".biovittare-store-card", "farmácia manipulação saúde"],
  ["Promofarma", ".promofarma-store-card", "farmácia medicamentos saúde"],
  ["Komo Wellness", ".komo-store-card", "saúde bem estar wellness"],
  ["Cicatrissim", ".cicatrissim-store-card", "pele beleza cuidados"],
  ["Cacau Show", ".cacau-store-card", "chocolate presentes"],
  ["TodoVino", ".todovino-store-card", "vinhos bebidas"],
  ["Casa das Alianças", ".aliancas-store-card", "alianças joias presentes"]
].map(([title, targetSelector, keywords]) => ({
  title,
  targetSelector,
  keywords,
  externalUrl: SHOP_SEARCH_URLS[title]
}));

const APP_SEARCH_ITEMS = [
  {
    title: "Minha Crediti",
    description: "Favoritos, histórico, comparações e contas salvas neste aparelho",
    screen: "myCrediti",
    keywords: "minha crediti favorito favoritos historico recente continue comparação comparacoes salvos"
  },
  {
    title: "Organizador de contas",
    description: "Crie lembretes locais para datas de vencimento",
    screen: "organizer",
    keywords: "conta contas organizar vencimento vencimentos pagar pagamento lembrete alerta boleto aluguel energia internet"
  },
  {
    title: "Crediti Protege",
    description: "Aprenda a reconhecer golpes e acessar canais oficiais",
    screen: "protect",
    keywords: "seguranca golpe golpes fraude pix senha proteger proteção antecipado oficial"
  },
  {
    title: "Caminhos Crediti",
    description: "Crédito, educação, empresas, serviços e compras conectados",
    screen: "journeys",
    keywords: "caminho caminhos necessidade resolver carro moto aposentado faculdade estudar empresa loja comprar"
  },
  {
    title: "Central do Empresário",
    description: "Conta PJ, saúde empresarial, site e divulgação",
    screen: "business",
    keywords: "empresa empresario negócio negocios mei pj lojista loja cnpj conta empresarial divulgar hospedagem site"
  },
  {
    title: "Converse com a Crediti IA",
    description: "Tire dúvidas e encontre o caminho certo dentro do aplicativo",
    screen: "credit",
    action: "chat",
    keywords: "ia inteligencia artificial conversar conversa falar duvida ajuda orientação atendimento"
  },
  {
    title: "Atendimento com a Crediti",
    description: "Fale com um analista da equipe pelo WhatsApp",
    screen: "human",
    keywords: "atendimento atendente analista humano pessoa whatsapp falar ajuda samila marcelino"
  },
  {
    title: "Renda Extra Crediti",
    description: "Conheça o programa para parceiros da Crediti",
    screen: "partner",
    keywords: "parceiro parceria renda extra indicar indicação comissão trabalhar cadastro"
  },
  {
    title: "Crédito para aposentados",
    description: "Consignado INSS e opções para beneficiários BPC/LOAS",
    screen: "direct",
    directProductKey: "inss",
    keywords: "aposentado aposentados pensionista pensionistas idoso idosos inss beneficio beneficiario bpc loas consignado"
  },
  {
    title: "Crédito para trabalhador",
    description: "CLT, antecipação do FGTS, cartão e conta de energia",
    screen: "direct",
    keywords: "trabalhador trabalhadores empregado carteira assinada clt fgts saque aniversario cartao energia conta luz"
  },
  {
    title: "Faculdade e financiamento estudantil",
    description: "Faculdades, cursos e financiamento estudantil",
    screen: "learn",
    keywords: "faculdade faculdades curso cursos estudar estudo estudante vestibular graduacao pravaler estacio uninter wyden idomed unifatecie"
  },
  {
    title: "Soluções para empresas",
    description: "Conta PJ, divulgação, hospedagem e serviços empresariais",
    screen: "services",
    keywords: "empresa empresas empresario empresarios lojista lojistas mei cnpj pj negócio negocios cora santander hostinger kinghost tiktok"
  },
  {
    title: "Simular crédito",
    description: "INSS, BPC, CLT, FGTS, cartão, energia e estudante",
    screen: "direct",
    keywords: "credito emprestimo dinheiro simular inss aposentado pensionista bpc loas clt trabalhador fgts cartao energia pravaler estudante faculdade"
  },
  {
    title: "Aprenda com a Crediti",
    description: "Educação financeira, segurança e oportunidades de estudo",
    screen: "learn",
    keywords: "aprender dica golpe seguranca fraude orçamento divida faculdade curso estudo educacao economia organizar conta contas"
  },
  {
    title: "Serviços úteis",
    description: "Serviços oficiais e soluções para empresas",
    screen: "services",
    keywords: "serviço receita federal banco central gov inss fgts detran empresa mei pj cora santander hostinger kinghost tiktok"
  },
  {
    title: "Crediti Shop",
    description: "Lojas, produtos, categorias, cupons e parceiros",
    screen: "shop",
    keywords: "loja lojas comprar compra shop cupom desconto oferta shopee magalu shein amazon babystock toy mania kidy xiaomi itatiaia electrolux natura avon cea loja do mecanico polishop todovino amokarite lojas rede sieno biovittare amakha cacau show colombo casa das aliancas cicatrissim gazin hipervarejo komo wellness laluna freeway le loyn malwee sawary maria valentina fator 5 promofarma roupa moda calcado sapato perfume beleza cosmetico eletrodomestico geladeira fogao brinquedo ferramenta vinho chocolate"
  },
  {
    title: "Conheça nossos produtos",
    description: "Entenda regras e cuidados antes de decidir",
    screen: "products",
    keywords: "produto produtos regra condicao como funciona credito financiamento refinanciamento seguro consorcio carro moto veiculo"
  }
];

const CHAT_ROUTE_LABELS = {
  learn: ["Ver faculdades e cursos", "Conheça opções de estudo"],
  services: ["Abrir serviços", "Acesse serviços úteis"],
  shop: ["Abrir Crediti Shop", "Veja lojas e produtos"],
  partner: ["Conhecer Renda Extra", "Cadastre-se como parceiro"],
  myCrediti: ["Abrir Minha Crediti", "Favoritos, histórico e contas"],
  protect: ["Abrir Crediti Protege", "Veja como evitar golpes"],
  organizer: ["Organizar minhas contas", "Cadastre datas e vencimentos"],
  business: ["Abrir Central do Empresário", "Soluções para empresas e MEI"]
};

const PRODUCT_VISUALS = {
  pravaler: {
    label: "Financie sua faculdade com parcelas que cabem no orçamento.",
    tone: "purple"
  },
  inss: {
    label: "Crédito consignado para aposentados e pensionistas.",
    tone: "yellow"
  },
  bpc: {
    label: "Opção de crédito para beneficiários BPC/LOAS.",
    tone: "soft-yellow"
  },
  clt: {
    label: "Crédito para quem trabalha com carteira assinada.",
    tone: "blue"
  },
  bolsa: {
    label: "Conheça a opção disponível para beneficiários do programa.",
    tone: "green"
  },
  fgts: {
    label: "Antecipe parcelas do seu saque-aniversário.",
    tone: "green"
  },
  cartao: {
    label: "Transforme o limite do cartão em crédito.",
    tone: "purple"
  },
  energia: {
    label: "Crédito com pagamento pela conta de energia.",
    tone: "yellow"
  },
  garantia: {
    label: "Use seu carro ou sua moto como garantia.",
    tone: "blue"
  },
  "financiamento-carro": {
    label: "Financie seu carro com taxas e parcelas acessíveis agora.",
    tone: "yellow"
  },
  "financiamento-moto": {
    label: "Financie sua moto com taxas e parcelas acessíveis agora.",
    tone: "orange"
  },
  seguro: {
    label: "Proteja seu carro ou sua moto de forma simples.",
    tone: "blue"
  },
  "consorcio-carro": {
    label: "Planeje a compra do seu próximo carro.",
    tone: "soft-yellow"
  },
  "consorcio-moto": {
    label: "Planeje a compra da sua próxima moto.",
    tone: "orange"
  },
  "consorcio-pesado": {
    label: "Consórcio para caminhões e veículos pesados.",
    tone: "blue"
  },
  "consorcio-servicos": {
    label: "Planeje projetos e serviços com consórcio.",
    tone: "purple"
  },

  "santander-pf": {
    label: "Abra sua conta Santander para pessoa física.",
    tone: "red"
  }
};

const LEARN_ARTICLES = [
  {
    id: "dividas",
    title: "Como organizar suas dívidas",
    category: "Educação financeira",
    summary: "Veja por onde começar quando as contas apertarem.",
    points: [
      "Anote todas as dívidas, parcelas e vencimentos.",
      "Priorize moradia, alimentação, água e energia.",
      "Negocie primeiro as dívidas com juros mais altos.",
      "Não aceite uma parcela que não caiba no orçamento."
    ]
  },
  {
    id: "comparar",
    title: "Como comparar um empréstimo",
    category: "Crédito responsável",
    summary: "A menor parcela nem sempre representa o menor custo.",
    points: [
      "Compare o valor total que será pago.",
      "Confira juros, prazo, tarifas e seguros incluídos.",
      "Leia as condições antes de assinar.",
      "Escolha uma parcela confortável para sua renda."
    ]
  },
  {
    id: "golpes",
    title: "Proteja-se de golpes",
    category: "Segurança",
    summary: "Aprenda a reconhecer promessas e cobranças suspeitas.",
    points: [
      "Nunca pague valor antecipado para liberar crédito.",
      "Não compartilhe senhas ou códigos recebidos por SMS.",
      "Confirme o endereço do site antes de preencher dados.",
      "Desconfie de aprovação garantida e urgência exagerada."
    ]
  },
  {
    id: "reserva",
    title: "Comece sua reserva",
    category: "Economia",
    summary: "Guardar um pouco por mês já cria proteção para imprevistos.",
    points: [
      "Comece com um valor que consiga manter.",
      "Separe o dinheiro assim que receber.",
      "Evite usar a reserva em compras comuns.",
      "Aumente o valor guardado quando sua renda permitir."
    ]
  },
  {
    id: "juros",
    title: "Entenda juros e parcelas",
    category: "Educação financeira",
    summary: "Prazo maior reduz a parcela, mas pode aumentar o custo total.",
    points: [
      "Confira quantas parcelas serão pagas.",
      "Pergunte pelo custo total da operação.",
      "Compare propostas com o mesmo valor e prazo.",
      "Considere outras despesas que vencem todo mês."
    ]
  },
  {
    id: "quando-ajuda",
    title: "Quando o crédito pode ajudar",
    category: "Crédito responsável",
    summary: "Crédito deve resolver uma necessidade sem criar um problema maior.",
    points: [
      "Tenha um objetivo claro para o dinheiro.",
      "Verifique se a parcela cabe depois das despesas essenciais.",
      "Evite contratar por impulso.",
      "Se estiver em dúvida, converse com um analista."
    ]
  }
];

const SERVICE_GROUPS = [
  {
    title: "Serviços e produtos para lojistas e empresas",
    items: [
      {
        name: "TikTok para Empresas",
        description: "Crie sua conta de anúncios e divulgue sua loja, serviço ou empresa no TikTok.",
        url: "https://getstartedtiktok.partnerlinks.io/2bvjzvpuq4hy",
        action: "COMEÇAR ›"
      },
      {
        name: "Conta PJ Cora",
        description: "Abra sua conta digital PJ grátis e solicite um cartão de crédito empresarial, sujeito à análise da Cora.",
        url: "https://conta.cora.com.br/r/conta-digital/?convite=HM74R&i=MjgxMTU0NTQwMDAxMjc=&n=TWFyY2VsaW5v",
        action: "ABRIR CONTA ›"
      },
      {
        name: "Conta PJ Santander",
        description: "Abra sua conta empresarial. Disponível neste link para MEI, EI, EIRELI e LTDA, sujeito à análise do Santander.",
        url: "https://acesse.vc/uAfF2PJlJ2kU",
        action: "ABRIR CONTA PJ ›"
      },
      {
        name: "Bradesco Saúde Empresarial",
        description: "Plano de saúde exclusivo para empresas com CNPJ, de pequenos negócios a grandes operações.",
        url: "https://acesse.vc/hebvpzvVIoLn",
        action: "CONHECER O PLANO ›"
      },
      {
        name: "KingHost",
        description: "Crie seu site, registre seu domínio e tenha um e-mail profissional para sua empresa.",
        url: "https://king.host?ref=79E443DAF29A6",
        action: "CONHECER SOLUÇÕES ›"
      },
      {
        name: "Hostinger",
        description: "Crie seu site, registre seu domínio, contrate hospedagem e use e-mail profissional.",
        url: "https://compre.vc/UQB14aWvWkUs",
        action: "CONHECER HOSTINGER ›"
      }
    ]
  },
  {
    title: "Entretenimento e streaming",
    items: [
      {
        name: "Prime Video",
        description: "Filmes, séries e produções para assistir quando quiser.",
        url: "https://acesse.vc/SFSkjNoGG0FM",
        action: "CONHECER PRIME VIDEO ›"
      },
      {
        name: "Disney+",
        description: "Filmes, séries e conteúdos Disney, Pixar, Marvel, Star Wars e muito mais.",
        url: "https://acesse.vc/1zdftKvafBQ8",
        action: "CONHECER DISNEY+ ›"
      }
    ]
  },
  {
    title: "Receita Federal",
    items: [
      {
        name: "Situação cadastral do CPF",
        description: "Consulta feita no site oficial da Receita.",
        url: "https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp"
      },
      {
        name: "Consulta e comprovante de CNPJ",
        description: "Consulte os dados públicos de uma empresa.",
        url: "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp"
      },
      {
        name: "Redesim",
        description: "Serviços oficiais para empresas e negócios.",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/redesim"
      },
      {
        name: "Portal da Receita Federal",
        description: "Imposto de renda, pendências, certidões e outros serviços.",
        url: "https://servicos.receitafederal.gov.br/"
      }
    ]
  },
  {
    title: "Banco Central",
    items: [
      {
        name: "Registrato",
        description: "Consulte relacionamentos e operações no sistema financeiro.",
        url: "https://registrato.bcb.gov.br/registrato/login/"
      },
      {
        name: "Valores a Receber",
        description: "Verifique se existe dinheiro esquecido em instituições.",
        url: "https://valoresareceber.bcb.gov.br/publico"
      },
      {
        name: "Calculadora do Cidadão",
        description: "Faça cálculos e simulações financeiras.",
        url: "https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores"
      },
      {
        name: "Instituições autorizadas",
        description: "Confira empresas supervisionadas pelo Banco Central.",
        url: "https://www.bcb.gov.br/meubc/encontreinstituicao"
      }
    ]
  },
  {
    title: "Consumidor",
    items: [
      {
        name: "Serasa",
        description: "Consulte score, dívidas e opções de negociação no Serasa.",
        url: "https://www.serasa.com.br/"
      },
      {
        name: "Consumidor.gov.br",
        description: "Canal público para solucionar problemas de consumo.",
        url: "https://www.consumidor.gov.br/"
      },
      {
        name: "Procon Ceará",
        description: "Orientações e serviços de defesa do consumidor.",
        url: "https://www.proconceara.ce.gov.br/"
      },
      {
        name: "Não Me Perturbe",
        description: "Bloqueie ligações de ofertas das empresas participantes.",
        url: "https://www.naomeperturbe.com.br/"
      }
    ]
  },
  {
    title: "Portais oficiais",
    items: [
      {
        name: "Meu INSS",
        description: "Serviços e informações do seu benefício.",
        url: "https://meu.inss.gov.br/"
      },
      {
        name: "Aplicativo FGTS",
        description: "Informações oficiais da Caixa sobre o aplicativo.",
        url: "https://www.caixa.gov.br/atendimento/aplicativos/fgts/Paginas/default.aspx"
      },
      {
        name: "Gov.br",
        description: "Acesso aos serviços digitais do Governo Federal.",
        url: "https://www.gov.br/"
      },
      {
        name: "Caixa Tem",
        description: "Baixe o aplicativo oficial para benefícios e serviços financeiros.",
        url: "https://www.caixa.gov.br/caixatem/paginas/default.aspx",
        iosUrl: "https://apps.apple.com/br/app/caixa-tem/id1485424267",
        androidUrl: "https://play.google.com/store/apps/details?id=br.gov.caixa.tem"
      }
    ]
  },
  {
    title: "Itapajé e região",
    items: [
      {
        name: "Prefeitura de Itapajé",
        description: "Portal oficial e serviços municipais.",
        url: "https://www.itapaje.ce.gov.br/"
      },
      {
        name: "Vagas IDT/SINE",
        description: "Consulte vagas e oportunidades de trabalho no Ceará.",
        url: "https://www.idt.org.br/vagas-disponiveis"
      },
      {
        name: "Detran Ceará",
        description: "Acesse serviços oficiais de veículos e habilitação.",
        url: "https://sistemas.detran.ce.gov.br/central"
      },
      {
        name: "Enel Ceará",
        description: "Segunda via, débitos e serviços da conta de energia.",
        url: "https://www.enel.com.br/pt-ceara.html"
      },
      {
        name: "Portal do Empreendedor",
        description: "Formalização e serviços oficiais para MEI.",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor"
      }
    ]
  },
  {
    title: "Redes da Crediti",
    items: [
      {
        name: "Instagram",
        description: "Acompanhe @crediti.oficial.",
        url: "https://www.instagram.com/crediti.oficial/"
      },
      {
        name: "TikTok",
        description: "Conteúdos em @marcelo.financiamentos.",
        url: "https://www.tiktok.com/@marcelo.financiamentos?_r=1&_t=ZS-99FD1UHxlTQ"
      },
      {
        name: "Kwai",
        description: "Acompanhe @creditiveiculo.",
        url: "https://k.kwai.com/u/@creditiveiculo/RbCCURAC"
      },
      {
        name: "WhatsApp Samila",
        description: "Atendimento com a analista Samila.",
        url: "https://wa.me/5585994409719"
      },
      {
        name: "WhatsApp Marcelino",
        description: "Atendimento com o analista Marcelino.",
        url: "https://wa.me/5585992032558"
      },
      {
        name: "Site oficial",
        description: "Conheça a Crediti Soluções Financeiras.",
        url: "https://www.creditisolucoes.com.br"
      }
    ]
  }
];

function getGreeting() {
  const hour =
    new Date().getHours();

  if (
    hour >= 5 &&
    hour < 12
  ) {
    return "Bom dia";
  }

  if (
    hour >= 12 &&
    hour < 18
  ) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function formatPhone(value) {
  const numbers =
    String(value)
      .replace(/\D/g, "")
      .slice(0, 11);

  if (!numbers) {
    return "";
  }

  if (
    numbers.length <= 2
  ) {
    return `(${numbers}`;
  }

  const ddd =
    numbers.slice(0, 2);

  const rest =
    numbers.slice(2);

  if (
    rest.length <= 5
  ) {
    return `(${ddd}) ${rest}`;
  }

  return `(${ddd}) ${rest.slice(
    0,
    5
  )}-${rest.slice(5)}`;
}

function firstName(name) {
  return (
    String(name)
      .trim()
      .split(/\s+/)[0] || ""
  );
}

function normalize(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

function getServiceNotice() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value || "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const currentMinutes = hour * 60 + minute;
  const isWeekend = weekday.startsWith("sáb") || weekday.startsWith("dom");
  const isOpen = !isWeekend && currentMinutes >= 460 && currentMinutes < 1020;

  if (isOpen) {
    return "";
  }

  if (isWeekend) {
    return "Nosso atendimento humano funciona de segunda a sexta, das 7h40 às 17h. Você pode enviar sua mensagem agora e receberá a resposta na segunda-feira.";
  }

  return "Nosso atendimento humano funciona de segunda a sexta, das 7h40 às 17h. Você pode enviar sua mensagem agora e receberá a resposta no próximo horário de atendimento.";
}

function looksLikeGreetingInsteadOfName(
  value
) {
  const text =
    normalize(value);

  return [
    "oi",
    "ola",
    "bom dia",
    "boa tarde",
    "boa noite",
    "tudo bem",
    "tudo bom",
    "beleza",
    "opa",
    "e ai"
  ].includes(text);
}


function isValidCustomerName(value) {
  const text = String(value || "").trim();

  if (text.length < 5 || text.length > 80) {
    return false;
  }

  if (looksLikeGreetingInsteadOfName(text)) {
    return false;
  }

  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(text)) {
    return false;
  }

  const words = text
    .split(/\s+/)
    .filter(Boolean);

  // Para evitar palavras soltas como "coisa", "credito", "oi" etc.,
  // o cadastro exige nome + sobrenome.
  if (words.length < 2 || words.length > 6) {
    return false;
  }

  if (
    words.some(
      (word) =>
        word.replace(/['-]/g, "").length < 2
    )
  ) {
    return false;
  }

  const forbiddenWords = [
    "emprestimo", "credito", "financiamento", "consignado", "dinheiro",
    "cartao", "fgts", "inss", "loas", "bpc", "clt", "consorcio",
    "seguro", "parcela", "valor", "limite", "preciso", "quero",
    "gostaria", "tenho", "tem", "algum", "disponivel", "saber",
    "simular", "simulacao", "ajuda", "ajudar", "atendimento",
    "atendente", "whatsapp", "telefone", "cidade", "meu", "minha",
    "pra", "para", "mim", "como", "quanto", "qual", "posso", "pode",
    "coisa", "teste", "cliente", "pessoa", "nome", "nao", "sim",
    "ola", "oi", "opa", "beleza"
  ];

  const normalizedWords =
    normalize(text).split(/\s+/);

  if (
    normalizedWords.some(
      (word) =>
        forbiddenWords.includes(word)
    )
  ) {
    return false;
  }

  return true;
}

function UiIcon({ name }) {
  const props = {
    className: "ui-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    focusable: "false",
    "aria-hidden": "true"
  };

  return (
    <svg {...props}>
      {name === "home" && <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>}
      {name === "credit" && <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 9h18M7 15h4" /></>}
      {name === "learn" && <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 4H11v16H7.5A3.5 3.5 0 0 0 4 21.5v-16Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 4H13v16h3.5a3.5 3.5 0 0 1 3.5 1.5v-16Z" /></>}
      {name === "services" && <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>}
      {name === "shop" && <><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>}
      {name === "chat" && <><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></>}
      {name === "products" && <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M17 14v6M14 17h6" /></>}
      {name === "partner" && <><path d="m3 8 4-3 4 3-5 6-3-3V8Z" /><path d="m21 8-4-3-3 2M8 15l3.5 3.5a1.5 1.5 0 0 0 2.1-2.1l-2.8-2.8" /><path d="m12.5 11.5 3.9 3.9a1.5 1.5 0 0 0 2.1-2.1L14 8.8a2 2 0 0 0-2.8 0L9.5 10.5a1.8 1.8 0 0 1-2.5 0" /></>}
      {name === "userPlus" && <><circle cx="10" cy="8" r="4" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M19 8v6M16 11h6" /></>}
      {name === "headset" && <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5ZM20 13h-3v6h2a1 1 0 0 0 1-1v-5ZM17 19c0 2-2 2-4 2" /></>}
      {name === "star" && <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />}
      {name === "search" && <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>}
      {name === "shield" && <><path d="M12 3 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>}
      {name === "calendar" && <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2" /></>}
      {name === "car" && <><path d="m5 10 2-4h10l2 4 2 2v6h-2M3 18v-6l2-2h14" /><path d="M7 18h10M7 15h.01M17 15h.01" /></>}
      {name === "education" && <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5M21 10v6" /></>}
      {name === "business" && <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V4h6v4M4 13h16M10 13v2h4v-2" /></>}
      {name === "gift" && <><rect x="4" y="9" width="16" height="11" rx="2" /><path d="M12 9v11M4 13h16M8 9c-3 0-3-4 0-4 2 0 4 4 4 4s2-4 4-4c3 0 3 4 0 4" /></>}
      {name === "shoe" && <><path d="M5 15c3 0 5-2 6-7l3 3c2 2 4 3 6 3l1 4c-5 2-12 2-16 0v-3Z" /><path d="M10 12l3 2M8 14l3 2" /></>}
    </svg>
  );
}

function BottomNav({
  active,
  onNavigate
}) {
  const items = [
    {
      id: "home",
      icon: "home",
      label: "Início"
    },
    {
      id: "credit",
      icon: "credit",
      label: "Crédito"
    },
    {
      id: "learn",
      icon: "learn",
      label: "Aprenda"
    },
    {
      id: "services",
      icon: "services",
      label: "Serviços"
    },
    {
      id: "shop",
      icon: "shop",
      label: "Shop"
    }
  ];

  return (
    <nav
      className="bottom-nav"
      aria-label="Navegação principal"
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={
            active === item.id
              ? "active"
              : ""
          }
          onClick={() =>
            onNavigate(item.id)
          }
        >
          <span aria-hidden="true">
            <UiIcon name={item.icon} />
          </span>

          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}

function HomeBannerVisual({ type }) {
  const iconProps = {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 4,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  return (
    <span
      className={`home-banner-visual ${type}`}
      aria-hidden="true"
    >
      {type === "credit" && (
        <svg {...iconProps}>
          <rect x="8" y="16" width="48" height="34" rx="7" />
          <path d="M8 27h48M16 41h13" />
          <circle cx="45" cy="39" r="5" />
        </svg>
      )}

      {type === "education" && (
        <svg {...iconProps}>
          <path d="m7 25 25-12 25 12-25 12L7 25Z" />
          <path d="M17 31v12c8 7 22 7 30 0V31M55 28v16" />
          <circle cx="55" cy="48" r="3" />
        </svg>
      )}

      {type === "security" && (
        <svg {...iconProps}>
          <path d="M32 7 53 15v15c0 13-8 23-21 28C19 53 11 43 11 30V15l21-8Z" />
          <path d="m22 32 7 7 14-15" />
        </svg>
      )}

      {type === "services" && (
        <svg {...iconProps}>
          <path d="M8 25 32 10l24 15H8ZM13 49h38M8 56h48" />
          <path d="M16 25v24M27 25v24M37 25v24M48 25v24" />
        </svg>
      )}
    </span>
  );
}

function AppHeader({
  title,
  subtitle,
  onBack
}) {
  return (
    <header className="light-header">
      {onBack && (
        <button
          className="back"
          onClick={onBack}
          aria-label="Voltar"
        >
          ‹
        </button>
      )}

      <div>
        <b>{title}</b>
        {subtitle && (
          <small>{subtitle}</small>
        )}
      </div>
    </header>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-error-screen">
          <span aria-hidden="true">!</span>
          <h1>Algo não carregou como deveria</h1>
          <p>Seus dados locais continuam protegidos. Toque abaixo para tentar novamente.</p>
          <button onClick={() => window.location.reload()}>
            TENTAR NOVAMENTE
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

function App() {
  const serviceNotice = useMemo(
    () => getServiceNotice(),
    []
  );

  const [
    showSplash,
    setShowSplash
  ] = useState(true);

  const [
    screen,
    setScreen
  ] = useState("home");

  const [
    messages,
    setMessages
  ] = useState([]);

  const [
    text,
    setText
  ] = useState("");

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    chatHeight,
    setChatHeight
  ] = useState(
    window.innerHeight
  );

  const [
    step,
    setStep
  ] = useState("name");

  const [
    selectedProduct,
    setSelectedProduct
  ] = useState(null);

  const [
    selectedArticle,
    setSelectedArticle
  ] = useState(null);

  const [
    customer,
    setCustomer
  ] = useState({
    name: "",
    city: "",
    phone: "",
    whatsapp: false,
    interest: "",
    analyst: ""
  });

  const [
    pendingMessage,
    setPendingMessage
  ] = useState("");

  const [
    showAnalysts,
    setShowAnalysts
  ] = useState(false);

  const [
    analystOnly,
    setAnalystOnly
  ] = useState("");

  const [
    partnerProduct,
    setPartnerProduct
  ] = useState("");

  const [
    chatRoutes,
    setChatRoutes
  ] = useState([]);

  const [
    homeSearch,
    setHomeSearch
  ] = useState("");

  const [
    searchTarget,
    setSearchTarget
  ] = useState(null);

  const [
    creditFilter,
    setCreditFilter
  ] = useState("todos");

  const [
    compareKeys,
    setCompareKeys
  ] = useState(() =>
    readLocalList(
      LOCAL_KEYS.comparisons
    ).filter((key) =>
      DIRECT_PRODUCT_KEYS.includes(key)
    ).slice(0, 3)
  );

  const [
    showComparison,
    setShowComparison
  ] = useState(false);

  const [
    externalProduct,
    setExternalProduct
  ] = useState("");

  const [
    externalReturnScreen,
    setExternalReturnScreen
  ] = useState("direct");

  const [
    appNotice,
    setAppNotice
  ] = useState("");

  const [
    isOnline,
    setIsOnline
  ] = useState(navigator.onLine);

  const [
    favoriteKeys,
    setFavoriteKeys
  ] = useState(() =>
    readLocalList(LOCAL_KEYS.favorites)
  );

  const [
    recentItems,
    setRecentItems
  ] = useState(() =>
    readLocalList(LOCAL_KEYS.recent)
  );

  const [
    localBills,
    setLocalBills
  ] = useState(() =>
    readLocalList(LOCAL_KEYS.bills)
  );

  const emptyFinancialProfile = {
    firstName: "",
    city: "",
    incomeType: "",
    goal: "",
    ownsVehicle: ""
  };

  const [
    financialProfile,
    setFinancialProfile
  ] = useState(() =>
    readLocalObject(
      LOCAL_KEYS.profile,
      emptyFinancialProfile
    )
  );

  const [
    profileDraft,
    setProfileDraft
  ] = useState(() => ({
    ...financialProfile
  }));

  const [
    simulations,
    setSimulations
  ] = useState(() =>
    readLocalList(LOCAL_KEYS.simulations)
  );

  const [
    serviceRequests,
    setServiceRequests
  ] = useState(() =>
    readLocalList(LOCAL_KEYS.serviceRequests)
  );

  const [
    billDraft,
    setBillDraft
  ] = useState({
    title: "",
    dueDate: "",
    value: ""
  });

  const [
    shopFilter,
    setShopFilter
  ] = useState("todos");

  const appSearchCatalog = useMemo(() => [
    ...APP_SEARCH_ITEMS,
    ...products.map((product) => ({
      title: product.name,
      description:
        product.what ||
        "Conheça esta opção da Crediti",
      screen: DIRECT_PRODUCT_KEYS.includes(
        product.id
      )
        ? "direct"
        : "productDetail",
      product,
      directProductKey:
        DIRECT_PRODUCT_KEYS.includes(
          product.id
        )
          ? product.id
          : "",
      searchPriority:
        product.id === "financiamento-carro" ||
        product.id === "financiamento-moto"
          ? 2
          : 0,
      keywords: [
        product.typeLabel,
        product.forWho,
        product.how,
        product.when,
        product.tip
      ]
        .filter(Boolean)
        .join(" ")
    })),
    ...EDUCATION_PARTNERS.map(
      (partner) => ({
        title: partner.name,
        description:
          partner.title +
          " · " +
          partner.category,
        screen: "learn",
        externalUrl: partner.url,
        targetSelector:
          `[data-search-key="${makeSearchKey("education", partner.name)}"]`,
        keywords:
          "faculdade curso estudar estudo educação " +
          partner.name +
          " " +
          partner.category
      })
    ),
    ...LEARN_ARTICLES.map(
      (article) => ({
        title: article.title,
        description: article.summary,
        screen: "learnDetail",
        article,
        keywords:
          article.category +
          " " +
          article.points.join(" ")
      })
    ),
    ...SERVICE_GROUPS.flatMap(
      (group) =>
        group.items.map((item) => ({
          title: item.name,
          description:
            item.description ||
            group.title,
          screen: "services",
          serviceItem: item,
          targetSelector:
            `[data-search-key="${makeSearchKey("service", item.name)}"]`,
          keywords:
            group.title +
            " " +
            item.name +
            " " +
            (item.description || "")
        }))
    ),
    ...SHOP_SEARCH_ITEMS.map(
      (item) => ({
        ...item,
        description:
          "Encontre esta loja parceira no Crediti Shop",
        screen: "shop"
      })
    )
  ], []);

  const normalizedSearch =
    normalizeAppSearch(homeSearch);

  const searchTokens =
    normalizedSearch
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4);

  const matchedSearchResults =
    normalizedSearch
      ? appSearchCatalog.map((item) => {
          const normalizedTitle =
            normalizeAppSearch(item.title);

          const normalizedDescription =
            normalizeAppSearch(
              item.description || ""
            );

          const normalizedKeywords =
            normalizeAppSearch(
              item.keywords || ""
            );

          const haystack =
            normalizedTitle +
            " " +
            normalizedDescription +
            " " +
            normalizedKeywords;

          const haystackWords =
            haystack
              .split(/\s+/)
              .filter(Boolean);

          const score =
            searchTokens.reduce(
              (total, token) => {
                const titleMatch =
                  normalizedTitle.includes(token);

                const descriptionMatch =
                  normalizedDescription.includes(token);

                const keywordMatch =
                  normalizedKeywords.includes(token);

                const approximate =
                  token.length >= 4 &&
                  haystackWords.some(
                    (word) =>
                      isSearchWordClose(
                        word,
                        token
                      )
                  );

                return (
                  total +
                  (titleMatch
                    ? 6
                    : descriptionMatch
                      ? 3
                      : keywordMatch
                        ? 2
                    : approximate
                      ? 1
                      : 0)
                );
              },
              0
            );

          return { ...item, score };
        })
          .filter((item) => item.score > 0)
          .sort(
            (a, b) =>
              b.score - a.score ||
              (b.searchPriority || 0) -
                (a.searchPriority || 0)
          )
          .slice(0, 5)
      : [];

  const isSearchFallback =
    Boolean(normalizedSearch) &&
    matchedSearchResults.length === 0;

  const homeSearchResults =
    isSearchFallback
      ? [
          APP_SEARCH_ITEMS.find(
            (item) =>
              item.title ===
              "Conheça nossos produtos"
          ),
          APP_SEARCH_ITEMS.find(
            (item) =>
              item.title ===
              "Serviços úteis"
          ),
          APP_SEARCH_ITEMS.find(
            (item) =>
              item.title ===
              "Crediti Shop"
          )
        ].filter(Boolean)
      : matchedSearchResults;

  useEffect(() => {
    warmAiServer();

    const handleOnline = () => {
      setIsOnline(true);
      setAppNotice("Conexão restabelecida.");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setAppNotice(
        "Você está sem internet. Seus favoritos e contas continuam disponíveis neste aparelho."
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let notice = document.getElementById(
      "crediti-global-notice"
    );

    if (!notice) {
      notice = document.createElement("div");
      notice.id = "crediti-global-notice";
      notice.setAttribute("role", "status");
      document.body.appendChild(notice);
    }

    notice.textContent = appNotice;
    notice.className = appNotice
      ? `global-notice visible${
          isOnline ? "" : " offline"
        }`
      : "global-notice";

    if (!appNotice || !isOnline) {
      return undefined;
    }

    const timer = window.setTimeout(
      () => setAppNotice(""),
      3200
    );

    return () => window.clearTimeout(timer);
  }, [appNotice, isOnline]);

  useEffect(() => {
    saveLocalList(
      LOCAL_KEYS.favorites,
      favoriteKeys
    );
  }, [favoriteKeys]);

  useEffect(() => {
    saveLocalList(
      LOCAL_KEYS.recent,
      recentItems
    );
  }, [recentItems]);

  useEffect(() => {
    saveLocalList(
      LOCAL_KEYS.bills,
      localBills
    );
  }, [localBills]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOCAL_KEYS.profile,
        JSON.stringify(financialProfile)
      );
    } catch {
      // O restante do aplicativo continua disponível se o navegador bloquear o armazenamento.
    }
  }, [financialProfile]);

  useEffect(() => {
    saveLocalList(
      LOCAL_KEYS.simulations,
      simulations
    );
  }, [simulations]);

  useEffect(() => {
    saveLocalList(
      LOCAL_KEYS.serviceRequests,
      serviceRequests
    );
  }, [serviceRequests]);

  useEffect(() => {
    saveLocalList(
      LOCAL_KEYS.comparisons,
      compareKeys
    );
  }, [compareKeys]);

  useEffect(() => {
    if (
      !searchTarget ||
      searchTarget.screen !== screen
    ) {
      return undefined;
    }

    let highlightTimer;

    const positionTimer = window.setTimeout(
      () => {
        document
          .querySelectorAll(
            ".search-target-active"
          )
          .forEach((element) =>
            element.classList.remove(
              "search-target-active"
            )
          );

        const target =
          document.querySelector(
            searchTarget.targetSelector
          );

        if (!target) {
          return;
        }

        target.classList.add(
          "search-target-active"
        );

        target.scrollIntoView({
          behavior: window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth",
          block: "center",
          inline: "center"
        });

        const action = target.matches(
          "button"
        )
          ? target
          : target.querySelector("button");

        window.setTimeout(() => {
          action?.focus({
            preventScroll: true
          });
        }, 350);

        highlightTimer =
          window.setTimeout(() => {
            target.classList.remove(
              "search-target-active"
            );
            setSearchTarget(
              (current) =>
                current === searchTarget
                  ? null
                  : current
            );
          }, 2800);
      },
      80
    );

    return () => {
      window.clearTimeout(
        positionTimer
      );
      window.clearTimeout(
        highlightTimer
      );
    };
  }, [screen, searchTarget]);

  function navigateSearchItem(item) {
    setHomeSearch("");

    if (item.action === "chat") {
      setSearchTarget(null);
      openChat();
    } else if (item.directProductKey) {
      setSearchTarget(null);
      openPartnerLink(
        item.directProductKey
      );
    } else if (item.serviceItem) {
      setSearchTarget(null);
      openService(item.serviceItem);
    } else if (item.externalUrl) {
      setSearchTarget(null);
      openExternal(item.externalUrl);
    } else if (item.product) {
      setSearchTarget(null);
      setSelectedProduct(item.product);
      setScreen("productDetail");
    } else if (item.article) {
      setSearchTarget(null);
      setSelectedArticle(item.article);
      setScreen("learnDetail");
    } else if (item.targetSelector) {
      setSearchTarget({
        screen: item.screen,
        targetSelector:
          item.targetSelector
      });
      setScreen(item.screen);
    } else {
      setSearchTarget(null);
      setScreen(item.screen);
    }
  }

  const filteredDirectKeys =
    creditFilter === "todos"
      ? DIRECT_PRODUCT_KEYS
      : DIRECT_PRODUCT_KEYS.filter(
          (productKey) =>
            CREDIT_META[productKey]
              ?.category === creditFilter
        );

  const upcomingBills = useMemo(
    () =>
      localBills
        .map((bill) => ({
          ...bill,
          days: daysUntil(bill.dueDate)
        }))
        .filter(
          (bill) =>
            !bill.paid &&
            bill.days !== null &&
            bill.days >= 0 &&
            bill.days <= 7
        )
        .sort((a, b) => a.days - b.days),
    [localBills]
  );

  const hasFinancialProfile =
    Boolean(
      financialProfile.firstName &&
      financialProfile.city &&
      financialProfile.incomeType &&
      financialProfile.goal
    );

  const financialRecommendations = useMemo(() => {
    if (!hasFinancialProfile) {
      return [];
    }

    const options = [];
    const add = (item) => {
      if (!options.some((saved) => saved.key === item.key)) {
        options.push(item);
      }
    };

    const incomeRecommendations = {
      aposentado: {
        key: "product-inss",
        title: "Consignado INSS",
        description: "Confira as condições para aposentados e pensionistas.",
        productKey: "inss"
      },
      bpc: {
        key: "product-bpc",
        title: "Consignado BPC / LOAS",
        description: "Veja a opção disponível para beneficiários.",
        productKey: "bpc"
      },
      clt: {
        key: "product-clt",
        title: "Crédito para trabalhador CLT",
        description: "Confira as regras antes de simular.",
        productKey: "clt"
      },
      estudante: {
        key: "product-student",
        title: "Financiamento estudantil",
        description: "Uma opção para começar ou continuar a faculdade.",
        productKey: "pravaler"
      },
      autonomo: {
        key: "all-products",
        title: "Opções para seu perfil",
        description: "Conheça os produtos e veja as exigências de cada um.",
        screen: "products"
      },
      outro: {
        key: "all-credit",
        title: "Encontre uma opção de crédito",
        description: "Veja os produtos com simulação disponível.",
        screen: "direct"
      }
    };

    if (incomeRecommendations[financialProfile.incomeType]) {
      add(incomeRecommendations[financialProfile.incomeType]);
    }

    if (financialProfile.incomeType === "clt") {
      add({
        key: "product-fgts",
        title: "Antecipação do FGTS",
        description: "Para quem possui saldo e saque-aniversário ativo.",
        productKey: "fgts"
      });
    }

    const goalRecommendations = {
      credito: {
        key: "credit-options",
        title: "Créditos para simular",
        description: "Compare as opções disponíveis no aplicativo.",
        screen: "direct"
      },
      estudar: {
        key: "product-student",
        title: "Financiamento estudantil",
        description: "Uma opção para começar ou continuar a faculdade.",
        productKey: "pravaler"
      },
      veiculo: {
        key: "vehicle-products",
        title: "Crédito para carro ou moto",
        description: "Conheça financiamento, garantia, seguro e consórcio.",
        screen: "products"
      },
      organizar: {
        key: "organizer",
        title: "Organizador de contas",
        description: "Cadastre vencimentos e acompanhe suas contas.",
        screen: "organizer"
      },
      empresa: {
        key: "business",
        title: "Central do Empresário",
        description: "Serviços e oportunidades para seu negócio.",
        screen: "business"
      },
      compras: {
        key: "shop",
        title: "Crediti Shop",
        description: "Encontre lojas e produtos por categoria.",
        screen: "shop"
      }
    };

    if (goalRecommendations[financialProfile.goal]) {
      add(goalRecommendations[financialProfile.goal]);
    }

    if (financialProfile.ownsVehicle === "sim") {
      add({
        key: "vehicle-guarantee",
        title: "Crédito com garantia",
        description: "Entenda como funciona usando carro ou moto.",
        productId: "garantia"
      });
    }

    return options.slice(0, 3);
  }, [financialProfile, hasFinancialProfile]);

  function toggleCompare(productKey) {
    if (
      !compareKeys.includes(productKey) &&
      compareKeys.length >= 3
    ) {
      showNotice(
        "Você pode comparar até 3 produtos por vez."
      );
      return;
    }

    setCompareKeys((current) => {
      if (current.includes(productKey)) {
        return current.filter(
          (key) => key !== productKey
        );
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, productKey];
    });
  }

  const chatRef =
    useRef(null);

  const messagesRef =
    useRef([]);

  useEffect(() => {
    const themeColor =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    themeColor?.setAttribute(
      "content",
      "#FFFDF7"
    );

    const splashTimer =
      window.setTimeout(
        () => {
          setShowSplash(false);

          document.documentElement
            .classList.remove(
              "splash-active"
            );

          themeColor?.setAttribute(
            "content",
            "#FFFFFF"
          );
        },
        750
      );

    return () => {
      window.clearTimeout(
        splashTimer
      );

      document.documentElement
        .classList.remove(
          "splash-active"
        );

      themeColor?.setAttribute(
        "content",
        "#FFFFFF"
      );
    };
  }, []);

  useEffect(() => {
    messagesRef.current =
      messages;
  }, [messages]);

  useEffect(() => {
    if (
      screen !== "chat"
    ) {
      return;
    }

    const updateViewport =
      () => {
        const viewport =
          window.visualViewport;

        const height =
          viewport
            ? viewport.height
            : window.innerHeight;

        setChatHeight(
          height
        );

        requestAnimationFrame(
          () => {
            window.scrollTo(
              0,
              0
            );
          }
        );
      };

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    if (
      window.visualViewport
    ) {
      window.visualViewport
        .addEventListener(
          "resize",
          updateViewport
        );

      window.visualViewport
        .addEventListener(
          "scroll",
          updateViewport
        );
    }

    return () => {
      window.removeEventListener(
        "resize",
        updateViewport
      );

      if (
        window.visualViewport
      ) {
        window.visualViewport
          .removeEventListener(
            "resize",
            updateViewport
          );

        window.visualViewport
          .removeEventListener(
            "scroll",
            updateViewport
          );
      }
    };
  }, [screen]);

  useEffect(() => {
    if (
      screen !== "chat"
    ) {
      return;
    }

    const chat =
      chatRef.current;

    if (!chat) {
      return;
    }

    requestAnimationFrame(
      () => {
        chat.scrollTo({
          top:
            chat.scrollHeight,
          behavior:
            "smooth"
        });
      }
    );
  }, [
    messages,
    busy,
    showAnalysts,
    screen
  ]);

  function addMessage(
    role,
    messageText
  ) {
    const message = {
      role,
      text: messageText
    };

    setMessages(
      (current) => {
        const next = [
          ...current,
          message
        ];

        messagesRef.current =
          next;

        return next;
      }
    );
  }

  const leadSavedRef = useRef(false);

  async function saveLead(
    data,
    status =
      "em_atendimento"
  ) {
    if (
      !data?.name ||
      !isValidCustomerName(data.name) ||
      !data?.phone ||
      !data?.city ||
      !data?.interest ||
      leadSavedRef.current
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `${SUPABASE_URL}/leads`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
              "apikey":
                SUPABASE_KEY,
              "Authorization":
                `Bearer ${SUPABASE_KEY}`,
              "Prefer":
                "return=minimal"
            },

            body:
              JSON.stringify({
                nome:
                  data.name || "",

                telefone:
                  data.phone || "",

                cidade:
                  data.city || "",

                produto_interesse:
                  data.interest || "",

                origem:
                  "crediti_ia",

                status,

                politica_aceita:
                  false,

                politica_versao:
                  "v1.0"
              })
          }
        );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          `Supabase ${response.status}: ${errorText}`
        );
      }

      leadSavedRef.current =
        true;
    } catch (error) {
      console.log(
        "Lead não registrado:",
        error
      );
    }
  }

  function navigateMain(
    destination
  ) {
    setSelectedArticle(null);
    setSelectedProduct(null);
    setScreen(destination);
    window.scrollTo(0, 0);
  }

  function openChatRoute(route) {
    if (!route?.screen || !CHAT_ROUTE_LABELS[route.screen]) {
      return;
    }

    if (route.screen === "shop") {
      setShopFilter(route.category || "todos");
    }

    setChatRoutes([]);
    navigateMain(route.screen);
  }

  function showNotice(message) {
    setAppNotice(message);
  }

  function rememberItem(item) {
    if (!item?.key || !item?.title) {
      return;
    }

    setRecentItems((current) => [
      {
        ...item,
        viewedAt: Date.now()
      },
      ...current.filter(
        (saved) => saved.key !== item.key
      )
    ].slice(0, 12));
  }

  function openFinancialProfile() {
    setProfileDraft({
      ...financialProfile
    });
    setScreen("financialProfile");
    window.scrollTo(0, 0);
  }

  function saveFinancialProfile(event) {
    event.preventDefault();

    const nextProfile = {
      ...profileDraft,
      firstName: profileDraft.firstName.trim(),
      city: profileDraft.city.trim()
    };

    if (
      !nextProfile.firstName ||
      !nextProfile.city ||
      !nextProfile.incomeType ||
      !nextProfile.goal
    ) {
      showNotice("Preencha os campos obrigatórios para concluir seu perfil.");
      return;
    }

    setFinancialProfile(nextProfile);
    setScreen("myCrediti");
    window.scrollTo(0, 0);
    showNotice("Perfil salvo somente neste aparelho.");
  }

  function clearFinancialProfile() {
    setFinancialProfile({
      ...emptyFinancialProfile
    });
    setProfileDraft({
      ...emptyFinancialProfile
    });
    showNotice("Perfil removido deste aparelho.");
  }

  function navigateRecommendation(item) {
    if (item.productKey) {
      openPartnerLink(item.productKey);
      return;
    }

    if (item.productId) {
      const product = products.find(
        (saved) => saved.id === item.productId
      );

      if (product) {
        setSelectedProduct(product);
        setScreen("productDetail");
        window.scrollTo(0, 0);
      }
      return;
    }

    if (item.screen) {
      navigateMain(item.screen);
    }
  }

  function recordSimulation(productKey) {
    const product = PARTNER_PRODUCTS[productKey];

    if (!product) {
      return;
    }

    setSimulations((current) => [
      {
        key: productKey,
        title: product.name,
        partner: product.partner,
        initiatedAt: Date.now()
      },
      ...current.filter((item) => item.key !== productKey)
    ].slice(0, 10));
  }

  function recordServiceRequest(analystKey, productName) {
    const analyst = ANALYSTS[analystKey];

    if (!analyst) {
      return;
    }

    const requestKey =
      analystKey + "-" + (productName || "atendimento");

    setServiceRequests((current) => [
      {
        key: requestKey,
        analystKey,
        analyst: analyst.name,
        product: productName || "Atendimento com a Crediti",
        requestedAt: Date.now(),
        status: "Atendimento solicitado"
      },
      ...current.filter((item) => item.key !== requestKey)
    ].slice(0, 10));
  }

  function toggleFavorite(productKey) {
    setFavoriteKeys((current) =>
      current.includes(productKey)
        ? current.filter(
            (key) => key !== productKey
          )
        : [...current, productKey]
    );

    showNotice(
      favoriteKeys.includes(productKey)
        ? "Produto removido dos favoritos."
        : "Produto salvo nos favoritos deste aparelho."
    );
  }

  function openSavedProduct(productKey) {
    if (!PARTNER_PRODUCTS[productKey]) {
      showNotice(
        "Este produto não está disponível no momento."
      );
      return;
    }

    openPartnerLink(productKey);
  }

  function addLocalBill(event) {
    event.preventDefault();

    if (
      !billDraft.title.trim() ||
      !billDraft.dueDate
    ) {
      showNotice(
        "Informe o nome da conta e a data de vencimento."
      );
      return;
    }

    const nextBill = {
      id:
        typeof crypto !== "undefined" &&
        crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      title: billDraft.title.trim(),
      dueDate: billDraft.dueDate,
      value: billDraft.value.trim(),
      paid: false
    };

    setLocalBills((current) =>
      [...current, nextBill].sort(
        (a, b) =>
          a.dueDate.localeCompare(
            b.dueDate
          )
      )
    );
    setBillDraft({
      title: "",
      dueDate: "",
      value: ""
    });
    showNotice(
      "Conta salva somente neste aparelho."
    );
  }

  function removeLocalBill(id) {
    setLocalBills((current) =>
      current.filter(
        (bill) => bill.id !== id
      )
    );
    showNotice("Conta removida.");
  }

  function toggleLocalBillPaid(id) {
    const currentBill =
      localBills.find(
        (bill) => bill.id === id
      );

    if (!currentBill) {
      return;
    }

    const isNowPaid =
      !currentBill.paid;

    setLocalBills((current) =>
      current.map((bill) => {
        if (bill.id !== id) {
          return bill;
        }

        return {
          ...bill,
          paid: isNowPaid
        };
      })
    );

    showNotice(
      isNowPaid
        ? "Conta marcada como paga."
        : "Conta reaberta."
    );
  }

  function openExternal(url) {
    if (!isOnline) {
      showNotice(
        "Sem internet no momento. Tente novamente quando a conexão voltar."
      );
      return false;
    }

    try {
      const openedWindow = window.open(
        url,
        "_blank"
      );

      if (!openedWindow) {
        showNotice(
          "O navegador bloqueou a abertura. Permita novas janelas e tente novamente."
        );
        return false;
      }

      openedWindow.opener = null;

      return true;
    } catch {
      showNotice(
        "Não foi possível abrir este endereço. Tente novamente."
      );
      return false;
    }
  }

  function openService(item) {
    if (!item?.url) {
      showNotice(
        "Este serviço está temporariamente indisponível."
      );
      return;
    }

    const userAgent =
      navigator.userAgent || "";

    let destination = item.url;

    if (
      item.iosUrl &&
      /iPad|iPhone|iPod/i.test(
        userAgent
      )
    ) {
      destination = item.iosUrl;
    } else if (
      item.androidUrl &&
      /Android/i.test(userAgent)
    ) {
      destination = item.androidUrl;
    }

    openExternal(destination);
  }

  function openChat(
    firstMessage = ""
  ) {
    warmAiServer();

    const greeting =
      getGreeting();

    const initialMessages = [
      {
        role:
          "assistant",

        text:
          `${greeting}! Eu sou o Creditin, assistente da Crediti. Tudo bem? Para começar, me diga seu nome e sobrenome.`
      }
    ];

    setMessages(
      initialMessages
    );

    messagesRef.current =
      initialMessages;

    setCustomer({
      name: "",
      city: "",
      phone: "",
      whatsapp: false,
      interest:
        firstMessage || "",
      analyst: ""
    });

    setStep("name");

    setText("");

    setShowAnalysts(
      false
    );

    setAnalystOnly("");

    setPartnerProduct("");

    setChatRoutes([]);

    setPendingMessage(
      firstMessage || ""
    );

    setScreen("chat");
  }

  function handleRegistration(
    value
  ) {
    const cleanValue =
      String(value).trim();

    if (
      step === "name"
    ) {
      if (
        !isValidCustomerName(
          cleanValue
        )
      ) {
        addMessage(
          "assistant",
          "Para continuar, digite seu nome e sobrenome. Exemplo: Maria Silva."
        );

        return;
      }

      const name =
        cleanValue;

      setCustomer(
        (current) => ({
          ...current,
          name
        })
      );

      setStep("city");

      addMessage(
        "assistant",
        `Prazer, ${firstName(name)}! De qual cidade você está falando?`
      );

      return;
    }

    if (
      step === "city"
    ) {
      if (
        cleanValue.length <
        2
      ) {
        addMessage(
          "assistant",
          "Me diz o nome da sua cidade para a gente continuar."
        );

        return;
      }

      setCustomer(
        (current) => ({
          ...current,
          city: cleanValue
        })
      );

      setStep("phone");

      addMessage(
        "assistant",
        `${firstName(customer.name)}, agora me passa seu número de telefone com DDD.`
      );

      return;
    }

    if (
      step === "phone"
    ) {
      const numbers =
        cleanValue.replace(
          /\D/g,
          ""
        );

      if (
        numbers.length !==
        11
      ) {
        addMessage(
          "assistant",
          "Esse número parece incompleto. Digite o DDD e o número completo para mim."
        );

        return;
      }

      const formatted =
        formatPhone(numbers);

      setCustomer(
        (current) => ({
          ...current,
          phone: formatted
        })
      );

      setStep(
        "whatsapp"
      );

      addMessage(
        "assistant",
        `${firstName(customer.name)}, esse número ${formatted} também é seu WhatsApp? Pode responder sim ou não.`
      );

      return;
    }

    if (
      step === "whatsapp"
    ) {
      const answer =
        normalize(
          cleanValue
        );

      const yes =
        [
          "sim",
          "s",
          "ss",
          "simn",
          "claro",
          "pode",
          "isso",
          "yes",
          "e"
        ].includes(
          answer
        );

      const no =
        [
          "nao",
          "n"
        ].includes(
          answer
        );

      if (
        !yes &&
        !no
      ) {
        addMessage(
          "assistant",
          "Só confirma para mim: esse número também é seu WhatsApp? Pode responder sim ou não."
        );

        return;
      }

      const updatedCustomer =
        {
          ...customer,
          whatsapp: yes
        };

      setCustomer(
        updatedCustomer
      );

      setStep("ready");

      saveLead(
        updatedCustomer,
        "dados_coletados"
      );

      if (
        pendingMessage
      ) {
        const request =
          pendingMessage;

        setPendingMessage(
          ""
        );

        addMessage(
          "assistant",
          `Perfeito, ${firstName(updatedCustomer.name)}. Já tenho seus dados básicos. Agora vou analisar o que você procura.`
        );

        setTimeout(
          () => {
            sendToAI(
              request,
              updatedCustomer
            );
          },
          250
        );
      } else {
        addMessage(
          "assistant",
          `Perfeito, ${firstName(updatedCustomer.name)}. Agora me conta o que você precisa e eu vou buscar a melhor opção para você.`
        );
      }
    }
  }

  async function sendToAI(
    value,
    customerData =
      customer
  ) {
    value =
      String(value).trim();

    if (
      !value ||
      busy
    ) {
      return;
    }

    setBusy(true);

    setChatRoutes([]);

    const updatedCustomer =
      {
        ...customerData,

        interest:
          customerData
            .interest ||
          value
      };

    setCustomer(
      updatedCustomer
    );

    const controller =
      new AbortController();

    const requestTimer =
      window.setTimeout(
        () => controller.abort(),
        AI_REQUEST_TIMEOUT_MS
      );

    try {
      const response =
        await fetch(
          `${API_URL}/api/chat`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            signal:
              controller.signal,

            body:
              JSON.stringify({
                message:
                  value,

                history:
                  messagesRef.current,

                customer: {
                  name:
                    updatedCustomer.name,

                  firstName:
                    firstName(
                      updatedCustomer.name
                    ),

                  city:
                    updatedCustomer.city,

                  phone:
                    updatedCustomer.phone,

                  whatsapp:
                    updatedCustomer.whatsapp,

                  interest:
                    updatedCustomer.interest
                }
              })
          }
        );

      const data =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ||
            `Erro ${response.status}`
        );
      }

      addMessage(
        "assistant",
        data.reply
      );

      if (
        data.showAnalysts ===
        true
      ) {
        setPartnerProduct("");

        setShowAnalysts(
          true
        );

        setAnalystOnly(
          data.analystKey || ""
        );
      }

      if (
        data.partnerProduct &&
        PARTNER_PRODUCTS[
          data.partnerProduct
        ]
      ) {
        setShowAnalysts(false);

        setAnalystOnly("");

        setPartnerProduct(
          data.partnerProduct
        );
      }

      setChatRoutes(
        Array.isArray(data.routes)
          ? data.routes.filter((route) => CHAT_ROUTE_LABELS[route?.screen])
          : []
      );

      saveLead(
        updatedCustomer,
        "em_atendimento"
      );
    } catch (error) {
      addMessage(
        "assistant",
        error?.name === "AbortError"
          ? "A resposta demorou mais que o esperado. Toque em enviar para tentar novamente."
          : "Não consegui responder agora. Confira sua internet e tente novamente."
      );
    } finally {
      window.clearTimeout(
        requestTimer
      );
      setBusy(false);
    }
  }

  function sendMessage() {
    const value =
      String(text).trim();

    if (
      !value ||
      busy
    ) {
      return;
    }

    setText("");

    addMessage(
      "user",
      value
    );

    if (
      step !== "ready"
    ) {
      handleRegistration(
        value
      );

      return;
    }

    sendToAI(value);
  }

  function handleInputChange(
    event
  ) {
    let value =
      event.target.value;

    if (
      step === "phone"
    ) {
      value =
        formatPhone(value);
    }

    setText(value);
  }

  function openAnalystWhatsApp(
    analystKey,
    productName = "",
    customerData = customer
  ) {
    const analyst = ANALYSTS[analystKey];

    if (!analyst) {
      return;
    }

    const finalProduct =
      productName ||
      customerData?.interest ||
      "Não informado";

    const customerName =
      customerData?.name || "Não informado";

    const customerCity =
      customerData?.city || "Não informada";

    const customerPhone =
      customerData?.phone || "Não informado";

    const whatsappAnswer =
      customerData?.whatsapp ? "Sim" : "Não informado";

    let message;

    if (customerData?.name) {
      message =
        `Olá, ${analyst.name}! Vim pelo Crediti IA e já fiz meu atendimento inicial com o Creditin.

` +
        `FICHA DO CLIENTE
` +
        `Nome: ${customerName}
` +
        `Cidade: ${customerCity}
` +
        `Telefone: ${customerPhone}
` +
        `WhatsApp: ${whatsappAnswer}
` +
        `Produto de interesse: ${finalProduct}

` +
        `Quero continuar meu atendimento com você.`;
    } else if (productName) {
      message =
        `Olá, ${analyst.name}! Conheci "${productName}" pelo Crediti IA e gostaria de saber mais e verificar as possibilidades para mim.`;
    } else {
      message =
        `Olá, ${analyst.name}! Gostaria de falar com a Crediti e continuar meu atendimento com você.`;
    }

    const url =
      "https://wa.me/" +
      analyst.whatsapp +
      "?text=" +
      encodeURIComponent(message);

    recordServiceRequest(
      analystKey,
      productName || customerData?.interest || ""
    );

    window.open(url, "_blank");
  }

  function openPartnerLink(
    productKey
  ) {
    const product =
      PARTNER_PRODUCTS[
        productKey
      ];

    if (!product?.url) {
      showNotice(
        "Esta opção está temporariamente indisponível."
      );
      return;
    }

    rememberItem({
      key: productKey,
      title: product.name,
      partner: product.partner,
      type: "credit"
    });

    setExternalProduct(productKey);
    setExternalReturnScreen(
      screen === "partnerNotice"
        ? "direct"
        : screen
    );
    setScreen("partnerNotice");
  }

  function chooseAnalyst(
    analystKey
  ) {
    const analyst =
      ANALYSTS[
        analystKey
      ];

    if (!analyst) {
      return;
    }

    const updatedCustomer =
      {
        ...customer,

        analyst:
          analyst.title
      };

    saveLead(
      updatedCustomer,
      "encaminhado"
    );

    openAnalystWhatsApp(
      analystKey,
      customer.interest,
      updatedCustomer
    );
  }

  if (showSplash) {
    return (
      <div
        className="app-splash"
        role="status"
        aria-label="Abrindo a Crediti"
      >
        <img
          className="app-splash__icon"
          src="/icon-512.png?v=7"
          alt=""
        />

        <strong className="app-splash__brand">
          CREDITI
        </strong>

        <p className="app-splash__message">
          Encontre opções de crédito e<br />
          simule com segurança
        </p>

        <small className="app-splash__tagline">
          Crédito com responsabilidade
        </small>
      </div>
    );
  }

  if (
    screen === "partnerNotice" &&
    externalProduct &&
    PARTNER_PRODUCTS[externalProduct]
  ) {
    const product =
      PARTNER_PRODUCTS[externalProduct];

    return (
      <div className="app app-white">
        <AppHeader
          title="Antes de continuar"
          subtitle="Você será direcionado ao parceiro"
          onBack={() =>
            setScreen(
              externalReturnScreen || "direct"
            )
          }
        />

        <main className="modern-page partner-notice-page">
          <section className="partner-notice-brand">
            <small>AMBIENTE EXTERNO</small>
            <h1>{product.name}</h1>
            <p>{product.partner}</p>
          </section>

          <section className="partner-notice-safe">
            <span aria-hidden="true"><UiIcon name="shield" /></span>
            <div>
              <h2>Seus dados ficam com a instituição</h2>
              <p>
                A Crediti não pede nem armazena CPF, documentos, renda, dados bancários ou senhas. Se desejar continuar, preencha as informações somente no site oficial do parceiro.
              </p>
            </div>
          </section>

          <section className="partner-notice-rules">
            <h2>Antes de abrir</h2>
            <ul>
              <li>A análise e as condições são definidas pela instituição.</li>
              <li>Não existe garantia de aprovação.</li>
              <li>Nunca pague antecipadamente para liberar crédito.</li>
            </ul>
          </section>

          <button
            className="partner-notice-continue"
            onClick={() => {
              if (openExternal(product.url)) {
                recordSimulation(externalProduct);
                setScreen(
                  externalReturnScreen || "direct"
                );
              }
            }}
          >
            CONTINUAR NO SITE OFICIAL
          </button>

          <button
            className="partner-notice-cancel"
            onClick={() =>
              setScreen(
                externalReturnScreen || "direct"
              )
            }
          >
            VOLTAR SEM ACESSAR
          </button>
        </main>
      </div>
    );
  }

  if (screen === "financialProfile") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Meu perfil financeiro"
          subtitle="Sem CPF, documentos ou senha"
          onBack={() => setScreen("myCrediti")}
        />

        <main className="modern-page financial-profile-page">
          <section className="profile-safe-note">
            <span aria-hidden="true"><UiIcon name="shield" /></span>
            <div>
              <strong>Seu perfil fica neste aparelho</strong>
              <p>Usamos somente estas respostas para organizar recomendações. Elas não são enviadas aos bancos.</p>
            </div>
          </section>

          <form className="financial-profile-form" onSubmit={saveFinancialProfile}>
            <label>
              Como podemos chamar você?
              <input
                value={profileDraft.firstName}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    firstName: event.target.value
                  }))
                }
                placeholder="Seu primeiro nome"
                maxLength="40"
                autoComplete="given-name"
              />
            </label>

            <label>
              Sua cidade
              <input
                value={profileDraft.city}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    city: event.target.value
                  }))
                }
                placeholder="Ex.: Itapajé"
                maxLength="60"
                autoComplete="address-level2"
              />
            </label>

            <label>
              Qual opção mais combina com você?
              <select
                value={profileDraft.incomeType}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    incomeType: event.target.value
                  }))
                }
              >
                <option value="">Selecione</option>
                <option value="aposentado">Aposentado ou pensionista</option>
                <option value="bpc">Recebo BPC / LOAS</option>
                <option value="clt">Trabalho com carteira assinada</option>
                <option value="autonomo">Sou autônomo ou empresário</option>
                <option value="estudante">Sou estudante</option>
                <option value="outro">Outra situação</option>
              </select>
            </label>

            <label>
              O que você procura agora?
              <select
                value={profileDraft.goal}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    goal: event.target.value
                  }))
                }
              >
                <option value="">Selecione</option>
                <option value="credito">Uma opção de crédito</option>
                <option value="veiculo">Comprar ou usar um veículo</option>
                <option value="estudar">Faculdade ou financiamento estudantil</option>
                <option value="organizar">Organizar minhas contas</option>
                <option value="empresa">Serviços para meu negócio</option>
                <option value="compras">Comprar produtos</option>
              </select>
            </label>

            <fieldset>
              <legend>Você possui carro ou moto?</legend>
              <div className="profile-choice-row">
                <button
                  type="button"
                  className={profileDraft.ownsVehicle === "sim" ? "selected" : ""}
                  onClick={() => setProfileDraft((current) => ({ ...current, ownsVehicle: "sim" }))}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={profileDraft.ownsVehicle === "nao" ? "selected" : ""}
                  onClick={() => setProfileDraft((current) => ({ ...current, ownsVehicle: "nao" }))}
                >
                  Não
                </button>
              </div>
            </fieldset>

            <button className="profile-save-button" type="submit">
              SALVAR MEU PERFIL
            </button>

            {hasFinancialProfile && (
              <button
                className="profile-clear-button"
                type="button"
                onClick={clearFinancialProfile}
              >
                APAGAR PERFIL DESTE APARELHO
              </button>
            )}
          </form>
        </main>

        <BottomNav active="home" onNavigate={navigateMain} />
      </div>
    );
  }

  if (screen === "myCrediti") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Minha Crediti"
          subtitle="Organização salva neste aparelho"
          onBack={() => setScreen("home")}
        />

        <main className="modern-page local-hub-page">
          <section className={"smart-profile-card" + (hasFinancialProfile ? " ready" : "")}>
            <span aria-hidden="true"><UiIcon name="userPlus" /></span>
            <div>
              <small>{hasFinancialProfile ? "PERFIL ATIVO" : "RECOMENDAÇÕES PARA VOCÊ"}</small>
              <strong>
                {hasFinancialProfile
                  ? `${financialProfile.firstName}, seu perfil está pronto`
                  : "Crie seu perfil financeiro"}
              </strong>
              <p>
                {hasFinancialProfile
                  ? `${financialProfile.city} · Informações salvas somente neste aparelho.`
                  : "Responda algumas perguntas simples, sem informar CPF ou documentos."}
              </p>
            </div>
            <button onClick={openFinancialProfile}>
              {hasFinancialProfile ? "EDITAR" : "CRIAR PERFIL"}
            </button>
          </section>

          {financialRecommendations.length > 0 && (
            <section className="local-section smart-recommendations">
              <div className="local-section-title">
                <div>
                  <small>COM BASE NO SEU PERFIL</small>
                  <h2>Recomendados para você</h2>
                </div>
              </div>
              <div className="recommendation-list">
                {financialRecommendations.map((item) => (
                  <button key={item.key} onClick={() => navigateRecommendation(item)}>
                    <span aria-hidden="true"><UiIcon name={item.productKey ? "credit" : "search"} /></span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </div>
                    <b aria-hidden="true">›</b>
                  </button>
                ))}
              </div>
              <p className="recommendation-disclaimer">
                São caminhos informativos. Aprovação e condições dependem da instituição responsável.
              </p>
            </section>
          )}

          <div className="local-hub-actions">
            <button onClick={() => setScreen("organizer")}>
              <span aria-hidden="true"><UiIcon name="calendar" /></span>
              <strong>Organizar contas</strong>
              <small>Cadastre datas e receba avisos locais.</small>
            </button>
            <button onClick={() => setScreen("protect")}>
              <span aria-hidden="true"><UiIcon name="shield" /></span>
              <strong>Crediti Protege</strong>
              <small>Confira sinais de golpe antes de continuar.</small>
            </button>
          </div>

          {upcomingBills.length > 0 && (
            <section className="local-section due-alert-section">
              <div className="local-section-title">
                <div>
                  <small>ATENÇÃO</small>
                  <h2>Vencimentos próximos</h2>
                </div>
                <button onClick={() => setScreen("organizer")}>Ver contas</button>
              </div>
              <div className="local-list">
                {upcomingBills.map((bill) => (
                  <article key={bill.id}>
                    <div>
                      <strong>{bill.title}</strong>
                      <small>
                        {bill.days === 0
                          ? "Vence hoje"
                          : `Vence em ${bill.days} dia${bill.days === 1 ? "" : "s"}`}
                      </small>
                    </div>
                    {bill.value && <b>{bill.value}</b>}
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="local-section">
            <div className="local-section-title">
              <div>
                <small>ACESSOS AOS PARCEIROS</small>
                <h2>Simulações iniciadas</h2>
              </div>
              <b>{simulations.length}</b>
            </div>
            {simulations.length ? (
              <div className="activity-list">
                {simulations.slice(0, 5).map((item) => (
                  <button key={item.key} onClick={() => openSavedProduct(item.key)}>
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        {item.partner} · acessado em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(item.initiatedAt))}
                      </small>
                    </span>
                    <b>CONTINUAR</b>
                  </button>
                ))}
              </div>
            ) : (
              <div className="friendly-empty compact">
                <p>Os produtos que você abrir no site do parceiro aparecerão aqui.</p>
              </div>
            )}
          </section>

          <section className="local-section">
            <div className="local-section-title">
              <div>
                <small>CONTATO COM A CREDITI</small>
                <h2>Solicitações e atendimentos</h2>
              </div>
              <b>{serviceRequests.length}</b>
            </div>
            {serviceRequests.length ? (
              <div className="activity-list request-list">
                {serviceRequests.slice(0, 5).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => openAnalystWhatsApp(item.analystKey, item.product)}
                  >
                    <span>
                      <strong>{item.product}</strong>
                      <small>{item.status} com {item.analyst}</small>
                    </span>
                    <b>CONTINUAR</b>
                  </button>
                ))}
              </div>
            ) : (
              <div className="friendly-empty compact">
                <p>Quando você chamar um analista, o atendimento ficará registrado aqui.</p>
              </div>
            )}
          </section>

          <section className="local-section">
            <div className="local-section-title">
              <div>
                <small>GUARDADOS POR VOCÊ</small>
                <h2>Favoritos</h2>
              </div>
            </div>
            {favoriteKeys.length ? (
              <div className="saved-product-grid">
                {favoriteKeys.map((productKey) => {
                  const product = PARTNER_PRODUCTS[productKey];
                  if (!product) return null;
                  return (
                    <article key={productKey}>
                      <small>{product.partner}</small>
                      <strong>{product.name}</strong>
                      <div>
                        <button onClick={() => openSavedProduct(productKey)}>
                          VER PRODUTO
                        </button>
                        <button
                          className="remove-saved"
                          onClick={() => toggleFavorite(productKey)}
                          aria-label={`Remover ${product.name} dos favoritos`}
                        >
                          REMOVER
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="friendly-empty">
                <strong>Nenhum favorito ainda</strong>
                <p>Na tela de crédito, toque em “Salvar” no produto que deseja acompanhar.</p>
                <button onClick={() => setScreen("direct")}>VER CRÉDITOS</button>
              </div>
            )}
          </section>

          <section className="local-section">
            <div className="local-section-title">
              <div>
                <small>CONTINUE DE ONDE PAROU</small>
                <h2>Vistos recentemente</h2>
              </div>
            </div>
            {recentItems.length ? (
              <div className="recent-list">
                {recentItems.slice(0, 6).map((item) => (
                  <button
                    key={item.key}
                    onClick={() => openSavedProduct(item.key)}
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.partner || "Crediti"}</small>
                    </span>
                    <b aria-hidden="true">›</b>
                  </button>
                ))}
              </div>
            ) : (
              <div className="friendly-empty compact">
                <p>Os produtos que você abrir aparecerão aqui.</p>
              </div>
            )}
          </section>
        </main>

        <BottomNav active="home" onNavigate={navigateMain} />
      </div>
    );
  }

  if (screen === "organizer") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Organizador de contas"
          subtitle="Lembretes salvos somente neste aparelho"
          onBack={() => setScreen("myCrediti")}
        />

        <main className="modern-page organizer-page">
          <section className="organizer-intro">
            <span aria-hidden="true"><UiIcon name="calendar" /></span>
            <div>
              <h1>Não deixe uma conta passar</h1>
              <p>Informe apenas um nome e a data. Não coloque número de cartão, conta bancária, CPF ou senha.</p>
            </div>
          </section>

          <form className="bill-form" onSubmit={addLocalBill}>
            <label>
              Nome da conta
              <input
                value={billDraft.title}
                onChange={(event) =>
                  setBillDraft((current) => ({
                    ...current,
                    title: event.target.value
                  }))
                }
                placeholder="Ex.: energia, internet, aluguel"
                maxLength="40"
              />
            </label>
            <div className="bill-form-row">
              <label>
                Vencimento
                <input
                  type="date"
                  value={billDraft.dueDate}
                  onChange={(event) =>
                    setBillDraft((current) => ({
                      ...current,
                      dueDate: event.target.value
                    }))
                  }
                />
              </label>
              <label>
                Valor opcional
                <input
                  inputMode="decimal"
                  value={billDraft.value}
                  onChange={(event) =>
                    setBillDraft((current) => ({
                      ...current,
                      value: event.target.value
                    }))
                  }
                  placeholder="Ex.: R$ 120"
                  maxLength="20"
                />
              </label>
            </div>
            <button type="submit">SALVAR LEMBRETE</button>
          </form>

          <section className="local-section">
            <div className="local-section-title">
              <div>
                <small>NO SEU APARELHO</small>
                <h2>Minhas contas</h2>
              </div>
              <b>{localBills.length}</b>
            </div>
            {localBills.length ? (
              <div className="bill-list">
                {localBills.map((bill) => {
                  const days = daysUntil(bill.dueDate);
                  return (
                    <article
                      key={bill.id}
                      className={
                        bill.paid
                          ? "paid"
                          : days !== null && days <= 3 && days >= 0
                            ? "urgent"
                            : ""
                      }
                    >
                      <div>
                        <strong>{bill.title}</strong>
                        <small>
                          {new Intl.DateTimeFormat("pt-BR").format(
                            new Date(`${bill.dueDate}T12:00:00`)
                          )}
                          {days === 0 ? " · vence hoje" : days > 0 ? ` · em ${days} dias` : " · vencida"}
                        </small>
                      </div>
                      {bill.value && <b>{bill.value}</b>}
                      <div className="bill-actions">
                        <button onClick={() => toggleLocalBillPaid(bill.id)}>
                          {bill.paid ? "REABRIR" : "MARCAR COMO PAGA"}
                        </button>
                        <button onClick={() => removeLocalBill(bill.id)}>REMOVER</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="friendly-empty">
                <strong>Nenhuma conta cadastrada</strong>
                <p>Use o formulário acima para criar seu primeiro lembrete.</p>
              </div>
            )}
          </section>
        </main>

        <BottomNav active="home" onNavigate={navigateMain} />
      </div>
    );
  }

  if (screen === "protect") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Crediti Protege"
          subtitle="Informação simples contra golpes"
          onBack={() => setScreen("myCrediti")}
        />

        <main className="modern-page protect-page">
          <section className="protect-hero">
            <span aria-hidden="true"><UiIcon name="shield" /></span>
            <div>
              <small>SEGURANÇA PRIMEIRO</small>
              <h1>Desconfie antes de pagar</h1>
              <p>Nenhum parceiro deve cobrar depósito antecipado para liberar crédito.</p>
            </div>
          </section>

          <section className="warning-grid">
            {[
              ["Cobrança antecipada", "Promessa de liberação após Pix ou depósito é sinal de perigo."],
              ["Aprovação garantida", "A análise sempre pertence à instituição. Ninguém pode garantir aprovação."],
              ["Pedido de senha", "Nunca informe senha, código recebido por SMS ou acesso ao aplicativo do banco."],
              ["Pressa e ameaça", "Golpistas tentam impedir que você confira as informações com calma."]
            ].map(([title, copy], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{title}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </section>

          <section className="official-check-card">
            <small>ANTES DE CONTINUAR</small>
            <h2>Confira o endereço do parceiro</h2>
            <p>A Crediti mostra uma tela de segurança antes de abrir qualquer produto de crédito. Leia o nome da instituição e continue somente se reconhecer o serviço.</p>
            <button onClick={() => setScreen("services")}>ACESSAR SERVIÇOS OFICIAIS</button>
          </section>

          <button className="protect-help" onClick={() => openChat("Quero orientação para evitar golpes") }>
            CONVERSAR COM A CREDITI IA
          </button>
        </main>

        <BottomNav active="learn" onNavigate={navigateMain} />
      </div>
    );
  }

  if (screen === "journeys") {
    const journeys = [
      {
        id: "vehicle",
        icon: "car",
        title: "Carro ou moto",
        copy: "Financiamento, garantia, seguro, consórcio e orientação antes de decidir.",
        actions: [
          ["Conhecer as opções", () => {
            const item = products.find((product) => product.id === "financiamento-carro");
            setSelectedProduct(item || null);
            setScreen("productDetail");
          }],
          ["Conversar com a IA", () => openChat("Quero comprar ou usar um veículo")]
        ]
      },
      {
        id: "retired",
        icon: "credit",
        title: "Aposentado ou pensionista",
        copy: "Consignado INSS, BPC/LOAS, serviços oficiais e cuidados contra golpes.",
        actions: [
          ["Ver consignado INSS", () => openSavedProduct("inss")],
          ["Acessar Meu INSS", () => openService(SERVICE_GROUPS.flatMap((group) => group.items).find((item) => item.name === "Meu INSS"))]
        ]
      },
      {
        id: "education",
        icon: "education",
        title: "Estudar e financiar",
        copy: "Faculdades, financiamento estudantil, orientação de orçamento e segurança educacional.",
        actions: [
          ["Ver faculdades", () => setScreen("learn")],
          ["Simular financiamento estudantil", () => openPartnerLink("pravaler")]
        ]
      },
      {
        id: "business",
        icon: "business",
        title: "Empresa e loja",
        copy: "Conta PJ, saúde empresarial, site, divulgação e serviços oficiais.",
        actions: [
          ["Abrir Central do Empresário", () => setScreen("business")],
          ["Quero ser parceiro", () => setScreen("partner")]
        ]
      },
      {
        id: "shopping",
        icon: "shop",
        title: "Comprar e economizar",
        copy: "Lojas parceiras organizadas por categoria, ofertas e cupons.",
        actions: [
          ["Abrir Crediti Shop", () => setScreen("shop")],
          ["Ver dicas de orçamento", () => setScreen("learn")]
        ]
      }
    ];

    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Caminhos Crediti"
          subtitle="Tudo ligado à sua necessidade"
          onBack={() => setScreen("home")}
        />
        <main className="modern-page journeys-page">
          <section className="page-intro compact">
            <span className="eyebrow">ESCOLHA SEU OBJETIVO</span>
            <h1>O que você precisa resolver?</h1>
            <p>Encontre crédito, conteúdo, serviço e parceiro no mesmo caminho.</p>
          </section>
          <div className="journey-grid">
            {journeys.map((journey) => (
              <article key={journey.id} className={`journey-card ${journey.id}`}>
                <span aria-hidden="true"><UiIcon name={journey.icon} /></span>
                <h2>{journey.title}</h2>
                <p>{journey.copy}</p>
                <div>
                  {journey.actions.map(([label, action]) => (
                    <button key={label} onClick={action}>{label}</button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </main>
        <BottomNav active="home" onNavigate={navigateMain} />
      </div>
    );
  }

  if (screen === "business") {
    const businessGroup = SERVICE_GROUPS[0];
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Central do Empresário"
          subtitle="Soluções para MEI, empresas e lojistas"
          onBack={() => setScreen("journeys")}
        />
        <main className="modern-page business-page">
          <section className="business-hero">
            <small>NEGÓCIO EM MOVIMENTO</small>
            <h1>Da conta PJ à divulgação da sua loja</h1>
            <p>Escolha o que sua empresa precisa e continue no site responsável.</p>
          </section>
          <div className="business-grid">
            {businessGroup.items.map((item) => (
              <button key={item.name} onClick={() => openService(item)}>
                <span aria-hidden="true">PJ</span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
                <b>{item.action || "ACESSAR ›"}</b>
              </button>
            ))}
          </div>
          <section className="business-partner-callout">
            <div>
              <small>RENDA EXTRA CREDITI</small>
              <h2>Também quer indicar clientes?</h2>
              <p>Conheça os produtos, faça indicações e acompanhe suas oportunidades.</p>
            </div>
            <button onClick={() => setScreen("partner")}>QUERO SER PARCEIRO</button>
          </section>
        </main>
        <BottomNav active="services" onNavigate={navigateMain} />
      </div>
    );
  }

  if (screen === "direct") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Simule seu crédito"
          subtitle="Escolha uma opção disponível"
          onBack={() =>
            setScreen("credit")
          }
        />

        <main className="modern-page">
          <section className="page-intro compact">
            <span className="eyebrow">
              SIMULAÇÃO ONLINE
            </span>

            <h1>
              Qual crédito você quer simular?
            </h1>

            <p>
              Escolha uma opção e continue no ambiente seguro da instituição responsável.
            </p>
          </section>

          <div className="credit-filter-bar" aria-label="Filtrar opções de crédito">
            {CREDIT_FILTERS.map((filter) => (
              <button
                className={creditFilter === filter.id ? "active" : ""}
                key={filter.id}
                onClick={() => setCreditFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <section className="compare-tray" aria-live="polite">
            <div>
              <strong>Comparar produtos</strong>
              <small>
                {compareKeys.length
                  ? compareKeys.length + " de 3 selecionados"
                  : "Escolha até 3 opções"}
              </small>
            </div>
            <button
              disabled={compareKeys.length < 2}
              onClick={() => setShowComparison(true)}
            >
              COMPARAR
            </button>
          </section>

          <div className="direct-grid">
            {filteredDirectKeys.map(
              (productKey) => {
                const product =
                  PARTNER_PRODUCTS[
                    productKey
                  ];

                return (
                  <article
                    className={
                      "direct-card direct-" +
                      productKey
                    }
                    key={productKey}
                  >
                    <button
                      className="favorite-toggle"
                      onClick={() =>
                        toggleFavorite(productKey)
                      }
                      aria-pressed={favoriteKeys.includes(
                        productKey
                      )}
                      aria-label={
                        favoriteKeys.includes(productKey)
                          ? "Remover dos favoritos"
                          : "Salvar nos favoritos"
                      }
                    >
                      {favoriteKeys.includes(productKey)
                        ? "★ SALVO"
                        : "☆ SALVAR"}
                    </button>
                    <div
                      className={
                        "direct-logo " +
                        (product.logoTone
                          ? product.logoTone + "-logo"
                          : "")
                      }
                    >
                      {product.logo ? (
                        <img
                          src={product.logo}
                          alt={product.partner}
                        />
                      ) : (
                        <strong>
                          {product.logoText || product.partner}
                        </strong>
                      )}
                    </div>

                    <div>
                      <small>
                        {product.partner}
                      </small>

                      <h2>
                        {product.name}
                      </h2>
                    </div>

                    <button
                      className={
                        "compare-select " +
                        (compareKeys.includes(productKey)
                          ? "selected"
                          : "")
                      }
                      onClick={() => toggleCompare(productKey)}
                      aria-pressed={compareKeys.includes(productKey)}
                    >
                      {compareKeys.includes(productKey)
                        ? "✓ SELECIONADO"
                        : "+ COMPARAR"}
                    </button>

                    <button
                      className="primary-action"
                      onClick={() =>
                        openPartnerLink(
                          productKey
                        )
                      }
                    >
                      {product.button || "SIMULAR SEU CRÉDITO"}
                    </button>
                  </article>
                );
              }
            )}
          </div>

          <p className="external-note">
            A análise, as condições e a contratação são de responsabilidade da instituição escolhida. A Crediti não garante aprovação.
          </p>
        </main>

        {showComparison && (
          <div
            className="compare-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Comparação de produtos"
          >
            <div className="compare-modal-card">
              <div className="compare-modal-head">
                <div>
                  <small>COMPARAÇÃO CLARA</small>
                  <h2>Compare antes de escolher</h2>
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  aria-label="Fechar comparação"
                >
                  ×
                </button>
              </div>

              <div className="compare-columns">
                {compareKeys.map((productKey) => {
                  const product = PARTNER_PRODUCTS[productKey];
                  const meta = CREDIT_META[productKey];

                  return (
                    <article key={productKey}>
                      <small>{product.partner}</small>
                      <h3>{product.name}</h3>
                      <b>Para quem é</b>
                      <p>{meta.audience}</p>
                      <b>Como funciona</b>
                      <p>{meta.detail}</p>
                      <button
                        onClick={() => openPartnerLink(productKey)}
                      >
                        {product.button || "SIMULAR"}
                      </button>
                    </article>
                  );
                })}
              </div>

              <p className="compare-disclaimer">
                Condições e aprovação são definidas pela instituição responsável. A Crediti apenas orienta e direciona.
              </p>
            </div>
          </div>
        )}

        <BottomNav
          active="credit"
          onNavigate={navigateMain}
        />
      </div>
    );
  }

  if (screen === "credit") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Crédito"
          subtitle="Escolha como deseja continuar"
        />

        <main className="modern-page">
          <section className="page-intro">
            <span className="eyebrow">
              CREDITI
            </span>

            <h1>
              Crédito com orientação e responsabilidade
            </h1>

            <p>
              Simule diretamente ou converse com a Crediti IA para entender qual opção pode fazer sentido.
            </p>
          </section>

          <div className="hub-grid">
            <button
              className="hub-card featured"
              onClick={() =>
                setScreen("direct")
              }
            >
              <span className="hub-icon"><UiIcon name="credit" /></span>
              <strong>
                Quero simular agora
              </strong>
              <small>
                Veja os créditos disponíveis para simulação online.
              </small>
            </button>

            <button
              className="hub-card"
              onClick={() =>
                openChat()
              }
            >
              <span className="hub-icon"><UiIcon name="chat" /></span>
              <strong>
                Converse com a Crediti IA
              </strong>
              <small>
                Tire dúvidas, entenda seu perfil e gere seu atendimento.
              </small>
            </button>

            <button
              className="hub-card"
              onClick={() =>
                setScreen("products")
              }
            >
              <span className="hub-icon"><UiIcon name="products" /></span>
              <strong>
                Conheça nossos produtos
              </strong>
              <small>
                Veja regras, perguntas e dicas antes de decidir.
              </small>
            </button>

            <button
              className="hub-card"
              onClick={() =>
                setScreen("human")
              }
            >
              <span className="hub-icon"><UiIcon name="headset" /></span>
              <strong>
                Atendimento com analista
              </strong>
              <small>
                Fale com a equipe da Crediti pelo WhatsApp.
              </small>
            </button>
          </div>

          <section className="region-note">
            <strong>
              Onde atendemos financiamento?
            </strong>
            <p>
              Financiamento de carro e moto está disponível em Itapajé, Irauçuba e Uruburetama. Crédito com garantia de carro ou moto está disponível em todo o Brasil.
            </p>
          </section>
        </main>

        <BottomNav
          active="credit"
          onNavigate={navigateMain}
        />
      </div>
    );
  }

  if (
    screen === "learnDetail" &&
    selectedArticle
  ) {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Aprenda com a Crediti"
          subtitle={selectedArticle.category}
          onBack={() =>
            setScreen("learn")
          }
        />

        <main className="modern-page">
          <article className="article-detail">
            <span className="eyebrow">
              {selectedArticle.category}
            </span>

            <h1>
              {selectedArticle.title}
            </h1>

            <p className="article-summary">
              {selectedArticle.summary}
            </p>

            <ul>
              {selectedArticle.points.map(
                (point) => (
                  <li key={point}>
                    {point}
                  </li>
                )
              )}
            </ul>

            <div className="creditin-advice">
              <strong>
                Dica do Creditin
              </strong>
              <p>
                Informação ajuda a decidir melhor. Se ainda tiver dúvida sobre crédito, converse com a Crediti IA.
              </p>
            </div>

            <button
              className="primary-action"
              onClick={() =>
                openChat()
              }
            >
              CONVERSAR COM A CREDITI IA
            </button>
          </article>
        </main>

        <BottomNav
          active="learn"
          onNavigate={navigateMain}
        />
      </div>
    );
  }

  if (screen === "learn") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Aprenda"
          subtitle="Informação para decidir melhor"
        />

        <main className="modern-page">
          <section className="page-intro">
            <span className="eyebrow">
              APRENDA E CRESÇA
            </span>

            <h1>
              Conhecimento para transformar seu futuro
            </h1>

            <p>
              Formação, carreira e conteúdos simples para cuidar melhor do seu dinheiro.
            </p>
          </section>

          <section className="career-section">
            <span className="eyebrow">
              OPORTUNIDADE DE CRESCIMENTO
            </span>

            <h2>Formação e carreira</h2>

            <div
              className="education-partner-carousel"
              aria-label="Instituições de ensino parceiras"
            >
              {EDUCATION_PARTNERS.map(
                (partner) => (
                  <button
                    className={`career-card ${partner.id}`}
                    key={partner.id}
                    data-search-key={makeSearchKey(
                      "education",
                      partner.name
                    )}
                    onClick={() =>
                      openExternal(partner.url)
                    }
                  >
                    <div className="career-brand">
                      <i aria-hidden="true">
                        {partner.symbol}
                      </i>
                      <b>{partner.name}</b>
                    </div>

                    <div className="career-copy">
                      <small>{partner.category}</small>
                      <strong>{partner.title}</strong>
                      <span>{partner.action}</span>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>

          <section className="education-connected-card">
            <div>
              <small>JORNADA DE ESTUDO</small>
              <h2>Curso, financiamento e planejamento no mesmo lugar</h2>
              <p>Conheça as faculdades, simule o financiamento estudantil e veja dicas para organizar a mensalidade.</p>
            </div>
            <div>
              <button onClick={() => openPartnerLink("pravaler")}>SIMULAR FINANCIAMENTO</button>
              <button onClick={() => openChat("Quero estudar e preciso de orientação")}>FALAR COM A IA</button>
            </div>
          </section>

          <section className="financial-learning-heading">
            <span className="eyebrow">
              CONTEÚDOS DA CREDITI
            </span>
            <h2>Educação financeira</h2>
          </section>

          <div className="article-grid">
            {LEARN_ARTICLES.map(
              (article) => (
                <button
                  className="article-card"
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(
                      article
                    );
                    setScreen(
                      "learnDetail"
                    );
                    window.scrollTo(0, 0);
                  }}
                >
                  <small>
                    {article.category}
                  </small>
                  <strong>
                    {article.title}
                  </strong>
                  <p>
                    {article.summary}
                  </p>
                  <span>
                    LER DICA ›
                  </span>
                </button>
              )
            )}
          </div>

        </main>

        <BottomNav
          active="learn"
          onNavigate={navigateMain}
        />
      </div>
    );
  }

  if (screen === "services") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Serviços"
          subtitle="Consultas e canais confiáveis"
        />

        <main className="modern-page">
          <section className="page-intro">
            <span className="eyebrow">
              ACESSO RÁPIDO
            </span>

            <h1>
              Serviços úteis em um só lugar
            </h1>

            <p>
              A Crediti apenas direciona. Seus dados serão preenchidos nos sites oficiais escolhidos.
            </p>
          </section>

          <div className="service-groups">
            {SERVICE_GROUPS.map(
              (group) => (
                <section
                  className="service-group"
                  key={group.title}
                >
                  <h2>{group.title}</h2>

                  <div className="service-grid">
                    {group.items.map(
                      (item) => (
                        <button
                          className={`service-card${item.status ? " service-card-disabled" : ""}`}
                          key={item.name}
                          data-search-key={makeSearchKey(
                            "service",
                            item.name
                          )}
                          onClick={() => {
                            if (!item.status) {
                              openService(item);
                            }
                          }}
                          disabled={Boolean(item.status)}
                        >
                          <strong>
                            {item.name}
                          </strong>
                          <small>
                            {item.description}
                          </small>
                          <span>
                            {item.status || item.action || "ACESSAR ›"}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </section>
              )
            )}
          </div>
        </main>

        <BottomNav
          active="services"
          onNavigate={navigateMain}
        />
      </div>
    );
  }

  if (screen === "shop") {
    return (
      <div className="app app-white app-with-nav">
        <AppHeader
          title="Crediti Shop"
          subtitle="Achadinhos escolhidos para você"
        />

        <main className={`modern-page shop-page shop-filter-${shopFilter}`}>
          <section className="shop-hero">
            <img
              className="shop-delivery-art"
              src="/creditin-moto-shop.png"
              alt="Creditin em uma moto de entrega da Crediti Shop"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />

            <span className="eyebrow">
              VITRINE DE OFERTAS
            </span>

            <h1>
              Produtos úteis em um só lugar
            </h1>

            <p>
              Escolha sua vitrine e finalize a compra diretamente na loja parceira.
            </p>

            <button
              className="shop-main-button"
              onClick={() => {
                document
                  .getElementById(
                    "lojas-parceiras"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth"
                  });
              }}
            >
              VER LOJAS PARCEIRAS
            </button>
          </section>

          <section
            className="shop-store-section"
            id="lojas-parceiras"
          >
            <div className="section-title-row">
              <div>
                <span className="eyebrow">
                  ESCOLHA SUA VITRINE
                </span>
                <h2>Lojas parceiras</h2>
              </div>
            </div>

            <div className="shop-category-filter" aria-label="Filtrar lojas por categoria">
              {[
                ["todos", "Todas"],
                ["casa", "Casa e eletrônicos"],
                ["moda", "Moda"],
                ["beleza", "Beleza e saúde"],
                ["familia", "Família e presentes"],
                ["auto", "Auto e ferramentas"]
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={shopFilter === id ? "active" : ""}
                  onClick={() => {
                    setShopFilter(id);
                    window.requestAnimationFrame(() => {
                      document.querySelector(".shop-store-carousel")?.scrollTo({ left: 0, behavior: "smooth" });
                    });
                  }}
                  aria-pressed={shopFilter === id}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="shop-store-carousel">
              <article className="shop-store-card shopee-store-card">
                <div
                  className="shop-store-art"
                  aria-hidden="true"
                >
                <span className="partner-icon-bubble shopee-icon"><UiIcon name="shop" /></span>
                  <b>Shopee</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Achadinhos na Shopee</h2>
                <p>
                  Confira produtos escolhidos para facilitar sua busca.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      SHOPEE_STORE_URL
                    )
                  }
                >
                  ABRIR SHOPEE
                </button>
              </article>

              <article className="shop-store-card amazon-store-card">
                <div
                  className="shop-store-art amazon-art"
                  aria-hidden="true"
                >
                  <span className="amazon-bag">
                    <svg viewBox="0 0 72 72" focusable="false">
                      <path
                        className="amazon-bag-handle"
                        d="M24 27v-5c0-8 5-13 12-13s12 5 12 13v5"
                      />
                      <path
                        className="amazon-bag-body"
                        d="M13 24h46l-3 41H16z"
                      />
                      <path
                        className="amazon-bag-smile"
                        d="M24 47c7 6 17 6 25 0"
                      />
                      <path
                        className="amazon-bag-arrow"
                        d="m47 46 4 1-2 4"
                      />
                    </svg>
                  </span>
                  <b>Amazon</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Ofertas na Amazon</h2>
                <p>
                  Encontre produtos, novidades e ofertas na Amazon.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      AMAZON_STORE_URL
                    )
                  }
                >
                  ABRIR AMAZON
                </button>
              </article>

              <article className="shop-store-card magalu-store-card">
                <div
                  className="shop-store-art magalu-art"
                  aria-hidden="true"
                >
                  <span className="partner-icon-bubble magalu-icon"><UiIcon name="shop" /></span>
                  <b>magalu</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Ofertas no Magalu</h2>
                <p>
                  Acesse nossa seleção e compre diretamente no Magalu.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      MAGALU_STORE_URL
                    )
                  }
                >
                  ABRIR MAGALU
                </button>
              </article>

              <article className="shop-store-card gazin-store-card">
                <div className="shop-store-art gazin-art" aria-hidden="true">
                  <span className="partner-icon-bubble gazin-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M13 31h38v21H13zM18 31V20h28v11M18 52v5M46 52v5" />
                      <path d="M22 39h20M32 20v11" />
                    </svg>
                  </span>
                  <b>Gazin</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Casa, móveis e tecnologia</h2>
                <p>Móveis, eletrodomésticos, celulares e produtos para o dia a dia.</p>
                <button onClick={() => openExternal(GAZIN_STORE_URL)}>
                  ABRIR GAZIN
                </button>
              </article>

              <article className="shop-store-card itatiaia-store-card">
                <div
                  className="shop-store-art itatiaia-art"
                  aria-hidden="true"
                >
                  <span className="itatiaia-kitchen">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <rect x="7" y="8" width="50" height="48" rx="5" />
                      <path d="M7 31h50M32 8v48" />
                      <circle cx="27" cy="25" r="2" />
                      <circle cx="37" cy="25" r="2" />
                      <circle cx="27" cy="39" r="2" />
                      <circle cx="37" cy="39" r="2" />
                    </svg>
                  </span>
                  <b>Itatiaia</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Cozinhas, móveis e eletros</h2>
                <p>
                  Produtos para renovar sua cozinha e deixar a casa completa.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      ITATIAIA_STORE_URL
                    )
                  }
                >
                  ABRIR ITATIAIA
                </button>
              </article>

              <article className="shop-store-card electrolux-store-card">
                <div
                  className="shop-store-art electrolux-art"
                  aria-hidden="true"
                >
                  <span className="electrolux-appliance">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <rect x="18" y="5" width="28" height="54" rx="5" />
                      <path d="M18 29h28M39 15v7M39 37v8" />
                    </svg>
                  </span>
                  <b>Electrolux</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Eletrodomésticos Electrolux</h2>
                <p>
                  Geladeiras, lavadoras, fogões e soluções para sua casa.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      ELECTROLUX_STORE_URL
                    )
                  }
                >
                  ABRIR ELECTROLUX
                </button>
              </article>

              <article className="shop-store-card polishop-store-card">
                <div
                  className="shop-store-art polishop-art"
                  aria-hidden="true"
                >
                  <span className="polishop-spark">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M32 7c2 14 9 21 23 25-14 3-21 10-23 25-3-15-10-22-24-25 14-4 21-11 24-25Z" />
                      <path d="M49 8c1 6 4 9 10 11-6 1-9 4-10 10-2-6-5-9-11-10 6-2 9-5 11-11Z" />
                    </svg>
                  </span>
                  <b>Polishop</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Inovação para o dia a dia</h2>
                <p>
                  Produtos para cozinha, casa, beleza, fitness e bem-estar.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      POLISHOP_STORE_URL
                    )
                  }
                >
                  ABRIR POLISHOP
                </button>
              </article>

              <article className="shop-store-card xiaomi-store-card">
                <div
                  className="shop-store-art xiaomi-art"
                  aria-hidden="true"
                >
                  <span className="xiaomi-device">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <rect x="17" y="6" width="30" height="52" rx="7" />
                      <circle cx="24" cy="15" r="3.5" />
                      <circle cx="33" cy="15" r="3.5" />
                      <path d="M27 51h10" />
                    </svg>
                  </span>
                  <b>Xiaomi</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Tecnologia Xiaomi</h2>
                <p>
                  Smartphones, acessórios e produtos para casa inteligente.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      XIAOMI_STORE_URL
                    )
                  }
                >
                  ABRIR XIAOMI
                </button>
              </article>

              <article className="shop-store-card mecanico-store-card">
                <div
                  className="shop-store-art mecanico-art"
                  aria-hidden="true"
                >
                  <span className="mecanico-tools">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M39 9a15 15 0 0 0-12 22L10 48a5 5 0 0 0 7 7l17-17A15 15 0 0 0 55 22l-9 9-8-3-3-8 9-9a15 15 0 0 0-5-2Z" />
                    </svg>
                  </span>
                  <b>Loja do Mecânico</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Ferramentas e máquinas</h2>
                <p>
                  Equipamentos para oficina, construção, indústria, casa e jardim.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      LOJA_MECANICO_STORE_URL
                    )
                  }
                >
                  ABRIR LOJA DO MECÂNICO
                </button>
              </article>

              <article className="shop-store-card hipervarejo-store-card">
                <div className="shop-store-art hipervarejo-art" aria-hidden="true">
                  <span className="partner-icon-bubble hipervarejo-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <circle cx="32" cy="32" r="22" />
                      <circle cx="32" cy="32" r="10" />
                      <path d="M32 10v12M32 42v12M10 32h12M42 32h12M17 17l8 8M39 39l8 8M47 17l-8 8M25 39l-8 8" />
                    </svg>
                  </span>
                  <b>Hipervarejo</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Autopeças e pneus</h2>
                <p>Peças, pneus e acessórios para carros, motos e caminhões.</p>
                <button onClick={() => openExternal(HIPERVAREJO_STORE_URL)}>ABRIR HIPERVAREJO</button>
              </article>

              <article className="shop-store-card shein-store-card">
                <div
                  className="shop-store-art shein-art"
                  aria-hidden="true"
                >
                  <span className="shein-hanger">
                    <svg viewBox="0 0 48 48" focusable="false">
                      <path d="M24 10c0-4 6-4 6 0 0 3-3 4-6 6L7 31c-2 2-1 5 2 5h30c3 0 4-3 2-5L27 19" />
                    </svg>
                  </span>
                  <b>SHEIN</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Moda e ofertas na SHEIN</h2>
                <p>
                  Acesse nossa seleção e compre diretamente na SHEIN.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      SHEIN_STORE_URL
                    )
                  }
                >
                  ABRIR SHEIN
                </button>
              </article>

              <article className="shop-store-card cea-store-card">
                <div
                  className="shop-store-art cea-art"
                  aria-hidden="true"
                >
                  <span className="cea-fashion">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M21 16 28 10h8l7 6 9 5-6 11-6-3v25H24V29l-6 3-6-11 9-5Z" />
                    </svg>
                  </span>
                  <b>C&amp;A</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Ofertas C&amp;A</h2>
                <p>
                  Até 50% de desconto e mais 30% OFF usando o cupom.
                </p>

                <div className="store-coupon cea-coupon">
                  <span>CUPOM</span>
                  <strong>QUERO30</strong>
                </div>

                <button
                  onClick={() =>
                    openExternal(
                      CEA_STORE_URL
                    )
                  }
                >
                  ABRIR C&amp;A
                </button>
              </article>

              <article className="shop-store-card colombo-store-card">
                <div className="shop-store-art colombo-art" aria-hidden="true">
                  <span className="partner-icon-bubble colombo-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="m22 10 10 7 10-7 11 8-8 12v26H19V30l-8-12 11-8Z" />
                      <path d="M26 15c1 6 11 6 12 0M32 20v36M28 30h8" />
                    </svg>
                  </span>
                  <b>Camisaria Colombo</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Moda masculina completa</h2>
                <p>Camisas, polos, calças, ternos, alfaiataria e acessórios masculinos.</p>
                <button onClick={() => openExternal(COLOMBO_STORE_URL)}>
                  ABRIR COLOMBO
                </button>
              </article>

              <article className="shop-store-card malwee-store-card">
                <div className="shop-store-art malwee-art" aria-hidden="true">
                  <span className="partner-icon-bubble malwee-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="m22 10 10 7 10-7 12 9-9 12v25H19V31l-9-12 12-9Z" />
                      <path d="M26 15c2 6 10 6 12 0" />
                    </svg>
                  </span>
                  <b>Malwee</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Moda para toda a família</h2>
                <p>Roupas femininas, masculinas, infantis e opções plus size.</p>
                <button onClick={() => openExternal(MALWEE_STORE_URL)}>ABRIR MALWEE</button>
              </article>

              <article className="shop-store-card sawary-store-card">
                <div className="shop-store-art sawary-art" aria-hidden="true">
                  <span className="partner-icon-bubble sawary-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M22 9h20l-2 46H24L22 9Z" />
                      <path d="M22 20h20M32 20v35M22 10c3 5 17 5 20 0" />
                      <path d="M32 20 24 55M32 20l8 35" />
                    </svg>
                  </span>
                  <b>Sawary Jeans</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Jeans para todos os estilos</h2>
                <p>Calças, shorts e outras peças em jeans para renovar o visual.</p>
                <button onClick={() => openExternal(SAWARY_STORE_URL)}>
                  ABRIR SAWARY JEANS
                </button>
              </article>

              <article className="shop-store-card mariavalentina-store-card">
                <div className="shop-store-art mariavalentina-art" aria-hidden="true">
                  <span className="partner-icon-bubble mariavalentina-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M27 10h10l3 13 11 31H13l11-31 3-13Z" />
                      <path d="M24 23c5 4 11 4 16 0M32 10v44" />
                    </svg>
                  </span>
                  <b>Maria.Valentina</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Moda feminina sofisticada</h2>
                <p>Peças elegantes para trabalho, momentos casuais e ocasiões especiais.</p>
                <button onClick={() => openExternal(MARIA_VALENTINA_STORE_URL)}>ABRIR MARIA.VALENTINA</button>
              </article>

              <article className="shop-store-card laluna-store-card">
                <div className="shop-store-art laluna-art" aria-hidden="true">
                  <span className="partner-icon-bubble laluna-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M42 10c-12 3-19 13-17 25 2 11 12 18 23 17-5 5-12 8-20 6C15 55 7 42 10 29 13 16 27 7 42 10Z" />
                      <path d="m45 18 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
                    </svg>
                  </span>
                  <b>La Luna</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Moda infantil</h2>
                <p>Roupas para meninos, meninas e bebês com estilo e conforto.</p>
                <button onClick={() => openExternal(LALUNA_STORE_URL)}>ABRIR LA LUNA</button>
              </article>

              <article className="shop-store-card babystock-store-card">
                <div
                  className="shop-store-art babystock-art"
                  aria-hidden="true"
                >
                  <span className="partner-icon-bubble babystock-icon"><UiIcon name="gift" /></span>
                  <b>BabyStock</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Ofertas na BabyStock</h2>
                <p>
                  Roupas, acessórios e produtos para bebês e crianças.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      BABYSTOCK_STORE_URL
                    )
                  }
                >
                  ABRIR BABYSTOCK
                </button>
              </article>

              <article className="shop-store-card toymania-store-card">
                <div className="shop-store-art toymania-art" aria-hidden="true">
                  <span className="partner-icon-bubble toymania-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <rect x="9" y="31" width="22" height="22" rx="4" />
                      <rect x="33" y="22" width="22" height="31" rx="4" />
                      <circle cx="16" cy="39" r="2" />
                      <circle cx="24" cy="39" r="2" />
                      <path d="M39 30h10M44 25v10M14 47h12" />
                    </svg>
                  </span>
                  <b>Toy Mania</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Diversão para todas as idades</h2>
                <p>Brinquedos, jogos e opções para presentear crianças.</p>
                <button onClick={() => openExternal(TOY_MANIA_STORE_URL)}>
                  ABRIR TOY MANIA
                </button>
              </article>

              <article className="shop-store-card kidy-store-card">
                <div
                  className="shop-store-art kidy-art"
                  aria-hidden="true"
                >
                  <span className="partner-icon-bubble kidy-shoe"><UiIcon name="shoe" /></span>
                  <b>Kidy Calçados</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Calçados infantis Kidy</h2>
                <p>
                  Escolha o calçado e use o cupom para ganhar desconto.
                </p>

                <div className="store-coupon">
                  <span>CUPOM</span>
                  <strong>AFILIKIDY</strong>
                </div>

                <button
                  onClick={() =>
                    openExternal(
                      KIDY_STORE_URL
                    )
                  }
                >
                  ABRIR KIDY CALÇADOS
                </button>
              </article>

              <article className="shop-store-card freeway-store-card">
                <div className="shop-store-art freeway-art" aria-hidden="true">
                  <span className="partner-icon-bubble freeway-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M12 40c9 0 15-5 18-17l8 7c4 4 9 6 15 7l2 10c-11 5-29 6-43 1v-8Z" />
                      <path d="M29 29l8 5M25 35l8 4M16 48h38" />
                    </svg>
                  </span>
                  <b>Freeway</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Calçados com personalidade</h2>
                <p>Tênis, botas, mocassins, sapatos e sapatênis para diferentes estilos.</p>
                <button onClick={() => openExternal(FREEWAY_STORE_URL)}>ABRIR FREEWAY</button>
              </article>

              <article className="shop-store-card natura-store-card">
                <div
                  className="shop-store-art natura-art"
                  aria-hidden="true"
                >
                  <span className="natura-leaf">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M32 54C18 45 14 32 17 14c15 2 27 10 30 23-2 9-7 14-15 17Z" />
                      <path d="M22 20c8 8 12 17 10 34" />
                    </svg>
                  </span>
                  <b>Natura</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Beleza e cuidados Natura</h2>
                <p>
                  Perfumaria, cuidados pessoais e presentes para todos os momentos.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      NATURA_STORE_URL
                    )
                  }
                >
                  ABRIR NATURA
                </button>
              </article>

              <article className="shop-store-card avon-store-card">
                <div
                  className="shop-store-art avon-art"
                  aria-hidden="true"
                >
                  <span className="avon-beauty">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M25 17h14v12H25z" />
                      <path d="M28 8h8v9h-8z" />
                      <path d="M22 29h20v27H22z" />
                      <path d="M17 15v8M13 19h8M48 9v10M43 14h10" />
                    </svg>
                  </span>
                  <b>AVON</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Beleza e ofertas Avon</h2>
                <p>
                  Maquiagem, perfumes e cuidados pessoais para você.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      AVON_STORE_URL
                    )
                  }
                >
                  ABRIR AVON
                </button>
              </article>

              <article className="shop-store-card lojasrede-store-card">
                <div className="shop-store-art lojasrede-art" aria-hidden="true">
                  <span className="partner-icon-bubble lojasrede-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M24 17h16v10H24zM21 27h22v29H21z" />
                      <path d="M28 17V9h8v8M27 38h10M27 45h10" />
                    </svg>
                  </span>
                  <b>Lojas REDE</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Beleza e cuidados pessoais</h2>
                <p>Cosméticos, perfumaria, higiene e produtos para todos os estilos.</p>
                <button onClick={() => openExternal(LOJAS_REDE_STORE_URL)}>
                  ABRIR LOJAS REDE
                </button>
              </article>

              <article className="shop-store-card amokarite-store-card">
                <div className="shop-store-art amokarite-art" aria-hidden="true">
                  <span className="partner-icon-bubble amokarite-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M15 43c17 2 30-8 35-28-20 2-33 12-35 28Z" />
                      <path d="M17 44c9-10 18-17 31-25" />
                      <path d="M26 34c-2-5-5-8-9-10M35 27c0-5-2-9-5-12" />
                    </svg>
                  </span>
                  <b>AmoKarité</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Beleza limpa e consciente</h2>
                <p>Maquiagens naturais, veganas e sustentáveis para sua rotina.</p>
                <button onClick={() => openExternal(AMOKARITE_STORE_URL)}>
                  ABRIR AMOKARITÉ
                </button>
              </article>

              <article className="shop-store-card sieno-store-card">
                <div className="shop-store-art sieno-art" aria-hidden="true">
                  <span className="partner-icon-bubble sieno-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M24 11h16v10H24zM20 25h24v31H20z" />
                      <path d="M28 21v4h8v-4M27 37c3-4 7-4 10 0" />
                    </svg>
                  </span>
                  <b>Sieno Perfumes</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Perfumes para marcar presença</h2>
                <p>Fragrâncias importadas e opções para diferentes estilos e ocasiões.</p>
                <button onClick={() => openExternal(SIENO_STORE_URL)}>
                  ABRIR SIENO
                </button>
              </article>

              <article className="shop-store-card leloyn-store-card">
                <div className="shop-store-art leloyn-art" aria-hidden="true">
                  <span className="partner-icon-bubble leloyn-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M24 10h16v10H24zM19 25h26v31H19z" />
                      <path d="M26 39c4-6 8-6 12 0M28 20v5h8v-5" />
                    </svg>
                  </span>
                  <b>Le’Loyn Parfums</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Alta perfumaria e beleza</h2>
                <p>Perfumes importados, maquiagens e cosméticos de luxo.</p>
                <button onClick={() => openExternal(LELOYN_STORE_URL)}>ABRIR LE’LOYN</button>
              </article>

              <article className="shop-store-card fator5-store-card">
                <div className="shop-store-art fator5-art" aria-hidden="true">
                  <span className="partner-icon-bubble fator5-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M23 11h18v10H23zM18 25h28v31H18z" />
                      <path d="m32 32 2 5 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1 2-5Z" />
                    </svg>
                  </span>
                  <b>Fator 5</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Perfumes e aromas</h2>
                <p>Fragrâncias, body splash, hidratantes, aromatizantes e presentes.</p>
                <button onClick={() => openExternal(FATOR5_STORE_URL)}>ABRIR FATOR 5</button>
              </article>

              <article className="shop-store-card amakha-store-card">
                <div className="shop-store-art amakha-art" aria-hidden="true">
                  <span className="partner-icon-bubble amakha-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M24 10h16v10H24zM19 25h26v31H19z" />
                      <path d="m32 32 7 8-7 8-7-8 7-8Z" />
                    </svg>
                  </span>
                  <b>Amakha Paris</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Perfumes e beleza</h2>
                <p>Fragrâncias, cuidados com os cabelos, pele e produtos pessoais.</p>
                <button onClick={() => openExternal(AMAKHA_STORE_URL)}>
                  ABRIR AMAKHA PARIS
                </button>
              </article>

              <article className="shop-store-card biovittare-store-card">
                <div className="shop-store-art biovittare-art" aria-hidden="true">
                  <span className="partner-icon-bubble biovittare-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M18 41h28c0 9-5 15-14 15s-14-6-14-15Z" />
                      <path d="M20 36h24M39 10 25 38M35 8l7 5" />
                      <path d="M28 22c-7-1-11-5-12-11 7 0 12 4 13 10" />
                    </svg>
                  </span>
                  <b>BioVittare</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Manipulação e bem-estar</h2>
                <p>Fórmulas manipuladas e cuidados personalizados com orientação farmacêutica.</p>
                <button onClick={() => openExternal(BIOVITTARE_STORE_URL)}>
                  ABRIR BIOVITTARE
                </button>
              </article>

              <article className="shop-store-card promofarma-store-card">
                <div className="shop-store-art promofarma-art" aria-hidden="true">
                  <span className="partner-icon-bubble promofarma-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M25 10h14v15h15v14H39v15H25V39H10V25h15V10Z" />
                      <path d="M43 12c7 0 11 4 11 10s-4 10-11 10" />
                    </svg>
                  </span>
                  <b>PromoFarma</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Farmácia e cuidados diários</h2>
                <p>Vitaminas, suplementos, dermocosméticos, higiene e itens de saúde.</p>
                <button onClick={() => openExternal(PROMOFARMA_STORE_URL)}>ABRIR PROMOFARMA</button>
              </article>

              <article className="shop-store-card komo-store-card">
                <div className="shop-store-art komo-art" aria-hidden="true">
                  <span className="partner-icon-bubble komo-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M32 8c10 13 17 21 17 31a17 17 0 0 1-34 0c0-10 7-18 17-31Z" />
                      <path d="M25 42c3 4 10 5 14 0M24 31c5-4 11-5 17-2" />
                    </svg>
                  </span>
                  <b>KOMO Wellness</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Cuidado e bem-estar</h2>
                <p>Produtos e tratamentos voltados aos cuidados com o couro cabeludo.</p>
                <button onClick={() => openExternal(KOMO_STORE_URL)}>ABRIR KOMO</button>
              </article>

              <article className="shop-store-card cicatrissim-store-card">
                <div className="shop-store-art cicatrissim-art" aria-hidden="true">
                  <span className="partner-icon-bubble cicatrissim-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M22 12h20l4 44H18l4-44Z" />
                      <path d="M25 12V7h14v5M25 32h14M32 25v14" />
                    </svg>
                  </span>
                  <b>CicatriSSim</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Cuidados com a pele</h2>
                <p>Cremes para estrias e hidratantes para complementar sua rotina corporal.</p>
                <button onClick={() => openExternal(CICATRISSIM_STORE_URL)}>
                  ABRIR CICATRISSIM
                </button>
              </article>

              <article className="shop-store-card cacau-store-card">
                <div className="shop-store-art cacau-art" aria-hidden="true">
                  <span className="partner-icon-bubble cacau-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path d="M32 8c12 8 18 19 18 30 0 11-8 18-18 18s-18-7-18-18c0-11 6-22 18-30Z" />
                      <path d="M32 13v38M20 25c7 3 17 3 24 0M17 38c9 4 21 4 30 0" />
                    </svg>
                  </span>
                  <b>Cacau Show</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Chocolates e presentes</h2>
                <p>Trufas, bombons, tabletes e presentes para momentos especiais.</p>
                <button onClick={() => openExternal(CACAU_SHOW_STORE_URL)}>
                  ABRIR CACAU SHOW
                </button>
              </article>

              <article className="shop-store-card todovino-store-card">
                <div
                  className="shop-store-art todovino-art"
                  aria-hidden="true"
                >
                  <span className="todovino-grapes">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <path className="todovino-stem" d="M33 17c5-7 11-9 17-8-2 7-7 11-16 12" />
                      <path className="todovino-leaf" d="M31 18c-7-7-14-7-19-4 4 7 10 10 19 8" />
                      <circle cx="27" cy="27" r="7" />
                      <circle cx="39" cy="27" r="7" />
                      <circle cx="21" cy="38" r="7" />
                      <circle cx="33" cy="39" r="7" />
                      <circle cx="45" cy="38" r="7" />
                      <circle cx="27" cy="50" r="7" />
                      <circle cx="39" cy="50" r="7" />
                    </svg>
                  </span>
                  <b>TodoVino</b>
                </div>

                <small>VITRINE CREDITI</small>
                <h2>Vinhos para cada ocasião</h2>
                <p>
                  Vinhos, espumantes e rótulos selecionados. Venda somente para maiores de 18 anos.
                </p>

                <button
                  onClick={() =>
                    openExternal(
                      TODOVINO_STORE_URL
                    )
                  }
                >
                  ABRIR TODOVINO
                </button>
              </article>

              <article className="shop-store-card aliancas-store-card">
                <div className="shop-store-art aliancas-art" aria-hidden="true">
                  <span className="partner-icon-bubble aliancas-icon">
                    <svg viewBox="0 0 64 64" focusable="false">
                      <circle cx="25" cy="36" r="15" />
                      <circle cx="40" cy="36" r="15" />
                      <path d="m32 8 6 8-6 7-6-7 6-8Z" />
                    </svg>
                  </span>
                  <b>Casa das Alianças</b>
                </div>
                <small>VITRINE CREDITI</small>
                <h2>Joias para momentos únicos</h2>
                <p>Alianças, anéis, joias e relógios para celebrar histórias especiais.</p>
                <button onClick={() => openExternal(CASA_ALIANCAS_STORE_URL)}>
                  ABRIR CASA DAS ALIANÇAS
                </button>
              </article>
            </div>
          </section>

          <section className="shop-benefits">
            <article>
              <span>01</span>
              <strong>
                Achadinhos selecionados
              </strong>
              <p>
                Uma vitrine organizada para facilitar sua busca.
              </p>
            </article>

            <article>
              <span>02</span>
              <strong>
                Compra na loja escolhida
              </strong>
              <p>
                Pagamento, entrega e atendimento acontecem na plataforma.
              </p>
            </article>

            <article>
              <span>03</span>
              <strong>
                Novidades na vitrine
              </strong>
              <p>
                Os produtos e preços podem mudar conforme a disponibilidade.
              </p>
            </article>
          </section>

          <section className="affiliate-notice">
            <strong>
              Compra segura
            </strong>
            <p>
              Você será direcionado para a loja escolhida. Preços, estoque, pagamento, entrega, troca e garantia são informados e realizados dentro da plataforma.
            </p>
          </section>
        </main>

        <BottomNav
          active="shop"
          onNavigate={navigateMain}
        />
      </div>
    );
  }

  if (
    screen === "chat"
  ) {
    return (
      <div
        className=
          "app chat-app"

        style={{
          height:
            `${chatHeight}px`,
          minHeight:
            `${chatHeight}px`,
          maxHeight:
            `${chatHeight}px`
        }}
      >
        <header
          className=
            "chat-header"
        >
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ‹
          </button>

          <img
            src="/creditin-oficial.png"
            className="avatar"
            alt="Creditin"
          />

          <div>
            <b>
              Crediti IA
            </b>

            <small>
              Assistente da Crediti
            </small>
          </div>
        </header>

        <main
          className="chat"
          ref={chatRef}
        >
          {messages.map(
            (
              message,
              index
            ) => (
              <div
                className={
                  "row " +
                  message.role
                }
                key={index}
              >
                {message.role ===
                  "assistant" && (
                  <img
                    src="/creditin-oficial.png"
                    className=
                      "avatar small"
                    alt=""
                  />
                )}

                <div
                  className=
                    "bubble"
                >
                  {
                    message.text
                  }
                </div>
              </div>
            )
          )}

          {showAnalysts && (
            <div
              className=
                "analyst-options"
            >
              <button
                className=
                  "analyst-button"

                onClick={() =>
                  chooseAnalyst(
                    "samila"
                  )
                }
              >
                <strong>
                  ANALISTA SAMILA
                </strong>

                <small>
                  Continuar pelo WhatsApp
                </small>
              </button>

              {analystOnly !==
                "samila" && (
                  <button
                    className=
                      "analyst-button"

                    onClick={() =>
                      chooseAnalyst(
                        "marcelino"
                      )
                    }
                  >
                    <strong>
                      ANALISTA MARCELINO
                    </strong>

                    <small>
                      Continuar pelo WhatsApp
                    </small>
                  </button>
                )}
            </div>
          )}

          {partnerProduct &&
            PARTNER_PRODUCTS[
              partnerProduct
            ] && (
              <div className="partner-result-card">
                <div className="partner-yellow-detail" />

                <span className="partner-result-label">
                  OPÇÃO ENCONTRADA PARA VOCÊ
                </span>

                <div className="partner-logo-box">
                  {PARTNER_PRODUCTS[partnerProduct].logo ? (
                    <img
                      src={PARTNER_PRODUCTS[partnerProduct].logo}
                      alt={PARTNER_PRODUCTS[partnerProduct].partner}
                    />
                  ) : (
                    <span className={`partner-text-logo ${PARTNER_PRODUCTS[partnerProduct].logoTone || ""}`}>
                      {PARTNER_PRODUCTS[partnerProduct].logoText || PARTNER_PRODUCTS[partnerProduct].partner}
                    </span>
                  )}
                </div>

                <strong className="partner-product-name">
                  {
                    PARTNER_PRODUCTS[
                      partnerProduct
                    ].name
                  }
                </strong>

                <p className="partner-result-text">
                  A simulação, a análise e a contratação serão realizadas no ambiente seguro do parceiro. A aprovação e as condições finais dependem da instituição responsável.
                </p>

                <button
                  className="partner-link-button"
                  onClick={() =>
                    openPartnerLink(
                      partnerProduct
                    )
                  }
                >
                  {
                    PARTNER_PRODUCTS[
                      partnerProduct
                    ].button
                  }
                </button>
              </div>
            )}

          {chatRoutes.length > 0 && (
            <div className="chat-route-options" aria-label="Caminhos encontrados pela Crediti IA">
              {chatRoutes.map((route, index) => {
                const labels = CHAT_ROUTE_LABELS[route.screen];

                return (
                  <button
                    key={`${route.screen}-${route.category || "geral"}-${index}`}
                    onClick={() => openChatRoute(route)}
                  >
                    <span><UiIcon name={route.screen === "shop" ? "shop" : route.screen === "learn" ? "education" : route.screen === "partner" ? "partner" : route.screen === "protect" ? "shield" : route.screen === "organizer" ? "calendar" : route.screen === "business" ? "business" : "services"} /></span>
                    <div>
                      <strong>{labels[0]}</strong>
                      <small>{labels[1]}</small>
                    </div>
                    <b aria-hidden="true">›</b>
                  </button>
                );
              })}
            </div>
          )}

          {busy && (
            <div
              className=
                "row assistant"
            >
              <img
                src="/creditin-oficial.png"
                className=
                  "avatar small"
                alt=""
              />

              <div
                className=
                  "bubble"
              >
                Analisando...
              </div>
            </div>
          )}
        </main>

        <div
          className=
            "composer"
        >
          <input
            value={text}

            onChange=
              {
                handleInputChange
              }

            onKeyDown={
              (event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();

                  sendMessage();
                }
              }
            }

            placeholder={
              step === "name"
                ? "Digite seu nome e sobrenome..."
                : step === "city"
                ? "Digite sua cidade..."
                : step === "phone"
                ? "(XX) XXXXX-XXXX"
                : step === "whatsapp"
                ? "Sim ou não..."
                : "Digite sua dúvida..."
            }

            inputMode={
              step === "phone"
                ? "numeric"
                : "text"
            }
          />

          <button
            className=
              "yellow send"

            onClick=
              {
                sendMessage
              }
          >
            ENVIAR
          </button>
        </div>
      </div>
    );
  }

  if (
    screen ===
    "products"
  ) {
    return (
      <div className="app">
        <header>
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ‹
          </button>

          <div>
            <b>
              Produtos Crediti
            </b>

            <small>
              Conheça antes de contratar
            </small>
          </div>
        </header>

        <main
          className=
            "page product-list"
        >
          {products.map(
            (product) => {
              const visual =
                PRODUCT_VISUALS[
                  product.id
                ] || {
                  icon: "+",
                  label:
                    "Conheça esta opção",
                  tone: "yellow"
                };

              return (
                <button
                  className="product-modern-card"
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(
                      product
                    );

                    setScreen(
                      "productDetail"
                    );
                  }}
                >
                  <span
                    className={
                      "product-visual product-tone-" +
                      visual.tone
                    }
                  >
                    {product.name}
                  </span>

                  <span className="product-modern-copy">
                    <small>
                      {visual.label}
                    </small>
                  </span>

                  <span
                    className="product-modern-arrow"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>
              );
            }
          )}
        </main>
      </div>
    );
  }

  if (
    screen ===
      "productDetail" &&
    selectedProduct
  ) {
    const selectedVisual =
      PRODUCT_VISUALS[
        selectedProduct.id
      ] || {
        icon: "+",
        label: "Conheça esta opção",
        tone: "yellow"
      };

    const selectedPartner =
      PARTNER_PRODUCTS[
        selectedProduct.id
      ];

    return (
      <div
        className=
          "app detail-app"
      >
        <header>
          <button
            className="back"

            onClick={() =>
              setScreen(
                "products"
              )
            }
          >
            ‹
          </button>

          <div>
            <b>
              {
                selectedProduct.name
              }
            </b>

            <small>
              Entenda antes de decidir
            </small>
          </div>
        </header>

        <main
          className=
            "product-detail"
        >
          <div
            className=
              "product-card"
          >
            <div
              className=
                "product-detail-hero"
            >
              <span
                className={
                  "product-visual product-tone-" +
                  selectedVisual.tone
                }
                aria-hidden="true"
              >
                <UiIcon name="credit" />
              </span>

              <div>
                <small>
                  {selectedProduct.typeLabel || "OPÇÃO DE CRÉDITO"}
                </small>

                <h2>
                  {
                    selectedProduct.name
                  }
                </h2>

                <p>
                  {selectedVisual.label}
                </p>
              </div>
            </div>

            <div
              className=
                "info-grid"
            >
              <section>
                <span>01</span>
                <strong>
                  O que é?
                </strong>

                <p>
                  {
                    selectedProduct.what
                  }
                </p>
              </section>

              <section>
                <span>02</span>
                <strong>
                  Para quem é?
                </strong>

                <p>
                  {
                    selectedProduct.forWho
                  }
                </p>
              </section>

              <section>
                <span>03</span>
                <strong>
                  Como funciona?
                </strong>

                <p>
                  {
                    selectedProduct.how
                  }
                </p>
              </section>

              <section>
                <span>04</span>
                <strong>
                  Quando pode ajudar?
                </strong>

                <p>
                  {
                    selectedProduct.when
                  }
                </p>
              </section>
            </div>

            <div
              className=
                "creditin-tip"
            >
              <img
                src="/creditin-oficial.png"
                alt="Creditin"
              />

              <div>
                <strong>
                  Dica do Creditin
                </strong>

                <p>
                  {
                    selectedProduct.tip
                  }
                </p>
              </div>
            </div>

            {selectedPartner && (
              <div
                className="simulation-panel"
              >
                <div className="simulation-heading">
                  <span>{selectedPartner.eyebrow || "SIMULAÇÃO ONLINE"}</span>
                  <strong>
                    {selectedPartner.heading || "Continue com a instituição parceira"}
                  </strong>
                </div>

                <div
                  className="partner-logo-card"
                >
                  {selectedPartner.logo ? (
                    <img
                      src={selectedPartner.logo}
                      alt={selectedPartner.partner}
                    />
                  ) : (
                    <strong
                      className={
                        "partner-text-logo partner-text-logo-" +
                        (selectedPartner.logoTone || "default")
                      }
                    >
                      {selectedPartner.logoText || selectedPartner.partner}
                    </strong>
                  )}
                </div>

                <p>
                  {selectedPartner.note || "Faça sua simulação no ambiente seguro da instituição. A análise, as condições e a contratação são de responsabilidade dela."}
                </p>

                <button
                  className="simulation-button"
                  onClick={() => openPartnerLink(selectedProduct.id)}
                >
                  {selectedPartner.button}
                  <span>›</span>
                </button>
              </div>
            )}

            <div
              className=
                "product-cta"
            >
              <strong>
                {selectedPartner
                  ? "Precisa de ajuda?"
                  : "Gostou dessa opção?"}
              </strong>

              <p>
                {selectedPartner
                  ? "Se preferir, fale com um de nossos analistas pelo WhatsApp."
                  : "Fale com um dos nossos analistas e veja se essa solução faz sentido para você."}
              </p>
            </div>

            {serviceNotice && (
              <div
                className="service-hours-notice"
              >
                <strong>AVISO DE HORÁRIO</strong>
                <span>{serviceNotice}</span>
              </div>
            )}

            <div
              className=
                "product-analysts"
            >
              <button
                onClick={() =>
                  openAnalystWhatsApp(
                    "samila",
                    selectedProduct.name
                  )
                }
              >
                <span>WhatsApp</span>
                <strong>Samila</strong>
                <small>Falar com analista</small>
              </button>

              {selectedProduct.id !== "bolsa" && (
                <button
                  onClick={() =>
                    openAnalystWhatsApp(
                      "marcelino",
                      selectedProduct.name
                    )
                  }
                >
                  <span>WhatsApp</span>
                  <strong>Marcelino</strong>
                  <small>Falar com analista</small>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (
    screen ===
    "human"
  ) {
    return (
      <div className="app">
        <header>
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ‹
          </button>

          <div>
            <b>
              Falar com a Crediti
            </b>

            <small>
              Escolha seu atendimento
            </small>
          </div>
        </header>

        <main className="simple-screen simple-modern-screen">
          <img
            src="/creditin-oficial.png"
            alt="Creditin"
          />

          <h2>
            Fale com a gente
          </h2>

          <p>
            Escolha um de nossos analistas para continuar seu atendimento pelo WhatsApp.
          </p>

          {serviceNotice && (
            <div
              className="service-hours-notice"
              style={{
                width: "100%",
                maxWidth: "480px",
                boxSizing: "border-box",
                background: "#fff7cc",
                border: "2px solid #FDCA01",
                borderRadius: "14px",
                padding: "12px",
                color: "#171717",
                textAlign: "center",
                display: "grid",
                gap: "5px",
                marginBottom: "14px"
              }}
            >
              <strong>AVISO DE HORÁRIO</strong>
              <span>{serviceNotice}</span>
            </div>
          )}

          <div className="simple-action-list">
            <button
              className="simple-action-card"
              onClick={() => openAnalystWhatsApp("samila")}
            >
              <span className="simple-action-icon" aria-hidden="true"><UiIcon name="chat" /></span>
              <span className="simple-action-copy">
                <strong>Samila</strong>
                <small>Falar com a analista pelo WhatsApp</small>
              </span>
              <span className="simple-action-arrow" aria-hidden="true">›</span>
            </button>

            <button
              className="simple-action-card"
              onClick={() => openAnalystWhatsApp("marcelino")}
            >
              <span className="simple-action-icon" aria-hidden="true"><UiIcon name="chat" /></span>
              <span className="simple-action-copy">
                <strong>Marcelino</strong>
                <small>Falar com o analista pelo WhatsApp</small>
              </span>
              <span className="simple-action-arrow" aria-hidden="true">›</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (
    screen ===
    "partner"
  ) {
    return (
      <div className="app">
        <header>
          <button
            className="back"
            onClick={() =>
              setScreen(
                "home"
              )
            }
          >
            ‹
          </button>

          <div>
            <b>
              Renda Extra Crediti
            </b>

            <small>
              Seja nosso parceiro
            </small>
          </div>
        </header>

        <main className="simple-screen simple-modern-screen">
          <img
            src="/creditin-oficial.png"
            alt="Creditin"
          />

          <h2>
            Renda Extra Crediti
          </h2>

          <p>
            Cadastre-se, indique clientes e acompanhe suas oportunidades de crédito em um só lugar.
          </p>

          <button
            className="partner-register-modern"
            onClick={() =>
              openExternal(RENDA_EXTRA_URL)
            }
          >
            <span className="simple-action-icon"><span className="handshake-emoji" role="img" aria-label="Duas mãos se cumprimentando">🤝</span></span>
            <span className="simple-action-copy">
              <strong>Quero me cadastrar</strong>
              <small>Abrir a plataforma Renda Extra Crediti</small>
            </span>
            <span className="simple-action-arrow" aria-hidden="true">›</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app app-white app-with-nav">
      <header className="home-header">
        <div>
          <strong>CREDITI</strong>
          <small>
            Crédito com responsabilidade
          </small>
        </div>

        <img
          src="/icon-192.png?v=7"
          alt=""
        />
      </header>

      <main className="modern-home">
        <section className="home-welcome">
          <div>
            <span className="eyebrow">
              BEM-VINDO À CREDITI
            </span>

            <h1>
              Olá! Como a Crediti pode ajudar você hoje?
            </h1>
          </div>

          <img
            src="/creditin-oficial.png"
            alt="Creditin"
          />
        </section>

        <section className="home-smart-search" aria-label="Buscar no aplicativo">
          <div className="home-search-copy">
            <strong>Me conte o que você precisa</strong>
            <small>Busque usando uma ou duas palavras.</small>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();

              if (homeSearchResults[0]) {
                navigateSearchItem(
                  homeSearchResults[0]
                );
              }
            }}
          >
            <span aria-hidden="true"><UiIcon name="search" /></span>
            <input
              type="search"
              value={homeSearch}
              onChange={(event) => setHomeSearch(event.target.value)}
              placeholder="Ex.: carro, moto, faculdade..."
              aria-label="Conte o que precisa ou busque usando uma ou duas palavras"
            />
            <button type="submit" disabled={!normalizedSearch}>
              BUSCAR
            </button>
          </form>

          {normalizedSearch && (
            <div className="home-search-results">
              {isSearchFallback && (
                <p className="search-fallback-message">
                  Não achei exatamente esse nome, mas estes caminhos podem ajudar:
                </p>
              )}

              {homeSearchResults.length ? (
                homeSearchResults.map((item) => (
                  <button
                    key={
                      item.screen +
                      "-" +
                      item.title
                    }
                    onClick={() =>
                      navigateSearchItem(item)
                    }
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <b aria-hidden="true">›</b>
                  </button>
                ))
              ) : null}
            </div>
          )}

          <div className="home-search-shortcuts">
            <button onClick={() => setHomeSearch("carro")}>Carro</button>
            <button onClick={() => setHomeSearch("moto")}>Moto</button>
            <button onClick={() => setHomeSearch("aposentado")}>Aposentado</button>
            <button onClick={() => setHomeSearch("faculdade")}>Faculdade</button>
            <button onClick={() => setHomeSearch("empresa")}>Empresa</button>
          </div>
        </section>

        <section className="home-personal-tools" aria-label="Ferramentas pessoais">
          <button onClick={() => setScreen("myCrediti")}>
            <span aria-hidden="true"><UiIcon name="star" /></span>
            <div>
              <strong>Minha Crediti</strong>
              <small>
                {upcomingBills.length
                  ? `${upcomingBills.length} vencimento${upcomingBills.length === 1 ? "" : "s"} próximo${upcomingBills.length === 1 ? "" : "s"}`
                  : "Favoritos, histórico e minhas contas"}
              </small>
            </div>
            <b aria-hidden="true">›</b>
          </button>
          <button onClick={() => setScreen("journeys")}>
            <span aria-hidden="true"><UiIcon name="search" /></span>
            <div>
              <strong>Caminhos Crediti</strong>
              <small>Crédito, estudo, empresa e compras conectados</small>
            </div>
            <b aria-hidden="true">›</b>
          </button>
        </section>

        <div className="home-banners">
          <button
            className="home-banner yellow-banner"
            onClick={() =>
              setScreen("direct")
            }
          >
            <HomeBannerVisual type="credit" />
            <small>
              SIMULAÇÃO ONLINE
            </small>
            <strong>
              Encontre opções de crédito
            </strong>
            <span className="home-banner-cta">
              Escolha e simule com segurança ›
            </span>
          </button>

          <button
            className="home-banner pravaler-banner"
            onClick={() =>
              openPartnerLink("pravaler")
            }
          >
            <HomeBannerVisual type="education" />
            <small>
              FINANCIAMENTO ESTUDANTIL
            </small>
            <strong>
              Simule seu financiamento estudantil
            </strong>
            <span className="home-banner-cta">
              Financie sua faculdade ›
            </span>
          </button>

          <button
            className="home-banner dark-banner"
            onClick={() =>
              setScreen("protect")
            }
          >
            <HomeBannerVisual type="security" />
            <small>
              DICA DO CREDITIN
            </small>
            <strong>
              Nunca pague para liberar crédito
            </strong>
            <span className="home-banner-cta">
              Veja como evitar golpes ›
            </span>
          </button>

          <button
            className="home-banner light-banner"
            onClick={() =>
              setScreen("services")
            }
          >
            <HomeBannerVisual type="services" />
            <small>
              SERVIÇOS OFICIAIS
            </small>
            <strong>
              Receita, Banco Central e Serasa
            </strong>
            <span className="home-banner-cta">
              Acesse serviços úteis ›
            </span>
          </button>
        </div>

        <section className="home-section">
          <div className="section-title-row">
            <div>
              <small>ACESSO RÁPIDO</small>
              <h2>O que você deseja fazer?</h2>
            </div>
          </div>

          <div className="quick-grid">
            <button
              className="quick-card primary"
              onClick={() =>
                setScreen("direct")
              }
            >
              <span><UiIcon name="credit" /></span>
              <strong>
                Quero simular agora
              </strong>
              <small>
                Acesse os créditos disponíveis.
              </small>
            </button>

            <button
              className="quick-card"
              onClick={() =>
                openChat()
              }
            >
              <span><UiIcon name="chat" /></span>
              <strong>
                Converse com a Crediti IA
              </strong>
              <small>
                Encontre uma opção para seu perfil.
              </small>
            </button>

            <button
              className="quick-card"
              onClick={() =>
                setScreen("products")
              }
            >
              <span><UiIcon name="products" /></span>
              <strong>
                Conheça nossos produtos
              </strong>
              <small>
                Entenda regras e condições.
              </small>
            </button>

            <button
              className="quick-card"
              onClick={() =>
                setScreen("partner")
              }
            >
              <span><span className="handshake-emoji" role="img" aria-label="Duas mãos se cumprimentando">🤝</span></span>
              <strong>
                Quero ser parceiro
              </strong>
              <small>
                Indique clientes e ganhe.
              </small>
            </button>
          </div>
        </section>

        <section className="home-section">
          <div className="section-title-row">
            <div>
              <small>SIMULE ONLINE</small>
              <h2>Créditos em destaque</h2>
            </div>

            <button
              onClick={() =>
                setScreen("direct")
              }
            >
              Ver todos
            </button>
          </div>

          <div className="product-strip">
            {DIRECT_PRODUCT_KEYS.slice(
              0,
              4
            ).map((productKey) => (
              <button
                className={
                  "product-strip-card product-strip-" +
                  productKey
                }
                key={productKey}
                onClick={() =>
                  openPartnerLink(productKey)
                }
              >
                <div className="product-strip-logo">
                  {PARTNER_PRODUCTS[
                    productKey
                  ].logo ? (
                    <img
                      src={
                        PARTNER_PRODUCTS[
                          productKey
                        ].logo
                      }
                      alt=""
                    />
                  ) : (
                    <span className="product-strip-brand">
                      {
                        PARTNER_PRODUCTS[
                          productKey
                        ].logoText
                      }
                    </span>
                  )}
                </div>

                <strong>
                  {
                    PARTNER_PRODUCTS[
                      productKey
                    ].name
                  }
                </strong>

                <span className="product-strip-action">
                  {productKey === "pravaler"
                    ? "FINANCIAR ›"
                    : "SIMULAR ›"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-section tip-feature">
          <img
            src="/creditin-oficial.png"
            alt=""
          />
          <div>
            <small>DICA DO CREDITIN</small>
            <h2>
              Parcela pequena também precisa caber no orçamento
            </h2>
            <p>
              Antes de contratar, veja quanto sobrará depois das despesas essenciais.
            </p>
            <button
              onClick={() =>
                setScreen("learn")
              }
            >
              VER MAIS DICAS
            </button>
          </div>
        </section>

        <section className="home-section shop-feature">
          <div>
            <small>CREDITI SHOP</small>
            <h2>
              Achadinhos para você
            </h2>
            <p>
              Conheça nossas vitrines de produtos e compre diretamente nas lojas parceiras.
            </p>
          </div>

          <button
            onClick={() =>
              setScreen("shop")
            }
          >
            CONHECER O SHOP
          </button>
        </section>
      </main>

      <BottomNav
        active="home"
        onNavigate={navigateMain}
      />
    </div>
  );
}

createRoot(
  document.getElementById(
    "root"
  )
).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
