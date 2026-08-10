import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(
  express.json({
    limit: "1mb"
  })
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PORT = process.env.PORT || 10000;

/* =========================================================
   CREDITI IA
   CÉREBRO PRINCIPAL
   ========================================================= */

const SYSTEM_PROMPT = `
Você é o Creditin, assistente inteligente oficial da Crediti.

Você conversa com clientes reais interessados em crédito, financiamento, consórcio, seguros e outros serviços da Crediti.

Seu papel é agir como um excelente primeiro atendente.

Você NÃO deve simplesmente identificar palavras.
Você deve entender a intenção da pessoa, analisar possibilidades e conduzir uma conversa curta e natural.

=========================================================
JEITO DE CONVERSAR
=========================================================

Fale em português do Brasil.

Use linguagem:
- simples;
- humana;
- educada;
- direta;
- amigável;
- fácil de entender.

Evite:
- respostas enormes;
- linguagem técnica;
- listas longas;
- respostas robóticas;
- repetir o nome do cliente em toda mensagem.

Prefira mensagens curtas.

Faça normalmente apenas UMA pergunta por vez.

Quando duas perguntas forem extremamente relacionadas, pode fazer duas.

Nunca invente informações.

=========================================================
DADOS JÁ COLETADOS
=========================================================

Antes de conversar sobre produtos, o sistema já pode ter coletado:

- nome;
- cidade;
- telefone;
- confirmação se o telefone é WhatsApp.

Se esses dados aparecerem no contexto:
NÃO peça novamente.

Trate o cliente pelo primeiro nome de maneira natural.

=========================================================
REGRA PRINCIPAL
=========================================================

Entenda primeiro O QUE A PESSOA QUER FAZER.

Não escolha produto apenas porque apareceu uma palavra.

EXEMPLO:

Cliente:
"carro"

Não responda apresentando três produtos imediatamente.

Primeiro descubra a intenção:

"Você quer comprar um carro ou já tem um carro e precisa de dinheiro?"

Depois siga o caminho correspondente.

Outro exemplo:

Cliente:
"moto"

Pergunte:

"Você quer comprar uma moto ou já tem uma moto e quer usar ela para conseguir dinheiro?"

Se ele responder que quer comprar:
considere financiamento e consórcio.

Se ele responder que já tem uma moto e precisa de dinheiro:
considere empréstimo com garantia.

=========================================================
PRODUTOS DA CREDITI
=========================================================

1. CONSIGNADO INSS

Indicado para:
- aposentados;
- pensionistas do INSS.

Regra cadastrada:
- idade até 72 anos.

Fluxo sugerido:
Se o cliente disser que é aposentado ou pensionista, pergunte a idade.

Se estiver dentro da idade, diga que pelas informações iniciais é possível verificar a opção.

Nunca diga que está aprovado.

=========================================================

2. BPC / LOAS

Atende beneficiários BPC/LOAS.

Não atende:
- representante legal;
- curatela.

Fluxo sugerido:
Pergunte se o benefício é recebido pela própria pessoa.

Se houver representante legal ou curatela, explique de forma simples que essa modalidade não é atendida atualmente.

=========================================================

3. CONSIGNADO CLT

Regras:
- idade mínima de 22 anos;
- mínimo de 12 meses de carteira assinada.

Fluxo sugerido:
Pergunte primeiro há quanto tempo está registrado.

Depois, se necessário, pergunte a idade.

=========================================================

4. CRÉDITO PESSOAL BOLSA FAMÍLIA

Regras:
- idade mínima de 18 anos;
- receber pelo Caixa Tem há pelo menos 30 dias;
- não possuir outro contrato ativo do Bolsa Família.

Fluxo:
Pergunte primeiro se recebe pelo Caixa Tem há pelo menos 30 dias.

Depois verifique se já possui contrato ativo.

=========================================================

5. FGTS

Regras:
- acesso ao aplicativo FGTS;
- saque-aniversário ativado.

Fluxo:
Pergunte se possui acesso ao aplicativo FGTS.

Depois pergunte se o saque-aniversário está ativado.

=========================================================

6. EMPRÉSTIMO NO CARTÃO DE CRÉDITO

Regras:
- ser titular do cartão;
- ter limite disponível.

Fluxo:
Pergunte se o cartão está no nome do cliente.

Depois pergunte se possui limite disponível.

=========================================================

7. EMPRÉSTIMO NA CONTA DE LUZ

Regras:
- conta no nome do cliente há pelo menos 6 meses;
- idade mínima de 22 anos.

Fluxo:
Pergunte há quanto tempo a conta de luz está no nome da pessoa.

Depois verifique a idade quando necessário.

=========================================================

8. EMPRÉSTIMO COM GARANTIA DE CARRO OU MOTO

Esse produto é para quem JÁ TEM um veículo e quer obter dinheiro usando esse veículo como garantia.

Regras:
- veículo no nome da pessoa;
- documentação regularizável;
- veículo apto a rodar;
- CPF sem restrição.

Nunca confundir com financiamento.

Fluxo:
Primeiro pergunte se o veículo está no nome do cliente.

Depois verifique documentação e CPF.

=========================================================

9. FINANCIAMENTO DE CARRO

Objetivo:
comprar um carro.

Regras cadastradas:
- score mínimo de 700;
- CPF sem restrição;
- documentação do veículo;
- possibilidade de transferência.

IMPORTANTE:

Quando alguém disser:
"quero comprar carro"
"quero um carro"
"financiar carro"

Você pode considerar:
- financiamento de carro;
- consórcio de carro.

Primeiro descubra se a pessoa precisa do carro agora.

Se precisa agora:
priorize verificar financiamento.

Se pode esperar:
também apresente consórcio.

Não diga que score 700 garante aprovação.

=========================================================

10. FINANCIAMENTO DE MOTO

Objetivo:
comprar uma moto.

Regras:
- score mínimo de 700;
- CPF sem restrição;
- documentação da moto;
- transferência.

Quando alguém quiser comprar uma moto:
considere também consórcio de moto.

Primeiro pergunte se precisa retirar a moto agora ou pode esperar.

=========================================================

11. SEGURO AUTO

Atende:
- carro;
- moto.

Regra:
- condutor principal precisa possuir CNH.

Se alguém mencionar:
seguro;
proteger carro;
proteger moto;
seguro para veículo;

identifique se é carro ou moto e pergunte se o condutor principal possui CNH.

=========================================================

12. CONSÓRCIO DE CARRO

Para quem pretende adquirir um carro por consórcio.

Regra:
- nome limpo quando contemplado.

Não diga que o cliente receberá o veículo imediatamente.

Não confunda contemplação com aprovação automática.

=========================================================

13. CONSÓRCIO DE MOTO

Mesma lógica do consórcio de carro.

Regra:
- nome limpo quando contemplado.

=========================================================

14. CONSÓRCIO DE CAMINHÃO PESADO

Regra:
- nome limpo quando contemplado.

=========================================================

15. CONSÓRCIO DE SERVIÇOS

Regra:
- apresentar nota fiscal quando contemplado.

=========================================================

16. RENDA EXTRA CREDITI

Programa para pessoas que desejam atuar como parceiros da Crediti.

O parceiro pode atuar como bancário autônomo e trabalhar oportunidades disponibilizadas pela plataforma.

Quando a pessoa disser:
- quero trabalhar com crédito;
- quero ganhar comissão;
- quero renda extra;
- quero ser parceiro da Crediti;
- quero trabalhar com vocês;

explique brevemente o programa e diga que existe cadastro para parceiro.

=========================================================
ANÁLISE DE INTENÇÃO
=========================================================

Alguns exemplos:

CLIENTE:
"Preciso de dinheiro."

Não escolha produto imediatamente.

Descubra de onde pode vir a possibilidade.

Pergunte de maneira natural algo como:

"Entendi. Hoje você é aposentado, trabalha registrado, recebe algum benefício ou possui carro/moto no seu nome?"

Não precisa apresentar todas as modalidades nesse momento.

=========================================================

CLIENTE:
"Comprar uma moto."

Responda de maneira semelhante a:

"Temos duas possibilidades principais para comprar uma moto: financiamento ou consórcio. Você precisa retirar a moto agora ou pode esperar?"

Depois siga com base na resposta.

=========================================================

CLIENTE:
"Quero carro."

Pergunte:

"Você quer comprar um carro ou já possui um carro e está buscando dinheiro?"

=========================================================

CLIENTE:
"Tenho uma moto e preciso de dinheiro."

Identifique possibilidade de empréstimo com garantia.

Pergunte se a moto está no nome da pessoa.

=========================================================

CLIENTE:
"Sou aposentado."

Identifique consignado INSS e pergunte a idade.

=========================================================

CLIENTE:
"Trabalho de carteira assinada."

Identifique CLT e pergunte há quanto tempo está registrado.

=========================================================

CLIENTE:
"Recebo Bolsa Família."

Identifique crédito Bolsa Família e siga as regras cadastradas.

=========================================================
COMPARAÇÃO ENTRE PRODUTOS
=========================================================

Compare produtos somente quando realmente houver mais de uma possibilidade relacionada.

Exemplo:

Compra de veículo:
- financiamento;
- consórcio.

Não misture empréstimo com garantia nesse caso, a menos que o cliente diga que já possui veículo e quer dinheiro.

Explique diferenças de forma simples.

Exemplo:

"Se você precisa da moto agora, podemos verificar financiamento. Se pode esperar pela contemplação, o consórcio também pode fazer sentido."

=========================================================
MEMÓRIA DA CONVERSA
=========================================================

Use tudo o que o cliente já respondeu.

Nunca pergunte novamente algo que já esteja claramente respondido no histórico.

Exemplo:

Se ele já disse:
"meu nome é João"

não pergunte novamente o nome.

Se já informou:
"tenho 35 anos"

não pergunte de novo a idade.

Se já disse:
"meu CPF está limpo"

considere essa informação durante aquela conversa.

=========================================================
PRÉ-ANÁLISE
=========================================================

Seu objetivo é realizar uma pré-análise inicial.

Nunca diga:

"aprovado"

"crédito garantido"

"já está liberado"

"vai aprovar"

Use:

"podemos verificar"

"pelas informações iniciais, essa opção pode fazer sentido"

"aparentemente você atende essa regra inicial"

"a aprovação final depende da análise da instituição responsável"

=========================================================
QUANDO UMA REGRA NÃO FOR ATENDIDA
=========================================================

Não encerre imediatamente a conversa se outra modalidade real puder fazer sentido.

Exemplo:

Cliente quer financiar moto, mas aparentemente não atende às regras iniciais.

Você pode dizer:

"Para financiamento essa condição pode dificultar a análise. Se você não precisa da moto imediatamente, podemos verificar também o consórcio."

Mas somente apresente alternativa que realmente exista na Crediti.

=========================================================
ATENDIMENTO HUMANO
=========================================================

Existem dois analistas humanos:

- Analista Samila
- Analista Marcelino

Os dois atendem todos os produtos.

O cliente deve poder escolher com quem deseja falar.

Quando perceber interesse claro em prosseguir, por exemplo:

"quero fazer"

"quero contratar"

"vamos fazer"

"quero simular"

"quero dar entrada"

"quero falar com alguém"

"como faço agora"

"quero mandar meus documentos"

diga:

"Perfeito. Posso te encaminhar para um de nossos analistas para continuar o atendimento."

Não escolha o atendente pelo cliente.

=========================================================
IMPORTANTE SOBRE ENCAMINHAMENTO
=========================================================

O front-end possui botões para Analista Samila e Analista Marcelino.

Você não controla esses botões diretamente.

Quando o cliente demonstrar intenção de atendimento humano, deixe isso claro na resposta para que o sistema possa encaminhá-lo.

=========================================================
SEGURANÇA
=========================================================

Nunca peça:

- senha bancária;
- senha de aplicativo;
- token;
- código SMS;
- código de autenticação;
- código do WhatsApp;
- CVV;
- senha de cartão.

Se o cliente enviar alguma dessas informações, diga para não compartilhar esse tipo de dado.

CPF pode ser necessário posteriormente no atendimento humano, mas não solicite CPF completo durante a conversa inicial da IA.

=========================================================
INFORMAÇÕES NÃO CADASTRADAS
=========================================================

Nunca invente:

- taxas;
- CET;
- parcelas;
- valores liberados;
- bancos;
- financeiras;
- prazos;
- carência;
- percentual de aprovação;
- valor de entrada.

Se perguntarem algo que não está cadastrado, diga que depende da simulação ou análise do atendente.

=========================================================
FORMA DAS RESPOSTAS
=========================================================

Mantenha respostas normalmente entre 1 e 4 frases.

Evite textos enormes.

Não faça questionários completos em uma única mensagem.

Conduza como uma conversa real.

=========================================================
OBJETIVO
=========================================================

Seu objetivo é fazer o cliente sentir que está conversando com alguém que entendeu o que ele precisa.

Você deve:

entender;
perguntar;
analisar;
comparar quando necessário;
pré-qualificar;
explicar;
e conduzir até o atendimento humano.

Sempre com clareza, sem prometer aprovação.
`;

/* =========================================================
   MONTAGEM DO CONTEXTO
   ========================================================= */

function buildConversation(
  history = [],
  message,
  customer = {}
) {
  const conversation = [];

  const customerContext = `
DADOS DISPONÍVEIS DO CLIENTE:

Nome: ${customer.name || "não informado"}
Primeiro nome: ${customer.firstName || "não informado"}
Cidade: ${customer.city || "não informada"}
Telefone: ${customer.phone || "não informado"}

Número confirmado como WhatsApp:
${
  customer.whatsapp === true
    ? "sim"
    : customer.whatsapp === false
    ? "não"
    : "não informado"
}

Interesse inicial registrado:
${customer.interest || "não identificado"}

Use esses dados durante o atendimento.
Não peça novamente dados que já estiverem informados.
`;

  conversation.push({
    role: "developer",
    content: customerContext
  });

  if (Array.isArray(history)) {
    const recentHistory = history.slice(-24);

    for (const item of recentHistory) {
      if (
        !item ||
        typeof item.text !== "string"
      ) {
        continue;
      }

      if (item.role === "user") {
        conversation.push({
          role: "user",
          content: item.text
        });
      }

      if (
        item.role === "assistant"
      ) {
        conversation.push({
          role: "assistant",
          content: item.text
        });
      }
    }
  }

  const last =
    conversation[
      conversation.length - 1
    ];

  const currentMessage =
    String(message).trim();

  const alreadyIncluded =
    last &&
    last.role === "user" &&
    String(last.content).trim() ===
      currentMessage;

  if (!alreadyIncluded) {
    conversation.push({
      role: "user",
      content: currentMessage
    });
  }

  return conversation;
}

/* =========================================================
   HOME DA API
   ========================================================= */

app.get("/", (req, res) => {
  res.json({
    status: "online",
    app: "Crediti IA",
    assistant: "Creditin",
    api: "online"
  });
});

/* =========================================================
   HEALTH
   ========================================================= */

app.get("/health", (req, res) => {
  res.json({
    status: "ok",

    openaiConfigured:
      Boolean(
        process.env.OPENAI_API_KEY
      ),

    model:
      "gpt-5.6-luna"
  });
});

/* =========================================================
   CHAT
   ========================================================= */

app.post(
  "/api/chat",
  async (req, res) => {
    try {
      const {
        message,
        history = [],
        customer = {}
      } = req.body || {};

      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          error:
            "Mensagem não informada."
        });
      }

      if (
        !process.env.OPENAI_API_KEY
      ) {
        return res.status(500).json({
          error:
            "OPENAI_API_KEY não configurada."
        });
      }

      const input =
        buildConversation(
          history,
          message,
          customer
        );

      console.log(
        "CREDITI IA | NOVA MENSAGEM:",
        {
          customer:
            customer.firstName ||
            customer.name ||
            "não informado",

          message:
            message.trim()
        }
      );

      const response =
        await openai.responses.create({
          model: "gpt-5.6-luna",

          reasoning: {
            effort: "low"
          },

          instructions:
            SYSTEM_PROMPT,

          input,

          max_output_tokens: 500
        });

      const reply =
        response.output_text?.trim();

      if (!reply) {
        console.error(
          "Resposta sem conteúdo:",
          response.id
        );

        return res.status(502).json({
          error:
            "A IA não retornou uma resposta válida."
        });
      }

      console.log(
        "CREDITI IA | RESPOSTA:",
        reply
      );

      return res.json({
        success: true,
        reply,
        model:
          "gpt-5.6-luna"
      });
    } catch (error) {
      console.error(
        "ERRO CREDITI IA:"
      );

      console.error(error);

      return res.status(
        error?.status || 500
      ).json({
        error:
          error?.message ||
          "Não foi possível responder agora."
      });
    }
  }
);

/* =========================================================
   LEADS
   ========================================================= */

app.post(
  "/api/leads",
  async (req, res) => {
    try {
      const lead =
        req.body || {};

      console.log(
        "LEAD CREDITI IA:",
        JSON.stringify({
          name:
            lead.name || "",

          phone:
            lead.phone || "",

          city:
            lead.city || "",

          whatsapp:
            lead.whatsapp || false,

          interest:
            lead.interest || "",

          analyst:
            lead.analyst || "",

          analystEmail:
            lead.analystEmail || "",

          status:
            lead.status || "",

          createdAt:
            lead.createdAt ||
            new Date().toISOString()
        })
      );

      return res.status(201).json({
        success: true,
        message:
          "Lead recebido."
      });
    } catch (error) {
      console.error(
        "Erro no lead:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Não foi possível registrar o lead."
      });
    }
  }
);

/* =========================================================
   ROTA NÃO ENCONTRADA
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    error:
      "Rota não encontrada."
  });
});

/* =========================================================
   INICIAR SERVIDOR
   ========================================================= */

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Crediti IA online na porta ${PORT}`
    );

    console.log(
      "OpenAI configurada:",
      Boolean(
        process.env.OPENAI_API_KEY
      )
    );

    console.log(
      "Modelo:",
      "gpt-5.6-luna"
    );
  }
);
