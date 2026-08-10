import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = "https://crediti-ia-api.onrender.com";

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
    email: "marcelinoteixeira.santos@gmail.com"
  }
};

const products = [
  "Consignado INSS",
  "BPC / LOAS",
  "Consignado CLT",
  "Crédito pessoal Bolsa Família",
  "FGTS",
  "Empréstimo no cartão de crédito",
  "Empréstimo na conta de luz",
  "Empréstimo com garantia de carro ou moto",
  "Financiamento de carro",
  "Financiamento de moto",
  "Seguro Auto para carro ou moto",
  "Consórcio de carro",
  "Consórcio de moto",
  "Consórcio de caminhão pesado",
  "Consórcio de serviços"
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";

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
  return String(name).trim().split(/\s+/)[0] || "";
}

function normalize(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function looksLikeGreetingInsteadOfName(value) {
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

function App() {
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const [chatHeight, setChatHeight] = useState(
    window.innerHeight
  );

  const [step, setStep] = useState("name");

  const [customer, setCustomer] = useState({
    name: "",
    city: "",
    phone: "",
    whatsapp: false,
    interest: "",
    analyst: "",
    analystEmail: ""
  });

  const [pendingMessage, setPendingMessage] = useState("");
  const [showAnalysts, setShowAnalysts] = useState(false);

  const chatRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (screen !== "chat") return;

    const updateViewport = () => {
      const viewport = window.visualViewport;

      const height = viewport
        ? viewport.height
        : window.innerHeight;

      setChatHeight(height);

      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    if (window.visualViewport) {
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

      if (window.visualViewport) {
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

  useEffect(() => {
    if (screen !== "chat") return;

    const chat = chatRef.current;

    if (!chat) return;

    requestAnimationFrame(() => {
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: "smooth"
      });
    });
  }, [messages, busy, showAnalysts, screen]);

  function addMessage(role, messageText) {
    const message = {
      role,
      text: messageText
    };

    setMessages((current) => {
      const next = [...current, message];

      messagesRef.current = next;

      return next;
    });
  }

  async function saveLead(
    data,
    status = "em_atendimento"
  ) {
    try {
      await fetch(`${API_URL}/api/leads`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: data.name || "",
          phone: data.phone || "",
          city: data.city || "",
          whatsapp: data.whatsapp || false,
          interest: data.interest || "",
          analyst: data.analyst || "",
          analystEmail: data.analystEmail || "",
          status,
          createdAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.log(
        "Lead não registrado neste momento:",
        error
      );
    }
  }

  function openChat(firstMessage = "") {
    const greeting = getGreeting();

    const initialMessages = [
      {
        role: "assistant",
        text:
          `${greeting}! Eu sou o Creditin, assistente da Crediti. Tudo bem? Para começar, como posso te chamar?`
      }
    ];

    setMessages(initialMessages);
    messagesRef.current = initialMessages;

    setCustomer({
      name: "",
      city: "",
      phone: "",
      whatsapp: false,
      interest: firstMessage || "",
      analyst: "",
      analystEmail: ""
    });

    setStep("name");
    setText("");
    setShowAnalysts(false);
    setPendingMessage(firstMessage || "");
    setScreen("chat");
  }

  function handleRegistration(value) {
    const cleanValue = String(value).trim();

    if (step === "name") {
      if (
        cleanValue.length < 2 ||
        looksLikeGreetingInsteadOfName(cleanValue)
      ) {
        addMessage(
          "assistant",
          "Tudo bem! Agora me diz seu nome para eu poder te atender direitinho."
        );

        return;
      }

      const name = cleanValue;
      const shortName = firstName(name);

      setCustomer((current) => ({
        ...current,
        name
      }));

      setStep("city");

      addMessage(
        "assistant",
        `Prazer, ${shortName}! De qual cidade você está falando?`
      );

      return;
    }

    if (step === "city") {
      if (cleanValue.length < 2) {
        addMessage(
          "assistant",
          "Me diz o nome da sua cidade para a gente continuar."
        );

        return;
      }

      setCustomer((current) => ({
        ...current,
        city: cleanValue
      }));

      setStep("phone");

      addMessage(
        "assistant",
        `${firstName(customer.name)}, agora me passa seu número de telefone com DDD.`
      );

      return;
    }

    if (step === "phone") {
      const numbers = cleanValue.replace(/\D/g, "");

      if (numbers.length !== 11) {
        addMessage(
          "assistant",
          "Esse número parece incompleto. Digite o DDD e o número completo para mim."
        );

        return;
      }

      const formatted = formatPhone(numbers);

      setCustomer((current) => ({
        ...current,
        phone: formatted
      }));

      setStep("whatsapp");

      addMessage(
        "assistant",
        `${firstName(customer.name)}, esse número ${formatted} também é seu WhatsApp? Pode responder sim ou não.`
      );

      return;
    }

    if (step === "whatsapp") {
      const answer = normalize(cleanValue);

      const yes = [
        "sim",
        "s",
        "yes",
        "e"
      ].includes(answer);

      const no = [
        "nao",
        "n"
      ].includes(answer);

      if (!yes && !no) {
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

      setCustomer(updatedCustomer);
      setStep("ready");

      saveLead(
        updatedCustomer,
        "dados_coletados"
      );

      if (pendingMessage) {
        const request = pendingMessage;

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

  async function sendToAI(
    value,
    customerData = customer
  ) {
    value = String(value).trim();

    if (!value || busy) return;

    setBusy(true);

    const updatedCustomer = {
      ...customerData,
      interest:
        customerData.interest || value
    };

    setCustomer(updatedCustomer);

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 65000);

      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",

          signal: controller.signal,

          headers: {
            "Content-Type": "application/json"
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

      clearTimeout(timeout);

      const rawText = await response.text();

      let data = {};

      try {
        data = rawText
          ? JSON.parse(rawText)
          : {};
      } catch {
        data = {
          error: rawText
        };
      }

      if (!response.ok) {
        const errorMessage =
          data.error ||
          data.message ||
          `Erro ${response.status}`;

        throw new Error(
          errorMessage
        );
      }

      if (!data.reply) {
        throw new Error(
          "A API respondeu, mas não retornou texto."
        );
      }

      addMessage(
        "assistant",
        data.reply
      );

      if (data.showAnalysts === true) {
        setShowAnalysts(true);

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
          "O atendimento demorou mais que o esperado para responder. Tente novamente em alguns segundos."
        );
      } else {
        addMessage(
          "assistant",
          `Erro no atendimento: ${error?.message || "não identificado"}`
        );
      }
    } finally {
      setBusy(false);
    }
  }

  function offerHumanService() {
    if (showAnalysts) return;

    setShowAnalysts(true);

    addMessage(
      "assistant",
      `${firstName(customer.name)}, escolha abaixo com qual analista deseja continuar.`
    );
  }

  function chooseAnalyst(analystKey) {
    const analyst = ANALYSTS[analystKey];

    if (!analyst) return;

    const updatedCustomer = {
      ...customer,
      analyst: analyst.title,
      analystEmail: analyst.email
    };

    setCustomer(updatedCustomer);
    setShowAnalysts(false);

    saveLead(
      updatedCustomer,
      "encaminhado"
    );

    addMessage(
      "assistant",
      `Certo, ${firstName(updatedCustomer.name)}! Vou te encaminhar para ${analyst.title}.`
    );

    const interest =
      updatedCustomer.interest ||
      "um produto da Crediti";

    const whatsappMessage =
      `Olá, ${analyst.name}! ` +
      `Meu nome é ${updatedCustomer.name}. ` +
      `Sou de ${updatedCustomer.city}. ` +
      `Fiz meu atendimento pelo Crediti IA ` +
      `e tenho interesse em ${interest}.`;

    const url =
      "https://wa.me/" +
      analyst.whatsapp +
      "?text=" +
      encodeURIComponent(
        whatsappMessage
      );

    setTimeout(() => {
      window.open(
        url,
        "_blank"
      );
    }, 250);
  }

  function sendMessage() {
    const value = String(text).trim();

    if (!value || busy) return;

    setText("");

    addMessage(
      "user",
      value
    );

    if (step !== "ready") {
      handleRegistration(value);
      return;
    }

    const normalized =
      normalize(value);

    const humanRequests = [
      "quero falar com atendente",
      "quero falar com um atendente",
      "quero falar com uma pessoa",
      "falar com atendente",
      "falar com analista",
      "quero contratar",
      "quero fazer agora",
      "quero prosseguir",
      "quero continuar",
      "quero atendimento",
      "falar com a crediti"
    ];

    if (
      humanRequests.some(
        (phrase) =>
          normalized.includes(
            phrase
          )
      )
    ) {
      offerHumanService();
      return;
    }

    sendToAI(value);
  }

  function handleInputChange(event) {
    let value =
      event.target.value;

    if (step === "phone") {
      value =
        formatPhone(value);
    }

    setText(value);
  }

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

  if (screen === "chat") {
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
              setScreen("home")
            }
            aria-label="Voltar"
          >
            ‹
          </button>

          <img
            src="/creditin.png"
            className="avatar"
            alt="Creditin"
          />

          <div>
            <b>Crediti IA</b>
            <small>Assistente da Crediti</small>
          </div>
        </header>

        <main
          className="chat"
          ref={chatRef}
        >
          {messages.map(
            (message, index) => (
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
            onChange={handleInputChange}
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
            onClick={sendMessage}
          >
            ENVIAR
          </button>
        </div>
      </div>
    );
  }

  if (screen === "products") {
    return (
      <div className="app">
        <header>
          <button
            className="back"
            onClick={() =>
              setScreen("home")
            }
          >
            ‹
          </button>

          <div>
            <b>Produtos Crediti</b>
            <small>Conheça nossas opções</small>
          </div>
        </header>

        <main className="page">
          {products.map(
            (product, index) => (
              <button
                className="yellow"
                key={index}
                onClick={() =>
                  openChat(
                    "Quero saber sobre " +
                      product +
                      "."
                  )
                }
              >
                {product}
              </button>
            )
          )}
        </main>
      </div>
    );
  }

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

        <h1>CREDITI IA</h1>

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
            setScreen("products")
          }
        >
          CONHECER NOSSOS PRODUTOS
        </button>

        <button
          className="yellow"
          onClick={() =>
            openChat(
              "Quero falar com a Crediti."
            )
          }
        >
          FALAR COM A CREDITI
        </button>

        <button
          className="yellow"
          onClick={becomePartner}
        >
          QUERO SER PARCEIRO
        </button>
      </main>
    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(<App />);
