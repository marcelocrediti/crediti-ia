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

const SUPABASE_LEADS_URL =
  "https://vgdtywdpywezrwlrsawq.supabase.co/rest/v1/leads";

const SUPABASE_PUBLISHABLE_KEY =
  "COLE_AQUI_SUA_PUBLISHABLE_KEY";

const RENDA_EXTRA_URL =
  "https://crediti.startcapital.app/signIn";

const ANALYSTS = {
  samila: {
    name: "Samila",
    title: "Analista Samila",
    whatsapp: "5585994409719",
    email: "samilaf9@gmail.com"
  },

  marcelino: {
    name: "Marcelino",
    title: "Analista Marcelino",
    whatsapp: "5585992032558",
    email:
      "marcelinoteixeira.santos@gmail.com"
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
      "O veículo precisa estar no nome da pessoa, apto a rodar, com documentação regularizável e CPF sem restrição.",
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
      "A regra inicial cadastrada considera CPF sem restrição, score a partir de 700, documentação e transferência.",
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
      "A regra inicial cadastrada considera CPF sem restrição, score a partir de 700, documentação e transferência.",
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

function App() {
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
    customer,
    setCustomer
  ] = useState({
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

  async function saveLead(
    data,
    status =
      "em_atendimento"
  ) {
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
    } catch (error) {
      console.log(
        "Lead não registrado:",
        error
      );
    }
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

    setShowAnalysts(
      false
    );

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
        cleanValue.length <
          2 ||
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
        setShowAnalysts(
          true
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
    productName = ""
  ) {
    const analyst =
      ANALYSTS[
        analystKey
      ];

    if (!analyst) {
      return;
    }

    let message;

    if (
      productName
    ) {
      message =
        `Olá, ${analyst.name}! ` +
        `Conheci "${productName}" pelo Crediti IA e gostaria de saber mais e verificar as possibilidades para mim.`;
    } else {
      message =
        `Olá, ${analyst.name}! ` +
        `Gostaria de falar com a Crediti e continuar meu atendimento com você.`;
    }

    const url =
      "https://wa.me/" +
      analyst.whatsapp +
      "?text=" +
      encodeURIComponent(
        message
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
          analyst.title,

        analystEmail:
          analyst.email
      };

    saveLead(
      updatedCustomer,
      "encaminhado"
    );

    openAnalystWhatsApp(
      analystKey,
      customer.interest
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
            </div>
          )}

          {busy && (
            <div
              className=
                "row assistant"
            >
              <img
                src="/creditin.png"
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
            (product) => (
              <button
                className=
                  "yellow"

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
                {
                  product.name
                }
              </button>
            )
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
                "product-top"
            >
              <img
                src="/creditin.png"
                alt="Creditin"
              />

              <h2>
                {
                  selectedProduct.name
                }
              </h2>
            </div>

            <div
              className=
                "info-grid"
            >
              <section>
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
              <strong>
                Dica do Creditin
              </strong>

              <p>
                {
                  selectedProduct.tip
                }
              </p>
            </div>

            <div
              className=
                "product-cta"
            >
              <strong>
                Gostou dessa opção?
              </strong>

              <p>
                Fale com um dos nossos analistas e veja se essa solução faz sentido para você.
              </p>
            </div>

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
                SAMILA
              </button>

              <button
                onClick={() =>
                  openAnalystWhatsApp(
                    "marcelino",
                    selectedProduct.name
                  )
                }
              >
                MARCELINO
              </button>
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

        <main
          className=
            "simple-screen"
        >
          <img
            src="/creditin.png"
            alt="Creditin"
          />

          <h2>
            Fale com a gente
          </h2>

          <p>
            Escolha um de nossos analistas para continuar seu atendimento pelo WhatsApp.
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

        <main
          className=
            "simple-screen"
        >
          <img
            src="/creditin.png"
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
            className=
              "yellow partner-register"

            onClick={() =>
              window.open(
                RENDA_EXTRA_URL,
                "_blank"
              )
            }
          >
            QUERO ME CADASTRAR
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <div
        className=
          "brand"
      >
        CREDITI
      </div>

      <main
        className=
          "home"
      >
        <img
          src="/creditin.png"
          className=
            "hero"
          alt="Creditin"
        />

        <h1>
          CREDITI IA
        </h1>

        <p>
          Seu crédito. Mais simples.
        </p>

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
          onClick={() =>
            setScreen(
              "partner"
            )
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
