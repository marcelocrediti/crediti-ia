import React, {
  useEffect,
  useRef,
  useState
} from "react";

import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL =
  "https://crediti-ia-api.onrender.com";

const ANALYSTS = {
  samila: {
    name: "Samila",
    title: "Analista Samila",
    phone: "(85) 99440-9719",
    whatsapp: "5585994409719",
    email: "samilaf9@gmail.com"
  },

  marcelino: {
    name: "Marcelino",
    title: "Analista Marcelino",
    phone: "(85) 99203-2558",
    whatsapp: "5585992032558",
    email:
      "marcelinoteixeira.santos@gmail.com"
  }
};

/* =========================================================
   PRODUTOS EDUCATIVOS
   ========================================================= */

const products = [
  {
    id: "inss",
    name: "Consignado INSS",

    what:
      "É um crédito voltado para aposentados e pensionistas do INSS. As parcelas são descontadas diretamente do benefício.",

    forWho:
      "Para aposentados e pensionistas que precisam de crédito e querem saber se possuem possibilidade de contratação.",

    how:
      "Primeiro é feita uma análise do benefício e das condições disponíveis. Na Crediti, a regra inicial cadastrada é idade de até 72 anos.",

    when:
      "Pode ser uma opção para quem precisa organizar uma despesa, resolver uma necessidade ou trocar uma dívida mais cara por uma condição que faça mais sentido.",

    tip:
      "Antes de contratar, veja quanto da sua renda já está comprometida. A parcela precisa caber no benefício sem apertar suas despesas do mês."
  },

  {
    id: "bpc",
    name: "BPC / LOAS",

    what:
      "É uma possibilidade de crédito analisada para pessoas que recebem o benefício BPC/LOAS.",

    forWho:
      "Para quem recebe o próprio benefício BPC/LOAS e quer verificar se existe uma opção disponível.",

    how:
      "A Crediti faz uma análise inicial do benefício. Atualmente não atendemos casos com representante legal ou curatela.",

    when:
      "Pode fazer sentido quando o beneficiário precisa de crédito e quer entender quais possibilidades existem para o seu benefício.",

    tip:
      "Não comprometa uma parte grande do benefício. Ele normalmente é usado para despesas essenciais, então a parcela precisa ser confortável."
  },

  {
    id: "clt",
    name: "Consignado CLT",

    what:
      "É uma modalidade voltada para trabalhadores com carteira assinada.",

    forWho:
      "Para trabalhadores registrados que querem verificar uma possibilidade de crédito usando o vínculo de trabalho na análise.",

    how:
      "Na regra cadastrada da Crediti, é necessário ter pelo menos 22 anos e no mínimo 12 meses de carteira assinada.",

    when:
      "Pode ser interessante para quem trabalha registrado e precisa organizar alguma despesa sem recorrer imediatamente ao cartão ou outras dívidas caras.",

    tip:
      "Não olhe só para a parcela. Pense também se ela continuará cabendo no orçamento caso apareça alguma despesa inesperada."
  },

  {
    id: "bolsa",
    name: "Crédito pessoal Bolsa Família",

    what:
      "É uma possibilidade de crédito analisada para pessoas que recebem Bolsa Família.",

    forWho:
      "Para beneficiários maiores de 18 anos que recebem pelo Caixa Tem e querem verificar as condições disponíveis.",

    how:
      "Na regra cadastrada, é necessário receber pelo Caixa Tem há pelo menos 30 dias e não possuir outro contrato ativo dessa modalidade.",

    when:
      "Pode ajudar em uma necessidade específica, desde que a nova parcela não comprometa o dinheiro usado nas despesas básicas da família.",

    tip:
      "O benefício é importante para o orçamento da casa. Antes de contratar qualquer crédito, veja se a parcela não vai faltar para alimentação, água, energia e outras despesas essenciais."
  },

  {
    id: "fgts",
    name: "FGTS",

    what:
      "É uma possibilidade que utiliza valores relacionados ao FGTS do trabalhador.",

    forWho:
      "Para quem possui saldo no FGTS e acesso ao aplicativo.",

    how:
      "Na regra cadastrada, é necessário ter acesso ao aplicativo FGTS e estar com a sistemática de saque-aniversário ativada.",

    when:
      "Pode ser uma alternativa para quem precisa de dinheiro e possui saldo disponível no FGTS.",

    tip:
      "Antes de usar seu FGTS, pense no motivo. Esse dinheiro também pode ser importante em momentos futuros. Use quando realmente fizer sentido."
  },

  {
    id: "cartao",
    name:
      "Empréstimo no cartão de crédito",

    what:
      "É uma possibilidade de transformar parte do limite disponível do cartão em dinheiro, conforme análise.",

    forWho:
      "Para quem possui cartão no próprio nome e limite disponível.",

    how:
      "A pessoa precisa ser titular do cartão utilizado e possuir limite suficiente para a operação.",

    when:
      "Pode ajudar em uma necessidade pontual, principalmente quando a pessoa já sabe como vai organizar o pagamento.",

    tip:
      "Limite de cartão não é dinheiro sobrando. Antes de usar, veja o custo e evite transformar uma necessidade pequena em uma dívida longa."
  },

  {
    id: "energia",
    name:
      "Empréstimo na conta de luz",

    what:
      "É uma modalidade de crédito em que a análise considera a conta de energia do cliente.",

    forWho:
      "Para pessoas que possuem conta de luz no próprio nome e querem verificar uma possibilidade de crédito.",

    how:
      "Na regra cadastrada, a conta precisa estar no nome do cliente há pelo menos 6 meses e a pessoa deve ter no mínimo 22 anos.",

    when:
      "Pode ser uma alternativa para quem precisa de crédito e possui um bom histórico de titularidade da conta.",

    tip:
      "A conta de energia é uma despesa essencial. Veja se o compromisso assumido não vai dificultar o pagamento das contas normais da casa."
  },

  {
    id: "garantia",
    name:
      "Empréstimo com garantia de carro ou moto",

    what:
      "É um crédito para quem já possui carro ou moto e deseja usar o próprio veículo como garantia para conseguir dinheiro.",

    forWho:
      "Para quem já possui um veículo no próprio nome e precisa de dinheiro, sem estar tentando comprar outro veículo.",

    how:
      "Na regra cadastrada, o veículo precisa estar no nome da pessoa, apto a rodar, com documentação regularizável e o CPF deve estar sem restrição.",

    when:
      "Pode fazer sentido para quem já possui patrimônio e precisa levantar dinheiro para uma necessidade específica.",

    tip:
      "Seu veículo é um bem importante. Só use como garantia quando tiver certeza de que a parcela cabe no orçamento."
  },

  {
    id: "financiamento-carro",
    name: "Financiamento de carro",

    what:
      "É uma forma de comprar um carro agora e pagar o valor financiado em parcelas.",

    forWho:
      "Para quem quer comprar um carro e não pretende ou não consegue pagar todo o valor à vista.",

    how:
      "A instituição analisa o perfil do cliente e o veículo. Na regra inicial cadastrada, consideramos CPF sem restrição e score a partir de 700 pontos, além da documentação e transferência do veículo.",

    when:
      "Pode fazer mais sentido para quem precisa do carro agora e possui condições de assumir uma parcela mensal.",

    tip:
      "Não escolha o financiamento apenas pela menor parcela. Veja entrada, prazo e quanto a prestação representa da sua renda."
  },

  {
    id: "financiamento-moto",
    name: "Financiamento de moto",

    what:
      "É uma forma de comprar uma moto agora e pagar o valor financiado ao longo do tempo.",

    forWho:
      "Para quem precisa ou deseja comprar uma moto e não vai pagar todo o valor à vista.",

    how:
      "A instituição analisa o perfil do cliente e a moto. Na regra inicial cadastrada, consideramos CPF sem restrição e score a partir de 700 pontos, além da documentação e transferência.",

    when:
      "Pode fazer sentido para quem precisa da moto agora, seja para trabalhar, se locomover ou resolver uma necessidade pessoal.",

    tip:
      "Além da parcela, lembre de combustível, manutenção, documentação e seguro. A moto precisa caber no orçamento completo."
  },

  {
    id: "seguro",
    name:
      "Seguro Auto para carro ou moto",

    what:
      "É uma proteção para ajudar o proprietário do veículo em situações previstas na contratação do seguro.",

    forWho:
      "Para quem possui carro ou moto e quer reduzir o impacto financeiro de determinados imprevistos.",

    how:
      "As condições dependem da análise e do plano escolhido. Na regra cadastrada, o condutor principal deve possuir CNH.",

    when:
      "Pode fazer sentido para quem depende do veículo no dia a dia e não quer ficar totalmente exposto a um prejuízo inesperado.",

    tip:
      "Não escolha seguro apenas pelo preço. Veja o que realmente está protegido e se a cobertura combina com sua rotina."
  },

  {
    id: "consorcio-carro",
    name: "Consórcio de carro",

    what:
      "É uma forma de planejar a compra de um carro por meio de um grupo de consórcio, sem ser a mesma coisa que financiamento.",

    forWho:
      "Para quem deseja comprar um carro, mas não precisa necessariamente retirar o veículo imediatamente.",

    how:
      "O cliente participa do grupo e aguarda a contemplação conforme as regras do consórcio. Na regra cadastrada, é necessário estar com o nome limpo quando for contemplado.",

    when:
      "Pode fazer sentido para quem consegue se planejar e aceita esperar pela contemplação.",

    tip:
      "Consórcio exige paciência e planejamento. Não entre contando com contemplação imediata."
  },

  {
    id: "consorcio-moto",
    name: "Consórcio de moto",

    what:
      "É uma maneira de planejar a compra de uma moto por meio de um grupo de consórcio.",

    forWho:
      "Para quem quer uma moto, mas não precisa necessariamente pegar o veículo agora.",

    how:
      "O participante entra em um grupo e aguarda a contemplação conforme as regras do consórcio. É necessário estar com o nome limpo no momento da contemplação.",

    when:
      "Pode ser uma opção para quem prefere se organizar para uma compra futura.",

    tip:
      "Se você precisa da moto imediatamente, compare com financiamento. Se pode esperar, o consórcio pode ser estudado com mais calma."
  },

  {
    id: "consorcio-pesado",
    name:
      "Consórcio de caminhão pesado",

    what:
      "É uma modalidade de consórcio voltada para quem deseja adquirir caminhão ou veículo pesado.",

    forWho:
      "Para quem pretende comprar um veículo pesado e consegue planejar a aquisição.",

    how:
      "O cliente participa do grupo e aguarda a contemplação. Na regra cadastrada, precisa estar com o nome limpo quando for contemplado.",

    when:
      "Pode fazer sentido para quem trabalha ou pretende trabalhar com transporte e não precisa do veículo de forma imediata.",

    tip:
      "Antes de assumir a parcela, coloque na conta combustível, manutenção, seguro e os demais custos do veículo pesado."
  },

  {
    id: "consorcio-servicos",
    name: "Consórcio de serviços",

    what:
      "É uma modalidade de consórcio usada para contratar determinados tipos de serviços.",

    forWho:
      "Para quem quer se planejar financeiramente para realizar um serviço no futuro.",

    how:
      "Depois da contemplação, é necessário seguir as regras da administradora. Na regra cadastrada, deve ser apresentada nota fiscal do serviço.",

    when:
      "Pode fazer sentido para quem possui um projeto planejado e não precisa realizar o serviço imediatamente.",

    tip:
      "Defina primeiro quanto realmente precisa para o serviço. Evite assumir uma carta maior apenas porque a parcela parece pequena."
  }
];

/* =========================================================
   FUNÇÕES BÁSICAS
   ========================================================= */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  }

  if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function formatPhone(value) {
  const numbers = String(value)
    .replace(/\D/g, "")
    .slice(0, 11);

  if (!numbers) return "";

  if (numbers.length <= 2) {
    return `(${numbers}`;
  }

  const ddd = numbers.slice(0, 2);
  const rest = numbers.slice(2);

  if (rest.length <= 5) {
    return `(${ddd}) ${rest}`;
  }

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
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

function looksLikeGreetingInsteadOfName(
  value
) {
  const text = normalize(value);

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
    "e ai",
    "hey",
    "hello"
  ].includes(text);
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [screen, setScreen] =
    useState("home");

  const [messages, setMessages] =
    useState([]);

  const [text, setText] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [chatHeight, setChatHeight] =
    useState(window.innerHeight);

  const [step, setStep] =
    useState("name");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [customer, setCustomer] =
    useState({
      name: "",
      city: "",
      phone: "",
      whatsapp: false,
      interest: "",
      analyst: "",
      analystEmail: ""
    });

  const [
    pendingMessage,
    setPendingMessage
  ] = useState("");

  const [
    showAnalysts,
    setShowAnalysts
  ] = useState(false);

  const chatRef =
    useRef(null);

  const messagesRef =
    useRef([]);

  useEffect(() => {
    messagesRef.current =
      messages;
  }, [messages]);

  /* ======================================================
     TECLADO DO IPHONE
     ====================================================== */

  useEffect(() => {
    if (screen !== "chat") {
      return;
    }

    const updateViewport = () => {
      const viewport =
        window.visualViewport;

      const height = viewport
        ? viewport.height
        : window.innerHeight;

      setChatHeight(height);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    };

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    if (
      window.visualViewport
    ) {
      window.visualViewport.addEventListener(
        "resize",
        updateViewport
      );

      window.visualViewport.addEventListener(
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
        window.visualViewport.removeEventListener(
          "resize",
          updateViewport
        );

        window.visualViewport.removeEventListener(
          "scroll",
          updateViewport
        );
      }
    };
  }, [screen]);

  /* ======================================================
     ROLAGEM DO CHAT
     ====================================================== */

  useEffect(() => {
    if (screen !== "chat") {
      return;
    }

    const chat =
      chatRef.current;

    if (!chat) {
      return;
    }

    requestAnimationFrame(() => {
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "smooth"
      });
    });
  }, [
    messages,
    busy,
    showAnalysts,
    screen
  ]);

  /* ======================================================
     MENSAGEM
     ====================================================== */

  function addMessage(
    role,
    messageText
  ) {
    const message = {
      role,
      text: messageText
    };

    setMessages((current) => {
      const next = [
        ...current,
        message
      ];

      messagesRef.current =
        next;

      return next;
    });
  }

  /* ======================================================
     LEADS
     ====================================================== */

  async function saveLead(
    data,
    status = "em_atendimento"
  ) {
    try {
      await fetch(
        `${API_URL}/api/leads`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name:
              data.name || "",

            phone:
              data.phone || "",

            city:
              data.city || "",

            whatsapp:
              data.whatsapp || false,

            interest:
              data.interest || "",

            analyst:
              data.analyst || "",

            analystEmail:
              data.analystEmail || "",

            status,

            createdAt:
              new Date().toISOString()
          })
        }
      );
    } catch (error) {
      console.log(
        "Lead não registrado:",
        error
      );
    }
  }

  /* ======================================================
     ABRIR CHAT
     ====================================================== */

  function openChat(
    firstMessage = ""
  ) {
    const greeting =
      getGreeting();

    const initialMessages = [
      {
        role: "assistant",

        text:
          `${greeting}! Eu sou o Creditin, assistente da Crediti. Tudo bem? Para começar, como posso te chamar?`
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
      analyst: "",
      analystEmail: ""
    });

    setStep("name");
    setText("");

    setShowAnalysts(false);

    setPendingMessage(
      firstMessage || ""
    );

    setScreen("chat");
  }

  /* ======================================================
     ENTREVISTA INICIAL
     ====================================================== */

  function handleRegistration(
    value
  ) {
    const cleanValue =
      String(value).trim();

    if (
      step === "name"
    ) {
      if (
        cleanValue.length < 2 ||
        looksLikeGreetingInsteadOfName(
          cleanValue
        )
      ) {
        addMessage(
          "assistant",
          "Tudo bem! Agora me diz seu nome para eu poder te atender direitinho."
        );

        return;
      }

      const name =
        cleanValue;

      const shortName =
        firstName(name);

      setCustomer(
        (current) => ({
          ...current,
          name
        })
      );

      setStep("city");

      addMessage(
        "assistant",
        `Prazer, ${shortName}! De qual cidade você está falando?`
      );

      return;
    }

    if (
      step === "city"
    ) {
      if (
        cleanValue.length < 2
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
        numbers.length !== 11
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

      setStep("whatsapp");

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
        normalize(cleanValue);

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
        ].includes(answer);

      const no =
        [
          "nao",
          "n"
        ].includes(answer);

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

      const updatedCustomer = {
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

        setPendingMessage("");

        addMessage(
          "assistant",
          `Perfeito, ${firstName(updatedCustomer.name)}. Já tenho seus dados básicos. Agora vou analisar o que você procura.`
        );

        setTimeout(() => {
          sendToAI(
            request,
            updatedCustomer
          );
        }, 250);
      } else {
        addMessage(
          "assistant",
          `Perfeito, ${firstName(updatedCustomer.name)}. Agora me conta o que você precisa e eu vou buscar a melhor opção para você.`
        );
      }
    }
  }

  /* ======================================================
     IA
     ====================================================== */

  async function sendToAI(
    value,
    customerData = customer
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

    const updatedCustomer = {
      ...customerData,

      interest:
        customerData.interest ||
        value
    };

    setCustomer(
      updatedCustomer
    );

    try {
      const controller =
        new AbortController();

      const timeout =
        setTimeout(() => {
          controller.abort();
        }, 65000);

      const response =
        await fetch(
          `${API_URL}/api/chat`,
          {
            method: "POST",

            signal:
              controller.signal,

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              message: value,

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

      clearTimeout(
        timeout
      );

      const rawText =
        await response.text();

      let data = {};

      try {
        data = rawText
          ? JSON.parse(
              rawText
            )
          : {};
      } catch {
        data = {
          error: rawText
        };
      }

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ||
            `Erro ${response.status}`
        );
      }

      if (
        !data.reply
      ) {
        throw new Error(
          "A API respondeu, mas não retornou texto."
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
        setShowAnalysts(
          true
        );

        saveLead(
          updatedCustomer,
          "aguardando_escolha_analista"
        );
      }

      saveLead(
        updatedCustomer,
        "em_atendimento"
      );
    } catch (error) {
      console.error(
        "ERRO CREDITI IA:",
        error
      );

      if (
        error?.name ===
        "AbortError"
      ) {
        addMessage(
          "assistant",
          "O atendimento demorou mais que o esperado. Tente novamente em alguns segundos."
        );
      } else {
        addMessage(
          "assistant",
          `Erro no atendimento: ${
            error?.message ||
            "não identificado"
          }`
        );
      }
    } finally {
      setBusy(false);
    }
  }

  /* ======================================================
     ENVIAR CHAT
     ====================================================== */

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

  /* ======================================================
     WHATSAPP
     ====================================================== */

  function openAnalystWhatsApp(
    analystKey,
    productName = ""
  ) {
    const analyst =
      ANALYSTS[analystKey];

    if (!analyst) {
      return;
    }

    let whatsappMessage;

    if (productName) {
      whatsappMessage =
        `Olá, ${analyst.name}! ` +
        `Conheci o produto "${productName}" pelo Crediti IA ` +
        `e gostaria de saber mais e verificar as possibilidades para mim.`;
    } else {
      const interest =
        customer.interest ||
        "uma solução da Crediti";

      whatsappMessage =
        `Olá, ${analyst.name}! ` +
        `Meu nome é ${customer.name || ""}. ` +
        `${
          customer.city
            ? `Sou de ${customer.city}. `
            : ""
        }` +
        `Fiz meu atendimento pelo Crediti IA ` +
        `e tenho interesse em ${interest}.`;
    }

    const url =
      "https://wa.me/" +
      analyst.whatsapp +
      "?text=" +
      encodeURIComponent(
        whatsappMessage
      );

    window.open(
      url,
      "_blank"
    );
  }

  function chooseAnalyst(
    analystKey
  ) {
    const analyst =
      ANALYSTS[analystKey];

    if (!analyst) {
      return;
    }

    const updatedCustomer = {
      ...customer,

      analyst:
        analyst.title,

      analystEmail:
        analyst.email
    };

    setCustomer(
      updatedCustomer
    );

    setShowAnalysts(false);

    saveLead(
      updatedCustomer,
      "encaminhado"
    );

    addMessage(
      "assistant",
      `Certo, ${firstName(updatedCustomer.name)}! Vou te encaminhar para ${analyst.title}.`
    );

    setTimeout(() => {
      openAnalystWhatsApp(
        analystKey
      );
    }, 250);
  }

  /* ======================================================
     RENDA EXTRA
     ====================================================== */

  function becomePartner() {
    const url =
      import.meta.env
        .VITE_RENDA_EXTRA_URL;

    if (url) {
      window.open(
        url,
        "_blank"
      );
    } else {
      alert(
        "O link do Renda Extra ainda será configurado."
      );
    }
  }

  /* ======================================================
     CHAT
     ====================================================== */

  if (
    screen === "chat"
  ) {
    return (
      <div
        className="app chat-app"

        style={{
          height:
            `${chatHeight}px`,

          minHeight:
            `${chatHeight}px`,

          maxHeight:
            `${chatHeight}px`
        }}
      >
        <header className="chat-header">

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
            src="/creditin.png"
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
                    src="/creditin.png"
                    className="avatar small"
                    alt=""
                  />
                )}

                <div className="bubble">
                  {message.text}
                </div>

              </div>
            )
          )}

          {showAnalysts && (
            <div className="analyst-options">

              <button
                className="analyst-button"

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

              <button
                className="analyst-button"

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

            </div>
          )}

          {busy && (
            <div className="row assistant">

              <img
                src="/creditin.png"
                className="avatar small"
                alt=""
              />

              <div className="bubble">
                Analisando...
              </div>

            </div>
          )}

        </main>

        <div className="composer">

          <input
            value={text}

            onChange={
              handleInputChange
            }

            onFocus={() => {
              setTimeout(() => {
                window.scrollTo(
                  0,
                  0
                );
              }, 100);
            }}

            onKeyDown={(event) => {
              if (
                event.key ===
                "Enter"
              ) {
                event.preventDefault();

                sendMessage();
              }
            }}

            placeholder={
              step === "name"
                ? "Digite seu nome..."

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

            autoComplete={
              step === "phone"
                ? "tel"
                : "off"
            }
          />

          <button
            className="yellow send"

            onClick={
              sendMessage
            }
          >
            ENVIAR
          </button>

        </div>
      </div>
    );
  }

  /* ======================================================
     LISTA DE PRODUTOS
     ====================================================== */

  if (
    screen === "products"
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

        <main className="page">

          {products.map(
            (product) => (
              <button
                className="yellow"

                key={
                  product.id
                }

                onClick={() => {
                  setSelectedProduct(
                    product
                  );

                  setScreen(
                    "productDetail"
                  );
                }}
              >
                {product.name}
              </button>
            )
          )}

        </main>
      </div>
    );
  }

  /* ======================================================
     DETALHE EDUCATIVO DO PRODUTO
     ====================================================== */

  if (
    screen ===
      "productDetail" &&
    selectedProduct
  ) {
    return (
      <div className="app">

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
              {selectedProduct.name}
            </b>

            <small>
              Entenda antes de decidir
            </small>
          </div>

        </header>

        <main className="page">

          <section className="partner">

            <img
              src="/creditin.png"
              alt="Creditin"
            />

            <h2>
              {selectedProduct.name}
            </h2>

            <p>
              <strong>
                O que é?
              </strong>
              <br />
              {
                selectedProduct.what
              }
            </p>

            <p>
              <strong>
                Para quem é?
              </strong>
              <br />
              {
                selectedProduct.forWho
              }
            </p>

            <p>
              <strong>
                Como funciona?
              </strong>
              <br />
              {
                selectedProduct.how
              }
            </p>

            <p>
              <strong>
                Quando pode ajudar?
              </strong>
              <br />
              {
                selectedProduct.when
              }
            </p>

            <p>
              <strong>
                Dica do Creditin
              </strong>
              <br />
              {
                selectedProduct.tip
              }
            </p>

            <p>
              <strong>
                Gostou dessa opção?
              </strong>
              <br />
              Podemos verificar as possibilidades para você. A aprovação e as condições dependem da análise da instituição responsável.
            </p>

            <button
              className="yellow"

              onClick={() =>
                openAnalystWhatsApp(
                  "samila",
                  selectedProduct.name
                )
              }
            >
              ANALISTA SAMILA
            </button>

            <button
              className="yellow"

              onClick={() =>
                openAnalystWhatsApp(
                  "marcelino",
                  selectedProduct.name
                )
              }
            >
              ANALISTA MARCELINO
            </button>

          </section>

        </main>
      </div>
    );
  }

  /* ======================================================
     FALAR DIRETO COM A CREDITI
     ====================================================== */

  if (
    screen === "human"
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
              Escolha um analista
            </small>
          </div>

        </header>

        <main className="page">

          <section className="partner">

            <img
              src="/creditin.png"
              alt="Creditin"
            />

            <h2>
              Atendimento Crediti
            </h2>

            <p>
              Escolha com quem você deseja falar. Samila e Marcelino atendem os produtos da Crediti.
            </p>

            <button
              className="yellow"

              onClick={() =>
                openAnalystWhatsApp(
                  "samila"
                )
              }
            >
              ANALISTA SAMILA
            </button>

            <button
              className="yellow"

              onClick={() =>
                openAnalystWhatsApp(
                  "marcelino"
                )
              }
            >
              ANALISTA MARCELINO
            </button>

          </section>

        </main>
      </div>
    );
  }

  /* ======================================================
     HOME
     ====================================================== */

  return (
    <div className="app">

      <div className="brand">
        CREDITI
      </div>

      <main className="home">

        <img
          src="/creditin.png"
          className="hero"
          alt="Creditin"
        />

        <h1>
          CREDITI IA
        </h1>

        <p>
          Seu crédito. Mais simples.
        </p>

        <button
          className="prompt"

          onClick={() =>
            openChat()
          }
        >
          Como podemos ajudar?
        </button>

        <button
          className="yellow"

          onClick={() =>
            openChat()
          }
        >
          ENCONTRAR MEU CRÉDITO
        </button>

        <button
          className="yellow"

          onClick={() =>
            setScreen(
              "products"
            )
          }
        >
          CONHECER NOSSOS PRODUTOS
        </button>

        <button
          className="yellow"

          onClick={() =>
            setScreen(
              "human"
            )
          }
        >
          FALAR COM A CREDITI
        </button>

        <button
          className="yellow"

          onClick={
            becomePartner
          }
        >
          QUERO SER PARCEIRO
        </button>

      </main>

    </div>
  );
}

createRoot(
  document.getElementById(
    "root"
  )
).render(<App />);
