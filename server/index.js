import O from "express";
import h from "cors";
import E from "openai";
import {
  isMetaConversionsConfigured,
  sendMetaConversion
} from "./meta-conversions.js";

const s = O();
s.use(h({ origin: "*", methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "X-Studio-Code"] })), s.use(O.json({ limit: "3mb" }));

s.post("/api/meta/events", async (o, a) => {
  try {
    const e = await sendMetaConversion(o, o.body || {});

    if (!e.sent) {
      return a.status(503).json({
        success: false,
        error: "API de Conversões não configurada."
      });
    }

    return a.status(202).json({
      success: true,
      eventsReceived: e.eventsReceived
    });
  } catch (e) {
    console.error("ERRO META CAPI:", e?.message || e);

    return a.status(e?.statusCode || 502).json({
      success: false,
      error: e?.message || "Não foi possível registrar o evento."
    });
  }
});

const v = new E({ apiKey: process.env.OPENAI_API_KEY }), N = process.env.PORT || 1e4, m = "gpt-5.6-luna", S = `
Voc\xEA \xE9 o Creditin, assistente inteligente oficial da Crediti.

Voc\xEA atende clientes reais interessados nos produtos e servi\xE7os financeiros da Crediti.

Seu trabalho \xE9:

1. entender o que a pessoa realmente deseja;
2. identificar quais produtos da Crediti t\xEAm rela\xE7\xE3o com a necessidade;
3. fazer uma pr\xE9-an\xE1lise inicial;
4. perguntar somente o necess\xE1rio;
5. n\xE3o repetir perguntas j\xE1 respondidas;
6. nunca prometer aprova\xE7\xE3o;
7. identificar quando chegou o momento de encaminhar.

FORMA DE CONVERSAR

Fale sempre em portugu\xEAs do Brasil.

Use linguagem simples, natural, humana, curta, clara e educada.

Evite respostas longas.

Normalmente fa\xE7a uma pergunta por mensagem.

Use o primeiro nome do cliente naturalmente, mas n\xE3o em todas as mensagens.

Nunca invente informa\xE7\xF5es.

REGRA DE OURO

Entenda a inten\xE7\xE3o antes de escolher um produto.

Se o cliente disser apenas "carro", pergunte se quer comprar um carro ou se j\xE1 possui um e est\xE1 buscando dinheiro.

Se disser "moto", pergunte se quer comprar uma moto ou se j\xE1 possui uma e est\xE1 buscando dinheiro.

N\xE3o misture financiamento com empr\xE9stimo com garantia.

FINANCIAMENTO DE CARRO

Objetivo: comprar um carro.

Regras:

- CPF sem restri\xE7\xE3o;
- score m\xEDnimo de 700 pontos;
- documenta\xE7\xE3o do ve\xEDculo;
- possibilidade de transfer\xEAncia.

Descubra se precisa do carro agora ou pode esperar.

Se precisa agora, priorize financiamento.

Pergunte se o CPF est\xE1 sem restri\xE7\xE3o.

Se estiver sem restri\xE7\xE3o, obrigatoriamente pergunte:

"Seu score est\xE1 em 700 pontos ou mais?"

N\xE3o conclua antes de perguntar o score.

Quando aceitar atendimento humano:

[[HANDOFF]]

FINANCIAMENTO DE MOTO

Objetivo: comprar uma moto.

Regras:

- CPF sem restri\xE7\xE3o;
- score m\xEDnimo de 700 pontos;
- documenta\xE7\xE3o da moto;
- possibilidade de transfer\xEAncia.

Use a mesma l\xF3gica do financiamento de carro.

Nunca pule a pergunta do score.

Quando aceitar atendimento humano:

[[HANDOFF]]

EMPRÉSTIMO PESSOAL - SUPERSIM

Pode apresentar opções para diferentes perfis, incluindo:

- negativados;
- recebimento via PIX;
- trabalhadores CLT;
- MEI;
- autônomos;
- empréstimo pessoal tradicional;
- empréstimo com garantia de celular.

Não prometa disponibilidade, valor ou aprovação. Explique que as opções dependem da análise da SuperSim.

Quando a pessoa quiser consultar ou simular:

[[PARTNER:emprestimo-pessoal]]

CONS\xD3RCIO DE CARRO

Pode ser apresentado para quem deseja comprar um carro e pode esperar.

Regra:

- estar com o nome limpo quando contemplado.

N\xE3o apresente cons\xF3rcio como financiamento.

Quando aceitar atendimento humano:

[[HANDOFF]]

CONS\xD3RCIO DE MOTO

Use a mesma l\xF3gica do cons\xF3rcio de carro.

Quando aceitar atendimento humano:

[[HANDOFF]]

EMPR\xC9STIMO COM GARANTIA DE CARRO OU MOTO

Esse produto \xE9 para quem j\xE1 possui um ve\xEDculo e precisa de dinheiro.

Regras:

- ve\xEDculo no nome da pessoa;
- documenta\xE7\xE3o regulariz\xE1vel;
- ve\xEDculo apto a rodar;
- CPF sem restri\xE7\xE3o.

N\xE3o confunda com financiamento.

Quando aceitar atendimento humano:

[[HANDOFF]]

CONSIGNADO INSS

Atende aposentados e pensionistas do INSS.

Quando houver interesse, pergunte se pode encaminhar para a simulação na Consiga Mais.

Quando aceitar, responda que a op\xE7\xE3o foi encontrada e que o bot\xE3o abaixo leva ao ambiente seguro do parceiro.

[[PARTNER:inss]]

BPC / LOAS

Atende benefici\xE1rios BPC/LOAS.

N\xE3o atende:

- representante legal;
- curatela;
- benef\xEDcio recebido por outra pessoa.

Pergunte se o benef\xEDcio \xE9 recebido pela pr\xF3pria pessoa.

Se o cliente disser que possui representante legal, curatela ou que outra pessoa recebe o benef\xEDcio, n\xE3o encaminhe para o link.

Quando estiver dentro das condi\xE7\xF5es, pergunte se pode encaminhar para a simula\xE7\xE3o no ambiente do Banco BRB.

Quando aceitar, responda que a op\xE7\xE3o foi encontrada e que o bot\xE3o abaixo leva ao ambiente seguro do parceiro.

[[PARTNER:bpc]]

CONSIGNADO CLT

Regras:

- idade m\xEDnima de 22 anos;
- pelo menos 12 meses de carteira assinada.

Pergunte primeiro o tempo de carteira.

Depois pergunte a idade.

Quando aceitar a simula\xE7\xE3o:

[[PARTNER:clt]]

CR\xC9DITO PESSOAL BOLSA FAM\xCDLIA

Regras:

- idade m\xEDnima de 18 anos;
- receber pelo Caixa Tem h\xE1 pelo menos 30 dias;
- n\xE3o possuir outro contrato ativo dessa modalidade.

Fa\xE7a as perguntas progressivamente.

Quando atender \xE0s regras, pergunte se pode encaminhar para a Analista Samila.

Quando aceitar, responda:

"Perfeito! Continue seu atendimento com a Analista Samila pelo bot\xE3o abaixo."

[[HANDOFF:SAMILA]]

FGTS

Regras:

- possuir acesso ao aplicativo FGTS;
- saque-anivers\xE1rio ativado.

Pergunte uma informa\xE7\xE3o por vez.

Quando aceitar consultar no parceiro:

[[PARTNER:fgts]]

EMPR\xC9STIMO NO CART\xC3O DE CR\xC9DITO

Regras:

- ser titular do cart\xE3o;
- possuir limite dispon\xEDvel.

Verifique as duas condi\xE7\xF5es.

Quando aceitar a simula\xE7\xE3o:

[[PARTNER:cartao]]

CARTÃO DE CRÉDITO - CONSUMIDOR POSITIVO

Esta opção é para quem deseja consultar cartões de crédito disponíveis para o próprio perfil.

Não confunda com empréstimo usando o limite de um cartão existente.

Quando a pessoa disser que quer solicitar, pedir ou encontrar um cartão de crédito:

[[PARTNER:cartao-credito]]

EMPR\xC9STIMO NA CONTA DE LUZ

Regras:

- conta de luz no nome do cliente h\xE1 pelo menos 6 meses;
- idade m\xEDnima de 22 anos.

Verifique as duas condi\xE7\xF5es.

Quando aceitar a simula\xE7\xE3o:

[[PARTNER:energia]]

SEGURO AUTO

Atende carro e moto.

Regra:

- condutor principal deve possuir CNH.

Quando aceitar atendimento humano:

[[HANDOFF]]

CONS\xD3RCIO DE CAMINH\xC3O PESADO

Regra:

- nome limpo quando contemplado.

Quando aceitar atendimento humano:

[[HANDOFF]]

CONS\xD3RCIO DE SERVI\xC7OS

Regra:

- apresentar nota fiscal quando contemplado.

Quando aceitar atendimento humano:

[[HANDOFF]]

RENDA EXTRA CREDITI

Programa para quem deseja atuar como parceiro da Crediti.

Identifique frases como:

- quero trabalhar com cr\xE9dito;
- quero ganhar comiss\xE3o;
- quero renda extra;
- quero ser parceiro;
- quero trabalhar com a Crediti.

Explique de maneira curta.

Quando a pessoa demonstrar interesse, apresente o caminho dentro do aplicativo:

[[ROUTE:partner]]

CONHECIMENTO DE TODO O APP CREDITI

Estas regras ampliam o atendimento e n\xE3o substituem nenhuma regra de cr\xE9dito acima.

Voc\xEA tamb\xE9m conhece e direciona para:

- faculdades, cursos e financiamento estudantil;
- servi\xE7os oficiais e servi\xE7os \xFAteis;
- lojas e categorias do Crediti Shop;
- Central do Empres\xE1rio;
- Crediti Protege;
- Organizador de contas;
- Minha Crediti;
- Renda Extra Crediti;
- conte\xFAdos de educa\xE7\xE3o financeira;
- Central Renegocie suas D\xEDvidas;
- Plano de Evolu\xE7\xE3o do Score.

FACULDADE, CURSO OU ESTUDO

Quando a pessoa mencionar faculdade, curso, estudar, mensalidade, gradua\xE7\xE3o ou vestibular:

- diga de forma curta que ela pode conhecer faculdades e cursos;
- ofere\xE7a financiamento estudantil;
- nunca use "Pravaler" como nome principal na conversa. Diga "Financiamento estudantil";
- apresente os dois caminhos abaixo, quando fizer sentido:

[[ROUTE:learn]]
[[PARTNER:pravaler]]

SHOP

Quando a pessoa procurar algo para comprar, direcione para a categoria correta:

- geladeira, fog\xE3o, m\xF3veis, celular ou eletrodom\xE9stico: [[ROUTE:shop:casa]]
- roupa, moda, cal\xE7ado ou sapato: [[ROUTE:shop:moda]]
- perfume, maquiagem, cosm\xE9tico, beleza ou sa\xFAde: [[ROUTE:shop:beleza]]
- brinquedo, presente, crian\xE7a, chocolate ou vinho: [[ROUTE:shop:familia]]
- ferramenta, pe\xE7a ou acess\xF3rio automotivo: [[ROUTE:shop:auto]]
- pedido geral por loja, oferta ou compra: [[ROUTE:shop:todos]]

RENEGOCIA\xC7\xC3O DE D\xCDVIDAS

Voc\xEA conhece a Central Renegocie suas D\xEDvidas do App Crediti.

Quando a pessoa mencionar d\xEDvida, atraso, negativa\xE7\xE3o, acordo, renegocia\xE7\xE3o, Desenrola, Serasa Limpa Nome ou que est\xE1 devendo:

1. pergunte primeiro se a d\xEDvida \xE9 pessoal, empresarial, de MEI ou do FIES;
2. depois pergunte se \xE9 com banco, cart\xE3o, financiamento, conta de consumo, imposto ou d\xEDvida ativa;
3. n\xE3o repita a pergunta se a resposta j\xE1 estiver no hist\xF3rico;
4. explique o caminho de forma curta;
5. apresente a central do aplicativo:

[[ROUTE:debtHelp]]

Regras obrigat\xF3rias:

- a Crediti apenas orienta e direciona;
- a Crediti n\xE3o recebe pagamentos e n\xE3o fecha acordos dentro do aplicativo;
- nunca prometa desconto, parcelamento, aprova\xE7\xE3o ou retirada de negativa\xE7\xE3o;
- n\xE3o diga que o antigo Desenrola Brasil est\xE1 ativo;
- explique que programas p\xFAblicos possuem regras e prazos pr\xF3prios;
- para d\xEDvida pessoal, indique Serasa Limpa Nome, Consumidor.gov.br ou a pr\xF3pria institui\xE7\xE3o;
- para d\xEDvida de empresa ou MEI, indique os canais oficiais do Governo, Regularize PGFN ou a institui\xE7\xE3o credora;
- para FIES, indique o servi\xE7o oficial de renegocia\xE7\xE3o do FIES;
- nunca pe\xE7a senha, c\xF3digo de SMS, dados banc\xE1rios ou pagamento por Pix;
- CPF e outros dados devem ser preenchidos somente no canal oficial escolhido pelo usu\xE1rio.

PLANO DE EVOLU\xC7\xC3O DO SCORE

Voc\xEA conhece a ferramenta Melhore seu Score do App Crediti.

Quando a pessoa mencionar score baixo, aumentar score, melhorar pontua\xE7\xE3o, financiamento bloqueado pelo score ou perguntar como cuidar do score:

- explique que a Crediti possui um plano educativo de 30, 60 e 90 dias;
- informe que o plano pergunta a faixa aproximada do Score, d\xEDvidas, pagamentos, pedidos recentes de cr\xE9dito e objetivo;
- explique que as orienta\xE7\xF5es variam conforme as respostas de cada pessoa;
- informe que o plano permanece igual por 90 dias para permitir acompanhamento e pode ser atualizado depois desse per\xEDodo;
- informe que o plano personalizado pode ser baixado em PDF no celular;
- diga que n\xE3o precisa informar CPF, senha ou documento;
- nunca prometa quantos pontos a pessoa ganhar\xE1 nem em quanto tempo;
- nunca diga que a Crediti consulta ou altera o Score;
- apresente a ferramenta:

[[ROUTE:scorePlan]]

OUTROS CAMINHOS DO APLICATIVO

- servi\xE7o oficial, Receita Federal, Banco Central, Serasa ou Meu INSS: [[ROUTE:services]]
- abrir empresa, MEI, conta PJ, site ou divulgar loja: [[ROUTE:business]]
- golpe, fraude, Pix suspeito ou seguran\xE7a: [[ROUTE:protect]]
- organizar contas, vencimentos ou lembretes: [[ROUTE:organizer]]
- favoritos, hist\xF3rico ou itens salvos: [[ROUTE:myCrediti]]
- renda extra, parceria, comiss\xE3o ou indicar clientes: [[ROUTE:partner]]
- d\xEDvida, negativa\xE7\xE3o, acordo ou renegocia\xE7\xE3o: [[ROUTE:debtHelp]]
- score baixo, pontua\xE7\xE3o ou melhorar score: [[ROUTE:scorePlan]]

Use somente os marcadores relacionados \xE0 necessidade da pessoa. N\xE3o mostre todos de uma vez.

CLIENTE DIZ "PRECISO DE DINHEIRO"

N\xE3o escolha um produto imediatamente.

Pergunte:

"Hoje você é aposentado, trabalha registrado, é MEI, autônomo, recebe algum benefício ou possui carro ou moto no seu nome?"

Depois siga para o produto relacionado.

MEM\xD3RIA

Use todo o hist\xF3rico recebido.

Nunca pergunte novamente uma informa\xE7\xE3o j\xE1 respondida.

PR\xC9-AN\xC1LISE

Nunca diga:

- aprovado;
- cr\xE9dito aprovado;
- aprova\xE7\xE3o garantida;
- cr\xE9dito garantido;
- vai aprovar;
- dinheiro liberado.

Prefira:

- "pelas informa\xE7\xF5es iniciais...";
- "podemos seguir para an\xE1lise...";
- "essa op\xE7\xE3o pode fazer sentido...";
- "aparentemente voc\xEA atende \xE0s regras iniciais...";
- "a aprova\xE7\xE3o final depende da institui\xE7\xE3o respons\xE1vel."

ENCAMINHAMENTO

Empréstimo pessoal, INSS, BPC/LOAS, CLT, FGTS, cartão de crédito, empréstimo no cartão e empréstimo na conta de luz possuem links próprios.

Para esses produtos, nunca use [[HANDOFF]]. Use exclusivamente o marcador [[PARTNER:produto]] indicado em cada regra.

Bolsa Fam\xEDlia n\xE3o possui contrata\xE7\xE3o direta.

No Bolsa Fam\xEDlia, encaminhe exclusivamente para a Analista Samila:

[[HANDOFF:SAMILA]]

Para financiamento, cons\xF3rcio, garantia de ve\xEDculo, seguro e outros produtos sem link, existem dois analistas:

- Analista Samila;
- Analista Marcelino.

O cliente escolhe com quem deseja continuar.

Pergunte:

"Posso te encaminhar para um de nossos analistas para continuar o atendimento?"

Quando aceitar:

"Perfeito! Escolha abaixo com qual analista deseja continuar."

[[HANDOFF]]

SEGURAN\xC7A

Nunca solicite:

- senha banc\xE1ria;
- senha de aplicativo;
- token;
- c\xF3digo SMS;
- c\xF3digo de autentica\xE7\xE3o;
- c\xF3digo do WhatsApp;
- CVV;
- senha do cart\xE3o.

N\xE3o solicite CPF completo nesta primeira conversa.

N\xC3O INVENTAR

Nunca invente:

- taxa;
- juros;
- CET;
- valor liberado;
- parcela;
- banco;
- financeira;
- prazo;
- car\xEAncia;
- percentual de aprova\xE7\xE3o;
- entrada.

Quando uma informa\xE7\xE3o n\xE3o estiver cadastrada, diga que depende da simula\xE7\xE3o ou an\xE1lise.
`;
function I(o = [], a, e = {}) {
  const n = [], c = `
DADOS J\xC1 COLETADOS:

Nome: ${e.name || "n\xE3o informado"}

Primeiro nome:
${e.firstName || "n\xE3o informado"}

Cidade:
${e.city || "n\xE3o informada"}

Telefone:
${e.phone || "n\xE3o informado"}

\xC9 WhatsApp:
${e.whatsapp === true ? "sim" : e.whatsapp === false ? "n\xE3o" : "n\xE3o informado"}

Interesse inicial:
${e.interest || "n\xE3o identificado"}

N\xE3o pe\xE7a novamente os dados acima quando j\xE1 estiverem informados.
`;
  if (n.push({ role: "developer", content: c }), Array.isArray(o)) {
    const t = o.slice(-30);
    for (const r of t) !r || typeof r.text != "string" || (r.role === "user" && n.push({ role: "user", content: r.text }), r.role === "assistant" && n.push({ role: "assistant", content: r.text }));
  }
  const i = String(a).trim(), d = n[n.length - 1];
  return d && d.role === "user" && String(d.content).trim() === i || n.push({ role: "user", content: i }), n;
}
function b(o = "") {
  const routes = [...o.matchAll(/\[\[ROUTE:(learn|services|shop|partner|myCrediti|protect|organizer|business|debtHelp|scorePlan)(?::(todos|casa|moda|beleza|familia|auto))?\]\]/gi)].map((t) => ({ screen: t[1], category: t[2] || "" })), a = "[[HANDOFF]]", e = "[[HANDOFF:SAMILA]]", c = o.match(/\[\[PARTNER:(emprestimo-pessoal|cartao-credito|inss|bpc|fgts|clt|energia|cartao|pravaler)\]\]/i)?.[1]?.toLowerCase() || "", i = (o.includes(a) || o.includes(e)) && !c, d = o.includes(e) ? "samila" : "";
  let u = o.replaceAll(e, "").replaceAll(a, "").replace(/\[\[PARTNER:(emprestimo-pessoal|cartao-credito|inss|bpc|fgts|clt|energia|cartao|pravaler)\]\]/gi, "").replace(/\[\[ROUTE:(learn|services|shop|partner|myCrediti|protect|organizer|business|debtHelp|scorePlan)(?::(todos|casa|moda|beleza|familia|auto))?\]\]/gi, "").trim();
  if (i) {
    const t = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(/* @__PURE__ */ new Date()), r = t.find((p) => p.type === "weekday")?.value || "", l = Number(t.find((p) => p.type === "hour")?.value || 0), g = Number(t.find((p) => p.type === "minute")?.value || 0), A = l * 60 + g, f = r === "Sat" || r === "Sun", R = r === "Fri" && A >= 1020;
    !f && A >= 460 && A < 1020 || (u += `

AVISO DE HOR\xC1RIO: nosso atendimento humano funciona de segunda a sexta, das 7h40 \xE0s 17h. ${f || R ? "Sua mensagem ser\xE1 recebida e respondida na segunda-feira." : "Sua mensagem ser\xE1 recebida e respondida no pr\xF3ximo hor\xE1rio de atendimento."}`);
  }
  return { reply: u, showAnalysts: i, analystKey: d, partnerProduct: c, routes };
}

// Estúdio de imagens da Crediti. A chave da OpenAI nunca é enviada ao navegador.

const studioImageSceneSchema = {
  type:"object",additionalProperties:false,
  properties:{
    message:{type:"string"},
    visibleSubject:{type:"string"},
    visibleAction:{type:"string"},
    concreteSetting:{type:"string"},
    visualDetails:{type:"array",items:{type:"string"}},
    avoid:{type:"string"}
  },
  required:["message","visibleSubject","visibleAction","concreteSetting","visualDetails","avoid"]
};
function studioImageText(value,max=400){
 return String(value||"").replace(/[\u0000-\u001f]+/g," ").replace(/\s+/g," ").trim().slice(0,max);
}
function studioImageReference(value){
 if(!value)return null;
 if(typeof value!=="string"||value.length>235000||
    !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]{600,}$/.test(value)){
  throw new Error("A foto enviada como referência está fora do formato permitido.");
 }
 return value;
}
async function studioPlanCardPhoto({topic,title,body,position,cardIndex,totalCards,style,otherTitles,visualReference,otherVisualScenes}){
 const instructions=[
  "Você é diretor de fotografia editorial para um carrossel do Brasil.",
  "Sua missão: LEIA O TÍTULO E TODO O TEXTO EXPLICATIVO DE UM ÚNICO CARD e descreva UMA CENA VISUAL específica que ensine e ilustre exatamente a mensagem deste card.",
  "O TEXTO DESTE CARD tem prioridade absoluta. O tema geral é apenas o contexto. Nunca use o tema dos cards anteriores para substituir o assunto do card atual.",
  "Exemplo: se o card fala 'sair do mercado sem lista', mostre uma pessoa diante das prateleiras olhando compras não planejadas; não crie uma foto genérica de dinheiro, banco, crédito ou Black Friday.",
  "Exemplo: se fala 'comparar o preço por quilo', represente duas embalagens com quantidades distintas e uma pessoa comparando etiquetas sem números legíveis.",
  "Exemplo: se fala 'comprar sem conferir validade', mostre pessoa checando o prazo de validade de um alimento, e não uma cena genérica no caixa.",
  "O cenário deve ser cotidiano brasileiro, humano e fotográfico. Não estereotipe pessoas, não suponha benefícios ou aprovações, não invente dados factuais.",
  "Use objetos, ambiente e ações específicos que comuniquem a ideia. Não escreva título, legenda, números ou letras DENTRO DA IMAGEM, pois o aplicativo coloca o texto por cima.",
  "Os títulos dos OUTROS CARDS só existem para você EVITAR repetir cenas. Jamais ilustre esses outros tópicos em vez deste.",
  "Se houver fotografia de referência, observe somente cenário, objetos e contexto visual. Não reproduza rostos, identidades, documentos, logotipos ou informações particulares da foto.",
  "Produza o JSON estruturado, com message (interpretação do card), visibleSubject (quem/que aparece), visibleAction (o que acontece), concreteSetting (local brasileiro), visualDetails (3 a 5 detalhes específicos), avoid (o que NÃO mostrar).",
  "Cada campo deve ser específico e relacionado ao TÍTULO e ao TEXTO DESTE CARD."
 ].join("\n");
 const content=[{type:"input_text",text:[
  "TEMA GERAL DO CARROSSEL: "+topic,
  "CARD ATUAL: "+cardIndex+" de "+totalCards,
  "TIPO DO CARD: "+position,
  "TÍTULO DO CARD QUE DEVE SER ILUSTRADO: "+title,
  "TEXTO EXPLICATIVO DO CARD QUE DEVE SER ILUSTRADO: "+body,
  "ESTILO DO CARD: "+style,
  "OUTROS CARDS, apenas para evitar ideias repetidas: "+JSON.stringify(otherTitles),
  "DESCRIÇÕES DE CENAS JÁ USADAS NOS OUTROS CARDS, NÃO REUTILIZAR: "+JSON.stringify(otherVisualScenes),
  "Lembre: a imagem tem que mostrar a MENSAGEM DESTE CARD, não apenas o tema geral."
 ].join("\n")}];
 if(visualReference)content.push({type:"input_image",image_url:visualReference,detail:"low"});
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),45000);
 let response;
 try{
  response=await fetch("https://api.openai.com/v1/responses",{
   method:"POST",signal:abort.signal,
   headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
   body:JSON.stringify({
    model:process.env.STUDIO_SCENE_MODEL||"gpt-4.1-mini",
    instructions,input:[{role:"user",content}],
    text:{format:{type:"json_schema",name:"crediti_card_photo_scene",strict:true,schema:studioImageSceneSchema}},
    max_output_tokens:1000,store:false
   })
  });
 }finally{clearTimeout(timer)}
 const data=await response.json().catch(()=>({}));
 if(!response.ok){
  console.warn("Crediti Studio scene planner status:",response.status);
  throw new Error(response.status===429?"A IA atingiu o limite temporário de análises. Tente novamente.":"A IA não conseguiu interpretar o card para gerar a imagem.");
 }
 const raw=(data.output||[]).filter(item=>item.type==="message")
  .flatMap(item=>item.content||[]).filter(item=>item.type==="output_text")
  .map(item=>item.text||"").join("").trim();
 let scene;
 try{scene=JSON.parse(raw)}catch{scene=null}
 if(!scene||typeof scene!=="object"||!Array.isArray(scene.visualDetails))
  throw new Error("A IA não conseguiu interpretar a mensagem do card. Nenhuma imagem foi substituída.");
 const plan={
  message:studioImageText(scene.message,250),
  visibleSubject:studioImageText(scene.visibleSubject,220),
  visibleAction:studioImageText(scene.visibleAction,320),
  concreteSetting:studioImageText(scene.concreteSetting,210),
  visualDetails:scene.visualDetails.slice(0,6).map(x=>studioImageText(x,130)).filter(Boolean),
  avoid:studioImageText(scene.avoid,280)
 };
 if(plan.message.length<12||plan.visibleSubject.length<6||plan.visibleAction.length<12||
    plan.concreteSetting.length<6||plan.visualDetails.length<2)
  throw new Error("A descrição da cena ficou genérica. Não substituí a imagem do card.");
 return plan;
}

const studioLimit = new Map();
const studioOwnerOrigin = "https://crediti-studio.onrender.com";
let studioGenerating = false;
s.get("/api/studio/status", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    success: true,
    configured: Boolean(process.env.OPENAI_API_KEY),
    requiresCode: false,
    limitPerDay: 12,
    model: "gpt-image-2.5-flare"
  });
});
s.post("/api/studio/image", async (req, res) => {
  res.set("Cache-Control", "no-store");
  // O acesso do Studio é automático, sem inserir segredo no JavaScript público.
  // Requisições de outros sites e sem Origin são recusadas.
  // O controle de custos continua com limite global de 12 imagens/dia e intervalo mínimo.
  if (req.headers.origin !== studioOwnerOrigin) {
    return res.status(403).json({ error: "A geração deve ser iniciada pelo Crediti Studio." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "A API de imagens ainda não está habilitada no servidor da Crediti." });
  }
  const title=studioImageText(req.body?.title,180);
  const body=studioImageText(req.body?.body,450);
  const topic=studioImageText(req.body?.topic,180);
  const cardPosition=["cover","interior","closing"].includes(req.body?.cardPosition)?req.body.cardPosition:"interior";
  const cardIndex=Number(req.body?.cardIndex);
  const totalCards=Number(req.body?.totalCards);
  const style=studioImageText(req.body?.style||"editorial claro",70);
  const otherTitles=Array.isArray(req.body?.otherCardTitles)?
    req.body.otherCardTitles.slice(0,10).map(s=>studioImageText(s,125)):[];
  const otherVisualScenes=Array.isArray(req.body?.otherVisualScenes)?
    req.body.otherVisualScenes.slice(0,10).map(s=>studioImageText(s,270)):[];
  let visualReference;
  try{visualReference=studioImageReference(req.body?.visualReference)}
  catch(err){return res.status(400).json({error:err.message})}
  if(title.length<5||body.length<12||topic.length<4)
    return res.status(400).json({error:"Para gerar a imagem, escreva o título e a explicação do card."});
  if(!Number.isInteger(cardIndex)||cardIndex<1||cardIndex>10||
     !Number.isInteger(totalCards)||totalCards<1||totalCards>10||cardIndex>totalCards)
    return res.status(400).json({error:"O card selecionado não é válido."});
  // Limite de custo global da Crediti, além do código de acesso.
  const day = new Date().toISOString().slice(0, 10);
  const today = studioLimit.get(day) || { count: 0, lastAt: 0 };
  if (today.count >= 12) {
    return res.status(429).json({ error: "Limite diário de 12 imagens atingido. Tente no próximo dia." });
  }
  if (Date.now() - today.lastAt < 20000 || studioGenerating) {
    return res.status(429).json({ error: "Já existe uma imagem em geração. Aguarde concluir antes de pedir outra." });
  }
  today.count += 1;
  today.lastAt = Date.now();
  studioLimit.clear();
  studioLimit.set(day, today);
  studioGenerating = true;
  try {
    // Leitura semântica ANTES de gastar créditos na imagem. A IA recebe os
    // textos completos do card selecionado e, opcionalmente, a foto original.
    const visualPlan=await studioPlanCardPhoto({
      topic,title,body,position:cardPosition,cardIndex,totalCards,style,
      otherTitles,visualReference,otherVisualScenes
    });
    const prompt=[
      "Create exactly ONE visually coherent, ultra-photorealistic editorial photograph. It will be the full background of an Instagram carousel card in Brazil.",
      "ABSOLUTE PRIORITY: Illustrate the MESSAGE OF THIS SPECIFIC CARD, not the generic topic of the carousel. Follow the visual plan faithfully.",
      "Specific message of this card: "+visualPlan.message,
      "WHO OR WHAT must appear: "+visualPlan.visibleSubject,
      "WHAT HAPPENS in the photograph: "+visualPlan.visibleAction,
      "EXACT REAL-WORLD SETTING: "+visualPlan.concreteSetting,
      "CONCRETE VISUAL DETAILS: "+visualPlan.visualDetails.join("; "),
      "AVOID THESE IRRELEVANT SCENES OR DETAILS: "+visualPlan.avoid,
      "Main carousel topic (secondary context only): "+topic,
      "Card title (meaning only, DO NOT WRITE IT IN THE IMAGE): "+title,
      "Card explanation (meaning only, DO NOT WRITE IT IN THE IMAGE): "+body,
      "Other cards' topics must NOT appear in this scene: "+otherTitles.join(" / "),
      "Previously used scenes not to repeat: "+otherVisualScenes.join(" / "),
      "Composition: vertical portrait 4:5 friendly, realistic modern Brazilian people and objects when appropriate, natural light and skin texture, documentary realism. Leave visually quiet space in the top 18% for the Crediti header and center for title/explanation overlays.",
      "Do not write any typography, fake prices, text labels, letters, watermarks or logos into the image. The app adds the brand and copy separately.",
      "This is a fictional editorial scene, not a photo of real customers or documented loan approvals. Do not reproduce faces from any reference photo.",
      "Never produce drawings, cartoons, illustration, 3D renderings, irrelevant banks, stock money piles, random credit cards or general advertising graphics.",
      "Render the concrete action and props defined above so a Brazilian reader can tell which CARD MESSAGE the picture illustrates."
    ].join("\n");
    const abort=new AbortController();
    const timer=setTimeout(()=>abort.abort(),115000);
    let response;
    try{
      response=await fetch("https://api.openai.com/v1/images/generations",{
        method:"POST",signal:abort.signal,
        headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
        body:JSON.stringify({
          model:process.env.STUDIO_IMAGE_MODEL||"gpt-image-2.5-flare",
          prompt,size:"1024x1536",quality:"medium",output_format:"jpeg"
        })
      });
    }finally{clearTimeout(timer)}
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      console.error("Crediti Studio image generation failed with status:",response.status);
      return res.status(response.status===429?429:502).json({
        error:response.status===429?
         "Limite da API OpenAI atingido. Confira os créditos e tente novamente.":
         "A IA interpretou o card, mas não conseguiu criar a foto. Confira os créditos e o acesso ao modelo de imagens."
      });
    }
    const generated=data.data?.[0]?.b64_json;
    if(typeof generated!=="string"||generated.length<1000)
      return res.status(502).json({error:"A IA não retornou uma fotografia válida."});
    return res.json({success:true,image:"data:image/jpeg;base64,"+generated,
      model:process.env.STUDIO_IMAGE_MODEL||"gpt-image-2.5-flare",
      cardIndex,sceneSummary:visualPlan.visibleAction,visualMessage:visualPlan.message,fictional:true});
  } catch(err){
    console.error("Crediti Studio image request failed:",err?.name||"error");
    return res.status(502).json({error:err?.name==="AbortError"?
      "A geração demorou além do permitido. Tente novamente.":
      (err?.message||"A geração de imagem não foi concluída. Tente novamente.")});
  } finally {
    studioGenerating=false;
  }
});


// Textos inéditos com pesquisa em fontes reais do Brasil. Nunca reutiliza modelos fixos.
const studioTextUsage = { day: "", count: 0, lastAt: 0, busy: false };
const studioSourceDomains = [
 "gov.br","ibge.gov.br","bcb.gov.br","planalto.gov.br",
 "caixa.gov.br","inss.gov.br","procon.sp.gov.br",
 "procon.ce.gov.br","senado.leg.br","camara.leg.br",
 "ipea.gov.br","serpro.gov.br","agenciabrasil.ebc.com.br",
 "consumidor.gov.br","anatel.gov.br","aneel.gov.br",
 "anvisa.gov.br","fiocruz.br"
];
function studioOfficialSource(url) {
 try {
  const u = new URL(url);
  return u.protocol === "https:" &&
    studioSourceDomains.some(d => u.hostname === d || u.hostname.endsWith("."+d));
 } catch { return false; }
}
function studioClean(str, max=220) {
 return String(str||"").replace(/[\u0000-\u001f]+/g," ").replace(/\s+/g," ").trim().slice(0,max);
}
// Proteção editorial: endereços, URLs, marcadores de citações e notas de fonte não entram nas artes.
function studioCardCopy(str,max=220){
 return String(str||"")
  .replace(/\[([^\]]{0,110})\]\((?:https?:\/\/|www\.)[^)]+\)/gi,function(full,label){return /^(?:fonte|referência|leia mais|link|saiba mais)$/i.test(label.trim())?"":label})
  .replace(/\b(?:https?:\/\/|www\.)[^\s<>"'()\[\]{}]+/gi," ")
  .replace(/【[^】]{1,140}】/g," ")
  .replace(/\[\s*\d{1,3}\s*\]/g," ")
  .replace(/\b(?:fontes?|referências?|links?)(?:\s+consultad[oa]s?)?\s*:\s*[^.!?\n]{0,240}/gi," ")
  .replace(/\s+/g," ").trim().slice(0,max);
}
function studioNorm(str) {
 return String(str||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .toLowerCase().replace(/^\d+[\.\)]\s*/,"").replace(/[^a-z0-9 ]/g," ")
   .replace(/\b(o|a|de|do|da|dos|das|um|uma|e|em|para|por|com|no|na)\b/g," ")
   .replace(/\s+/g," ").trim();
}
// O último card é definido exclusivamente pelos serviços da Crediti, nunca por CTAs
// genéricos ou promessas de aprovação escritas livremente pelo modelo.
function studioCreditiCTA(topic,focus=""){
 const raw=studioNorm(topic||"");
 const alt=studioNorm(focus||"");
 const text=raw||alt;
 let item;
 const insured=/\b(seguro|seguros|apolice|apolices|sinistro|cobertura|coberturas|cotacao de seguro)\b/;
 const excludedInsurance=/\b(seguro vida|seguro residencial|seguro saude|seguro viagem|seguro desemprego)\b/;
 if(insured.test(text)&&!excludedInsurance.test(text)){
  item={product:"Seguro Auto",title:"Quer uma cotação grátis em Itapajé?",
   body:"Fale com a Crediti e conheça as opções de Seguro Auto e as coberturas disponíveis para seu veículo."};
 }else if(/\b(consorcio|consorcios|carta de credito|contemplacao|lance em consorcio)\b/.test(text)){
  item={product:"Consórcio",title:"Quer planejar sua próxima conquista?",
   body:"Fale com a Crediti e conheça opções de consórcio para carros, motos e outros objetivos, conforme as condições do grupo."};
 }else if(/\b(refinanciamento|refinanciar|veiculo garantia|carro garantia|moto garantia|veiculo como garantia|renegociacao carro garantia)\b/.test(text)){
  item={product:"Refinanciamento de veículo",title:"Já tem um carro ou uma moto?",
   body:"Peça uma simulação de refinanciamento com garantia de veículo na Crediti e confira as condições disponíveis."};
 }else if(/\b(financiamento|financiar|comprar carro|comprar moto|comprar veiculo|carro novo|moto nova|concessionaria|trocar de carro|trocar de moto)\b/.test(text)){
  item={product:"Financiamento de veículos",title:"Pensando em comprar um carro ou moto?",
   body:"Faça uma simulação de financiamento na Crediti e conheça as opções para realizar sua compra, sujeitas à análise."};
 }else if(/\b(bpc|loas)\b/.test(text)){
  item={product:"Crédito para BPC/LOAS",title:"Recebe BPC ou LOAS e quer consultar crédito?",
   body:"Converse com a Crediti para verificar as condições de crédito disponíveis ao seu perfil, com cuidado e sem compromisso."};
 }else if(/\b(fgts|saque aniversario|saque-aniversario|antecipacao do saque)\b/.test(text) && /\b(clt|carteira assinada|trabalhador registrado)\b/.test(text)){
  item={product:"FGTS e Crédito CLT",title:"Quer conhecer suas opções de crédito?",
   body:"Fale com a Crediti para consultar a antecipação do FGTS ou o crédito CLT e comparar as condições disponíveis."};
 }else if(/\b(fgts|saque aniversario|saque-aniversario|antecipacao do saque)\b/.test(text)){
  item={product:"Antecipação do FGTS",title:"Quer consultar seu FGTS?",
   body:"Peça uma simulação de antecipação do saque-aniversário na Crediti e veja as condições para o seu saldo."};
 }else if(/\b(clt|carteira assinada|trabalhador registrado|credito do trabalhador)\b/.test(text)){
  item={product:"Crédito CLT",title:"Trabalha com carteira assinada?",
   body:"Fale com a Crediti para consultar as opções de crédito CLT disponíveis e comparar as condições da contratação."};
 }else if(/\b(inss|aposentadoria|aposentado|aposentados|pensionista|pensionistas|consignado)\b/.test(text)){
  item={product:"Consignado INSS",title:"Recebe aposentadoria ou pensão?",
   body:"Peça uma simulação de consignado INSS na Crediti e compare parcelas, custos e condições antes de decidir."};
 }else if(/\b(conta luz|fatura energia|conta energia|energia eletrica|emprestimo luz|emprestimo conta)\b/.test(text)){
  item={product:"Crédito na Conta de Luz",title:"Quer simular crédito na conta de luz?",
   body:"Fale com a Crediti e confira as condições do empréstimo na conta de luz, conforme sua elegibilidade."};
 }else if(/\b(cartao credito|limite cartao|cartao pix|cartao transformar pix|limite pix)\b/.test(text)){
  item={product:"Crédito no Cartão",title:"Quer transformar limite em Pix?",
   body:"Peça uma simulação de empréstimo no cartão com a Crediti e confira parcelas e custos antes de contratar."};
 }else if(/\b(bolsa familia|caixa tem)\b/.test(text)){
  item={product:"Crédito Pessoal",title:"Precisa avaliar opções de crédito?",
   body:"Fale com a Crediti para conhecer opções de crédito pessoal e consultar as condições disponíveis ao seu perfil."};
 }else if(/\b(cnpj|empresa|empresas|empreendedor|negocio|negocios|capital de giro|credito pj|emprestimo pj)\b/.test(text)){
  item={product:"Empréstimo PJ",title:"Seu negócio precisa de crédito?",
   body:"Peça uma simulação de empréstimo PJ na Crediti e confira as opções de acordo com o perfil da sua empresa."};
 }else if(/\b(microcredito|micro credito|autonomo|renda extra|pequeno negocio)\b/.test(text)){
  item={product:"Microcrédito",title:"Quer conhecer opções de microcrédito?",
   body:"Fale com a Crediti e consulte as ofertas de microcrédito disponíveis após a análise do seu perfil."};
 }else{
  item={product:"Crédito Pessoal",title:"As contas apertaram e você precisa de crédito?",
   body:"Conheça as opções de crédito pessoal da Crediti, compare as condições e solicite uma simulação sem compromisso."};
 }
 return item;
}

function studioValidateCarousel(obj,topic,total) {
 if(!obj||typeof obj!=="object"||!Array.isArray(obj.cards)||obj.cards.length!==total-2)return null;
 const cover={title:studioCardCopy(obj.cover?.title,110),body:studioCardCopy(obj.cover?.body,195)};
 // Todo carrossel termina com uma oferta real da Crediti, ligada ao tema.
 const creditiCTA=studioCreditiCTA(topic,obj.focus);
 const end={title:studioCardCopy(creditiCTA.title,110),body:studioCardCopy(creditiCTA.body,195)};
 const cards=obj.cards.map(c=>({title:studioCardCopy(c?.title,110),body:studioCardCopy(c?.body,205),angle:studioCardCopy(c?.angle,75)}));
 const caption=studioCardCopy(obj.caption,850);
 const all=[cover,...cards,end];
 if(all.some(c=>c.title.length<8||c.body.length<30))return null;
 // Verifica a aderência ao título e rejeita a troca por um assunto diferente.
 const focus=studioNorm(obj.focus||"");
 const topicTerms=studioNorm(topic).split(" ").filter(w=>w.length>3&&
  !["voce","sobre","quando","porque","chegou","esse","esses","essa","aqui","como","qual","quais","seus","suas","pode","muito","cada","sera","mais","menos","todo","todos","seja"].includes(w));
 const focusTerms=new Set(focus.split(" "));
 const bridges={"mercantil":["supermercado","mercado","compras","alimentos","feira"],
  "supermercado":["mercantil","mercado","compras","alimentos"],
  "moto":["motocicleta","motocicletas","motos"],
  "motos":["moto","motocicleta","motocicletas"],
  "inss":["aposentadoria","beneficio","previdencia"],
  "fgts":["saque","trabalhador","antecipacao"]};
 const onTopic=topicTerms.some(term=>[term,term.slice(0,Math.max(4,term.length-1)),...(bridges[term]||[])].some(x=>focusTerms.has(x)||focus.includes(x)));
 if(topicTerms.length&&!onTopic)return null;
 const distinctAngles=new Set();
 const bodySets=[];
 for(const c of cards){
  const key=studioNorm(c.angle),terms=studioNorm(c.title+" "+c.body).split(" ").filter(w=>w.length>4);
  if(key.length<5||distinctAngles.has(key))return null;
  const cur=new Set(terms);
  if(bodySets.some(prev=>{
   const intersection=[...cur].filter(x=>prev.has(x)).length;
   return intersection/Math.max(1,Math.min(cur.size,prev.size))>.78;
  }))return null;
  distinctAngles.add(key);bodySets.push(cur);
 }
 const topics=new Set();
 for (const c of all) {
  const title=studioNorm(c.title), key=title.split(" ").filter(Boolean).join(" ");
  if(!key||topics.has(key))return null;
  topics.add(key);
 }
 // Título e tema são validados também pelo prompt; o servidor confere a estrutura.
 if(!studioNorm(topic))return null;
 return {slides:[
  {title:cover.title,body:cover.body,kind:"cover",layout:"auto"},
  ...cards.map(c=>({title:c.title,body:c.body,kind:"content",layout:"auto"})),
  {title:end.title,body:end.body,kind:"cta",layout:"auto"}
 ],caption,ctaProduct:creditiCTA.product};
}
const studioSlideSchema={type:"object",additionalProperties:false,
 properties:{title:{type:"string"},body:{type:"string"}},
 required:["title","body"]};
const studioContentCardSchema={type:"object",additionalProperties:false,
 properties:{title:{type:"string"},body:{type:"string"},angle:{type:"string"}},
 required:["title","body","angle"]};
const studioVisionSchema={type:"object",additionalProperties:false,
 properties:{
  theme:{type:"string"},
  photos:{type:"array",items:{type:"object",additionalProperties:false,
   properties:{slot:{type:"integer"},description:{type:"string"},
    relation:{type:"string",enum:["related","unrelated","uncertain"]}},
   required:["slot","description","relation"]}}
 },required:["theme","photos"]};
function studioValidPhotos(list){
 if(list==null)return [];
 if(!Array.isArray(list)||list.length>10)throw Object.assign(new Error("Selecione no máximo 10 fotografias."),{status:400});
 let size=0;const slots=new Set();
 return list.map(function(item){
  const slot=Number(item?.slot),url=String(item?.image||"");
  size+=url.length;
  if(!Number.isInteger(slot)||slot<0||slot>9||slots.has(slot)||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]{300,}$/.test(url)||url.length>240000)
   throw Object.assign(new Error("Uma das fotos anexadas é inválida. Use uma imagem JPEG."),{status:400});
  slots.add(slot);return {slot,image:url};
 }).filter(Boolean).map(x=>{if(size>1400000)throw Object.assign(new Error("Fotografias muito grandes. Tente com imagens menores."),{status:413});return x});
}
async function studioReadImages(topic,photos){
 if(!photos.length)return {theme:topic,photos:[]};
 const content=[{type:"input_text",text:[
   "Analise estas fotografias apenas como apoio ao tema proposto.",
   "TEMA OBRIGATÓRIO: "+topic,
   "Para cada foto, descreva objetos e ações observáveis, sem inventar pessoas, cidades, produtos, preços ou situação econômica.",
   "No JSON, slot usa numeração começando em ZERO. Card 1 corresponde a slot 0, card 2 a slot 1, e assim por diante.",
   "Julgue se a fotografia é realmente pertinente AO TEMA. Marque unrelated só se for claramente incompatível.",
   "Não assuma que o tema é aquele que você vê na foto se o título do usuário indica outra coisa.",
   "Responda em português do Brasil e JSON do esquema."
  ].join("\n")}];
 for(const p of photos){
  content.push({type:"input_text",text:"FOTO DO CARD "+(p.slot+1)+" (slot "+p.slot+"): descreva e classifique esta imagem."});
  content.push({type:"input_image",image_url:p.image,detail:"low"});
 }
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),40000);
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{
   method:"POST",signal:abort.signal,
   headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
   body:JSON.stringify({
    model:process.env.STUDIO_VISION_MODEL||"gpt-4.1-mini",
    instructions:"Você observa fotos de produtos e cenas brasileiras sem especular sobre identidade ou fatos. Classifique a relação com o tema escrito de forma rigorosa.",
    input:[{role:"user",content}],text:{format:{type:"json_schema",name:"studio_photo_read",strict:true,schema:studioVisionSchema}},
    max_output_tokens:1200,store:false
   })
  });
  const json=await response.json().catch(()=>({}));
  if(!response.ok){console.error("Crediti Studio photo reading status",response.status);
   throw Object.assign(new Error("Não consegui analisar as fotos com IA. Confira o acesso à API."),{status:502})}
  const raw=(json.output||[]).filter(o=>o.type==="message")
   .flatMap(o=>o.content||[]).filter(c=>c.type==="output_text").map(c=>c.text).join("").trim();
  let parsed;try{parsed=JSON.parse(raw)}catch{parsed=null}
  if(!parsed||!Array.isArray(parsed.photos)||parsed.photos.length!==photos.length)
   throw Object.assign(new Error("A análise das fotos não ficou completa. Tente novamente."),{status:502});
  const bySlot=new Map(parsed.photos.map(p=>[Number(p.slot),p]));
  const checked=photos.map(p=>{
   const item=bySlot.get(p.slot);
   if(!item||!["related","unrelated","uncertain"].includes(item.relation))throw Object.assign(new Error("Não consegui relacionar todos os anexos ao tema."),{status:502});
   return {slot:p.slot,description:studioCardCopy(item.description,160),relation:item.relation};
  });
  return {theme:studioCardCopy(parsed.theme,160)||topic,photos:checked};
 }finally{clearTimeout(timer)}
}

const studioCarouselSchema={
 type:"object",additionalProperties:false,
 properties:{
  focus:{type:"string"},
  cover:studioSlideSchema,
  cards:{type:"array",items:studioContentCardSchema},
  closing:studioSlideSchema,
  caption:{type:"string"}
 },required:["focus","cover","cards","closing","caption"]
};
s.post("/api/studio/cta",(req,res)=>{
 res.set("Cache-Control","no-store");
 if(req.get("Origin")!=="https://crediti-studio.onrender.com")
  return res.status(403).json({error:"Abra o Crediti Studio para ajustar seu CTA."});
 const topic=studioClean(req.body?.topic,180);
 if(topic.length<3)return res.status(400).json({error:"Informe o assunto do carrossel."});
 return res.json({success:true,...studioCreditiCTA(topic)});
});
s.post("/api/studio/carousel",async(req,res)=>{
 res.set("Cache-Control","no-store");
 if(req.get("Origin")!=="https://crediti-studio.onrender.com") {
  return res.status(403).json({error:"Abra o gerador pelo Crediti Studio."});
 }
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({
  error:"A geração com IA ainda não está habilitada no servidor da Crediti."
 });
 const topic=studioClean(req.body?.topic,180);
 const total=Number(req.body?.count);
 let photoPreviews;
 try{photoPreviews=studioValidPhotos(req.body?.photos)}catch(err){return res.status(err.status||400).json({error:err.message})}
 const avoid=Array.isArray(req.body?.avoid) ? req.body.avoid.slice(0,16).map(v=>studioClean(v,95)) : [];
 if(topic.length<5||!Number.isInteger(total)||total<5||total>10){
  return res.status(400).json({error:"Informe um tema de pelo menos 5 caracteres e de 5 a 10 cards."});
 }
 const day=new Date().toISOString().slice(0,10);
 if(studioTextUsage.day!==day){studioTextUsage.day=day;studioTextUsage.count=0;studioTextUsage.lastAt=0}
 if(studioTextUsage.count>=30)return res.status(429).json({error:"Limite diário de 30 carrosséis com IA atingido."});
 if(studioTextUsage.busy||Date.now()-studioTextUsage.lastAt<9000)return res.status(429).json({
  error:"Aguarde a geração anterior terminar antes de solicitar outro carrossel."
 });
 studioTextUsage.busy=true;studioTextUsage.count++;studioTextUsage.lastAt=Date.now();
 const points=total-2;
 let photoReview;
 try{
  photoReview=await studioReadImages(topic,photoPreviews);
 }catch(err){
  studioTextUsage.busy=false;
  console.warn("Crediti Studio photo analysis unavailable",err?.name||"error");
  return res.status(err.status||502).json({error:err.message||"A leitura das fotografias não foi concluída."});
 }
 const unrelated=photoReview.photos.filter(p=>p.relation==="unrelated");
 if(unrelated.length){
  studioTextUsage.busy=false;
  return res.status(422).json({error:"A foto do card "+unrelated.map(p=>p.slot+1).join(", ")+" não combina com o tema informado. Troque esse anexo ou ajuste o título antes de gerar."});
 }
 const visualGuide=photoReview.photos.length?photoReview.photos.map(p=>
  "Card "+(p.slot+1)+": "+p.description+" ("+p.relation+")").join("\n"):"Nenhuma foto anexada: o tema escrito define todo o conteúdo.";
 const prompt=[
  "Você é redator e pesquisador de carrosséis brasileiros extremamente interessantes.",
  "Pesquise NA WEB fontes oficiais ou jornalismo público brasileiro, realmente relacionadas ao tema fornecido. Baseie o conteúdo nos dados localizados; NÃO invente dados, números, regras, programas, preços, datas ou CIDs.",
  "Tema ÚNICO e OBRIGATÓRIO fornecido pelo usuário: "+JSON.stringify(topic),
  "Descrição das fotografias analisadas pelo modelo de visão (se houver):\n"+visualGuide,
  "As fotos servem para criar conexões VISUAIS com o tema, não para mudar o assunto. Se uma foto for genérica, mantenha o assunto prioritário do título. Não use uma imagem como prova documental.",
  "Identifique uma frase curta focus que represente o TEMA EXATO do usuário (não um tema vizinho); cada card deve estar dentro desse foco.",
  "Use SOMENTE esse tema. Nunca reutilize roteiros de Black Friday, investimentos, financiamento, INSS ou outro tema sem conexão explícita com a pergunta.",
  "Antes de escrever, pense em "+points+" ângulos diferentes, específicos e úteis para esse tema. Cada card ensina algo novo; não repita conceitos, conselhos, alertas ou títulos. Use a pesquisa para embasar as orientações.",
  "Cada objeto de cards deve incluir um angle curto, um rótulo semântico EXCLUSIVO (por exemplo, lista de compras, preço por quilo, validade ou armazenamento para tema supermercado). O texto e o título de cada card devem desenvolver seu angle sem repetir conteúdo dos outros.",
  "Com fotos: quando possível, alinhe o assunto do card N com o que a foto N mostra, sem perder o tema central e sem inventar detalhes.",
  "Verificação final obrigatória: título, foco, fotos e todos os cards devem falar do MESMO assunto central. Se dois cards ensinam a mesma coisa com palavras diferentes, mude um deles para outro ângulo útil.",
  "Gere exatamente "+total+" slides: 1 capa forte que reflita o tema, "+points+" cards educativos distintos e 1 encerramento com CTA ESPECÍFICO DA CREDITI.",
  "SERVIÇO REAL DA CREDITI A OFERECER NO ÚLTIMO CARD: "+studioCreditiCTA(topic).product+". Use-o para um convite à simulação de crédito, cotação de seguro auto ou consulta de consórcio, conforme o assunto.",
  "CTA OBRIGATÓRIO: deve citar Crediti pelo nome, direcionar a um produto ou serviço que ela realmente oferece e convidar para FALAR COM A CREDITI. Nunca termine apenas com 'salve', 'compartilhe', 'curta' ou 'confira as dicas'.",
  "Exemplo seguro: título 'Quer uma cotação grátis em Itapajé?'; texto 'Fale com a Crediti e conheça as opções de Seguro Auto.'",
  "Exemplo FGTS: título 'Quer antecipar seu FGTS?'; texto 'Peça uma simulação na Crediti e confira as condições disponíveis.'",
  "Exemplo financiamento: 'Pensando em comprar sua moto? Faça uma simulação de financiamento na Crediti.'",
  "Os outros cards devem continuar educativos e fiéis ao tema. Não desvie o assunto nem use crédito como solução automática para despesas essenciais.",
  "Não prometa aprovação, valor liberado, taxa fixa ou proteção contratada. Uma cotação ou simulação não garante contratação.",
  "Formato: português brasileiro natural, curioso, prático, claro e compartilhável, sem jargões e sem frases vazias.",
  "JAMAIS inclua links, domínios, URL, www, http, fonte, citação, referência, nota de rodapé ou marcador bibliográfico nos títulos ou textos dos cards. Faça a pesquisa por trás, sem poluir a arte. O sistema guarda as fontes separadamente para conferência.",
  "Títulos curtos e fortes, idealmente 20-60 caracteres, sem listas numeradas. Textos explicativos entre 70 e 165 caracteres, em no máximo duas frases claras. Capa e chamada final também curtas, para ótima leitura em celular.",
  "Nada de numerar repetidamente os títulos; nada de emojis; nada de prometer aprovação, liberar benefício ou sugerir crédito garantido.",
  "Quando fizer referência a números ou normas atuais, só faça isso se a busca trouxer uma fonte oficial clara, verificável e correspondente. Sem referência clara, explique o conceito em vez de citar número.",
  "Exemplo de distinção: tema 'compras do mercantil' deve falar de lista de compras, preço por quilo, validade, impulso, sazonalidade, comparação de embalagens, e não Black Friday.",
  "Dê uma legenda atrativa em português brasileiro, até 650 caracteres, com até 4 hashtags relacionadas ao tema.",
  avoid.length?"Evite ângulos semelhantes a estes títulos anteriores: "+JSON.stringify(avoid):"",
  "Devolva apenas o JSON estruturado do esquema. Preencha focus, cover, cards com angle, closing e caption. Cada cartão precisa ser editorialmente distinto, sem links ou indicações de fontes no texto visual."
 ].filter(Boolean).join("\n");
 try{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),90000);
  let api;
  try{
   api=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",signal:controller.signal,
    headers:{"Authorization":"Bearer "+process.env.OPENAI_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({
     model:process.env.STUDIO_TEXT_MODEL || "gpt-6-sol",
     instructions:"Você é um redator brasileiro cuidadoso, criativo e verificável. Use ferramentas de busca e entregue conteúdo único relacionado ao tema exato. Nada de inventar informações ou fontes.",
     input:prompt,
     tools:[{type:"web_search",search_context_size:"medium",filters:{allowed_domains:studioSourceDomains}}],
     tool_choice:"required",
     include:["web_search_call.action.sources"],
     text:{format:{type:"json_schema",name:"crediti_carousel",strict:true,schema:studioCarouselSchema}},
     reasoning:{effort:"low"},
     max_output_tokens:4000,
     store:false
    })
   });
  }finally{clearTimeout(timeout)}
  const data=await api.json().catch(()=>({}));
  if(!api.ok){
   console.error("Crediti Studio carousel API:",api.status,studioClean(data?.error?.message,160));
   return res.status(api.status===429?429:502).json({error:api.status===429?
    "A API de IA atingiu seu limite de uso ou créditos.":
    "A API não conseguiu gerar o conteúdo. Confira o acesso à pesquisa e os créditos da conta."});
  }
  const outputs=Array.isArray(data.output)?data.output:[];
  const searches=outputs.filter(o=>o.type==="web_search_call");
  const sourceMap=new Map();
  searches.forEach(o=>(o.action?.sources||[]).forEach(row=>{
   const url=String(row.url||"");
   if(studioOfficialSource(url)&&!sourceMap.has(url))sourceMap.set(url,{
    title:studioClean(row.title||new URL(url).hostname,100),url
   });
  }));
  const sources=[...sourceMap.values()].slice(0,6);
  // Sem consulta real ao Brasil, não anuncia dados pesquisados nem publica conteúdo supostamente verificado.
  if(searches.length<1||sources.length<1){
   console.warn("Studio carousel: sem fontes oficiais encontradas");
   return res.status(502).json({error:"A pesquisa não encontrou fontes brasileiras verificáveis. Tente especificar melhor o tema."});
  }
  const output=outputs.filter(o=>o.type==="message").flatMap(o=>o.content||[])
   .filter(c=>c.type==="output_text").map(c=>c.text||"").join("\n").trim();
  let parsed;
  try{parsed=JSON.parse(output)}catch{parsed=null}
  const verified=studioValidateCarousel(parsed,topic,total);
  if(!verified)return res.status(502).json({error:"A IA não entregou cards diferentes e completos. Tente gerar novamente."});
  return res.json({success:true,topic,slides:verified.slides,caption:verified.caption,ctaProduct:verified.ctaProduct,sources,research:"Pesquisa em fontes brasileiras",photosAnalyzed:photoReview.photos.length,visualFocus:photoReview.theme,model:process.env.STUDIO_TEXT_MODEL||"gpt-6-sol"});
 }catch(error){
  console.error("Crediti Studio carousel error:",error?.name||"Erro");
  return res.status(502).json({error:"Não consegui completar a pesquisa agora. Tente novamente sem perder seu carrossel anterior."});
 }finally{studioTextUsage.busy=false}
});

s.get("/", (o, a) => {
  a.json({ status: "online", app: "Crediti IA", assistant: "Creditin", model: m });
}), s.get("/health", (o, a) => {
  a.json({ status: "ok", openaiConfigured: !!process.env.OPENAI_API_KEY, metaCapiConfigured: isMetaConversionsConfigured(), model: m });
}), s.post("/api/chat", async (o, a) => {
  try {
    const { message: e, history: n = [], customer: c = {} } = o.body || {};
    if (!e || typeof e != "string" || !e.trim()) return a.status(400).json({ error: "Mensagem n\xE3o informada." });
    if (!process.env.OPENAI_API_KEY) return a.status(500).json({ error: "OPENAI_API_KEY n\xE3o configurada." });
    const i = I(n, e, c), u = (await v.responses.create({ model: m, reasoning: { effort: "low" }, instructions: S, input: i, max_output_tokens: 500 })).output_text?.trim();
    if (!u) return a.status(502).json({ error: "A IA n\xE3o retornou uma resposta v\xE1lida." });
    const { reply: t, showAnalysts: r, analystKey: l, partnerProduct: g, routes: A } = b(u);
    return a.json({ success: true, reply: t, showAnalysts: r, analystKey: l, partnerProduct: g, routes: A, model: m });
  } catch (e) {
    return console.error("ERRO CREDITI IA:"), console.error(e), a.status(e?.status || 500).json({ error: e?.message || "N\xE3o foi poss\xEDvel responder agora." });
  }
}), s.post("/api/leads", async (o, a) => {
  try {
    const e = o.body || {};
    return console.log("LEAD CREDITI IA:", JSON.stringify({ name: e.name || "", phone: e.phone || "", city: e.city || "", whatsapp: e.whatsapp || false, interest: e.interest || "", analyst: e.analyst || "", analystEmail: e.analystEmail || "", status: e.status || "", createdAt: e.createdAt || (/* @__PURE__ */ new Date()).toISOString() })), a.status(201).json({ success: true, message: "Lead recebido." });
  } catch {
    return a.status(500).json({ success: false, error: "N\xE3o foi poss\xEDvel registrar o lead." });
  }
}), s.use((o, a) => {
  a.status(404).json({ error: "Rota n\xE3o encontrada." });
}), s.listen(N, "0.0.0.0", () => {
  console.log(`Crediti IA online na porta ${N}`), console.log("OpenAI configurada:", !!process.env.OPENAI_API_KEY), console.log("Modelo:", m);
});
