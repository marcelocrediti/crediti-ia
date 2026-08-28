import React, {
  useEffect,
  useRef,
  useState
} from "react";

import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL =
  "https://crediti-ia-api.onrender.com";

const SUPABASE_URL =
  "https://vgdtywdpywezrwlrsawq.supabase.co/rest/v1";

const SUPABASE_KEY =
  "sb_publishable_dmoTPKmglghAohv0MrRA9A_2zlUYhER";

const RENDA_EXTRA_URL =
  "https://crediti.startcapital.app/signIn";

const SHOPEE_STORE_URL =
  "https://collshp.com/marceloachou?view=storefront";

const MAGALU_STORE_URL =
  "https://www.influenciadormagalu.com.br/creditishop";

const SHEIN_STORE_URL =
  "https://onelink.shein.com/50/609j6zizsh3r";

const PARTNER_PRODUCTS = {
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
  }
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
  }
];

const DIRECT_PRODUCT_KEYS = [
  "inss",
  "bpc",
  "fgts",
  "clt",
  "cartao",
  "energia"
];

const PRODUCT_VISUALS = {
  inss: {
    icon: "INSS",
    label: "Aposentados e pensionistas",
    tone: "yellow"
  },
  bpc: {
    icon: "🤝",
    label: "Beneficiários BPC/LOAS",
    tone: "soft-yellow"
  },
  clt: {
    icon: "👷",
    label: "Trabalhador com carteira",
    tone: "blue"
  },
  bolsa: {
    icon: "👨‍👩‍👧",
    label: "Beneficiário do programa",
    tone: "green"
  },
  fgts: {
    icon: "FGTS",
    label: "Antecipação de saldo",
    tone: "green"
  },
  cartao: {
    icon: "💳",
    label: "Limite do cartão",
    tone: "purple"
  },
  energia: {
    icon: "💡",
    label: "Crédito pela conta de luz",
    tone: "yellow"
  },
  garantia: {
    icon: "🔑",
    label: "Carro ou moto em garantia",
    tone: "blue"
  },
  "financiamento-carro": {
    icon: "🚗",
    label: "Compre seu carro",
    tone: "yellow"
  },
  "financiamento-moto": {
    icon: "🏍",
    label: "Compre sua moto",
    tone: "orange"
  },
  seguro: {
    icon: "🛡",
    label: "Proteção para carro e moto",
    tone: "blue"
  },
  "consorcio-carro": {
    icon: "🚘",
    label: "Planeje seu próximo carro",
    tone: "soft-yellow"
  },
  "consorcio-moto": {
    icon: "🛵",
    label: "Planeje sua próxima moto",
    tone: "orange"
  },
  "consorcio-pesado": {
    icon: "🚛",
    label: "Caminhões e pesados",
    tone: "blue"
  },
  "consorcio-servicos": {
    icon: "🧰",
    label: "Projetos e serviços",
    tone: "purple"
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

function BottomNav({
  active,
  onNavigate
}) {
  const items = [
    {
      id: "home",
      icon: "⌂",
      label: "Início"
    },
    {
      id: "credit",
      icon: "R$",
      label: "Crédito"
    },
    {
      id: "learn",
      icon: "✓",
      label: "Aprenda"
    },
    {
      id: "services",
      icon: "▦",
      label: "Serviços"
    },
    {
      id: "shop",
      icon: "S",
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
            {item.icon}
          </span>

          <small>{item.label}</small>
        </button>
      ))}
    </nav>
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

function App() {
  const serviceNotice = getServiceNotice();

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
        1600
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

  function openExternal(url) {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openService(item) {
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

      saveLead(
        updatedCustomer,
        "em_atendimento"
      );
    } catch (error) {
      addMessage(
        "assistant",
        "Não consegui responder agora. Tente novamente em alguns segundos."
      );
    } finally {
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
      return;
    }

    window.open(
      product.url,
      "_blank",
      "noopener,noreferrer"
    );
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
          src="/icon-512.png?v=3"
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

          <div className="direct-grid">
            {DIRECT_PRODUCT_KEYS.map(
              (productKey) => {
                const product =
                  PARTNER_PRODUCTS[
                    productKey
                  ];

                return (
                  <article
                    className="direct-card"
                    key={productKey}
                  >
                    <div className="direct-logo">
                      <img
                        src={product.logo}
                        alt={product.partner}
                      />
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
                      className="primary-action"
                      onClick={() =>
                        openPartnerLink(
                          productKey
                        )
                      }
                    >
                      SIMULAR SEU CRÉDITO
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
              <span className="hub-icon">
                R$
              </span>
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
              <span className="hub-icon">
                IA
              </span>
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
              <span className="hub-icon">
                +
              </span>
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
              <span className="hub-icon">
                C
              </span>
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
              EDUCAÇÃO FINANCEIRA
            </span>

            <h1>
              Cuide melhor do seu dinheiro
            </h1>

            <p>
              Conteúdos simples sobre crédito, economia e segurança.
            </p>
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
                          className="service-card"
                          key={item.name}
                          onClick={() =>
                            openService(item)
                          }
                        >
                          <strong>
                            {item.name}
                          </strong>
                          <small>
                            {item.description}
                          </small>
                          <span>
                            ACESSAR ›
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

        <main className="modern-page shop-page">
          <section className="shop-hero">
            <img
              className="shop-delivery-art"
              src="/creditin-moto-shop.png"
              alt="Creditin em uma moto de entrega da Crediti Shop"
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

            <div className="shop-store-carousel">
              <article className="shop-store-card shopee-store-card">
                <div
                  className="shop-store-art"
                  aria-hidden="true"
                >
                  <span>🛍️</span>
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

              <article className="shop-store-card magalu-store-card">
                <div
                  className="shop-store-art magalu-art"
                  aria-hidden="true"
                >
                  <span>🛒</span>
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
                  <img
                    src={
                      PARTNER_PRODUCTS[
                        partnerProduct
                      ].logo
                    }
                    alt={
                      PARTNER_PRODUCTS[
                        partnerProduct
                      ].partner
                    }
                  />
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
                    aria-hidden="true"
                  >
                    {visual.icon}
                  </span>

                  <span className="product-modern-copy">
                    <strong>
                      {product.name}
                    </strong>
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
                {selectedVisual.icon}
              </span>

              <div>
                <small>
                  OPÇÃO DE CRÉDITO
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
                  <span>SIMULAÇÃO ONLINE</span>
                  <strong>
                    Continue com a instituição parceira
                  </strong>
                </div>

                <div
                  className="partner-logo-card"
                >
                  <img
                    src={selectedPartner.logo}
                    alt={selectedPartner.partner}
                  />
                </div>

                <p>
                  Faça sua simulação no ambiente seguro da instituição. A análise, as condições e a contratação são de responsabilidade dela.
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
                border: "2px solid #ffd400",
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
              <span className="simple-action-icon" aria-hidden="true">S</span>
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
              <span className="simple-action-icon" aria-hidden="true">M</span>
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
            É o programa de parceria da Crediti para quem quer trabalhar indicando oportunidades de crédito e ganhar comissões.
          </p>

          <p>
            Você se cadastra na plataforma, conhece os produtos disponíveis, encontra clientes e acompanha suas oportunidades.
          </p>

          <div
            className=
              "partner-tip"
          >
            <strong>
              Dica do Creditin
            </strong>

            <p>
              Trabalhe sempre com informação clara e responsabilidade. Nunca prometa aprovação para o cliente.
            </p>
          </div>

          <button
            className="partner-register-modern"
            onClick={() =>
              window.open(
                RENDA_EXTRA_URL,
                "_blank"
              )
            }
          >
            <span className="simple-action-icon" aria-hidden="true">C</span>
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
          src="/icon-192.png?v=3"
          alt=""
        />
      </header>

      <main className="modern-home">
        <section className="home-welcome">
          <div>
            <span className="eyebrow">
              BEM-VINDO À CREDITI IA
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

        <div className="home-banners">
          <button
            className="home-banner yellow-banner"
            onClick={() =>
              setScreen("direct")
            }
          >
            <small>
              SIMULAÇÃO ONLINE
            </small>
            <strong>
              Encontre opções de crédito
            </strong>
            <span>
              Escolha e simule com segurança ›
            </span>
          </button>

          <button
            className="home-banner dark-banner"
            onClick={() =>
              setScreen("learn")
            }
          >
            <small>
              DICA DO CREDITIN
            </small>
            <strong>
              Nunca pague para liberar crédito
            </strong>
            <span>
              Veja como evitar golpes ›
            </span>
          </button>

          <button
            className="home-banner light-banner"
            onClick={() =>
              setScreen("services")
            }
          >
            <small>
              SERVIÇOS OFICIAIS
            </small>
            <strong>
              Receita, Banco Central e Serasa
            </strong>
            <span>
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
              <span>R$</span>
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
              <span>IA</span>
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
              <span>+</span>
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
              <span>C</span>
              <strong>
                Quero ser parceiro
              </strong>
              <small>
                Conheça o Renda Extra Crediti.
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
                key={productKey}
                onClick={() =>
                  setScreen("direct")
                }
              >
                <img
                  src={
                    PARTNER_PRODUCTS[
                      productKey
                    ].logo
                  }
                  alt=""
                />
                <strong>
                  {
                    PARTNER_PRODUCTS[
                      productKey
                    ].name
                  }
                </strong>
                <span>Simular ›</span>
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
).render(<App />);
