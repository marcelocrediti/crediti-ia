import React, {
  useEffect,
  useRef,
  useState
} from "react";

import { createRoot } from "react-dom/client";
import "./styles.css";

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
  return String(name)
    .trim()
    .split(/\s+/)[0];
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

  const blocked = [
    "oi",
    "ola",
    "olá",
    "bom dia",
    "boa tarde",
    "boa noite",
    "tudo bem",
    "tudo bom",
    "beleza",
    "opa",
    "e ai",
    "e aí",
    "hey",
    "hello"
  ];

  return blocked.includes(text);
}

function App() {
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const [chatHeight, setChatHeight] =
    useState(window.innerHeight);

  /*
    ETAPAS:
    name
    city
    phone
    whatsapp
    ready
  */

  const [step, setStep] = useState("name");

  const [customer, setCustomer] = useState({
    name: "",
    city: "",
    phone: "",
    whatsapp: false
  });

  const [pendingMessage, setPendingMessage] =
    useState("");

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

    window.addEventListener(
      "resize",
      updateViewport
    );

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
  }, [messages, busy, screen]);

  function addMessage(role, messageText) {
    const message = {
      role,
      text: messageText
    };

    setMessages((current) => {
      const next = [
        ...current,
        message
      ];

      messagesRef.current = next;

      return next;
    });
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
      whatsapp: false
    });

    setStep("name");
    setText("");

    setPendingMessage(
      firstMessage || ""
    );

    setScreen("chat");
  }

  function handleRegistration(value) {
    const cleanValue =
      String(value).trim();

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
      const numbers =
        cleanValue.replace(/\D/g, "");

      if (numbers.length !== 11) {
        addMessage(
          "assistant",
          "Esse número parece incompleto. Digite o DDD e o número completo para mim."
        );

        return;
      }

      const formatted =
        formatPhone(numbers);

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
        "e",
        "é"
      ].includes(answer);

      const no = [
        "nao",
        "não",
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

      if (pendingMessage) {
        const request =
          pendingMessage;

        setPendingMessage("");

        addMessage(
          "assistant",
          `Perfeito, ${firstName(updatedCustomer.name)}. Já tenho seus dados básicos. Agora vou te ajudar com o que você precisa.`
        );

        setTimeout(() => {
          sendToAI(
            request,
            updatedCustomer
          );
        }, 300);
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

    try {
      const history =
        messagesRef.current;

      const response = await fetch(
        "https://crediti-ia.onrender.com/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: value,
            history,

            customer: {
              name:
                customerData.name,

              firstName:
                firstName(
                  customerData.name
                ),

              city:
                customerData.city,

              phone:
                customerData.phone,

              whatsapp:
                customerData.whatsapp
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erro ${response.status}`
        );
      }

      const data =
        await response.json();

      addMessage(
        "assistant",
        data.reply ||
          "Não consegui responder agora."
      );
    } catch (error) {
      console.error(error);

      addMessage(
        "assistant",
        "Não consegui acessar o atendimento agora."
      );
    } finally {
      setBusy(false);
    }
  }

  function sendMessage() {
    const value =
      String(text).trim();

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

  function training() {
    const number =
      import.meta.env
        .VITE_TREINAMENTO_WHATSAPP_NUMBER;

    if (!number) {
      alert(
        "O WhatsApp do treinamento ainda será configurado."
      );

      return;
    }

    const message =
      "Olá! Vim pelo Crediti IA e quero solicitar o treinamento do Renda Extra Crediti.";

    window.open(
      "https://wa.me/" +
        number +
        "?text=" +
        encodeURIComponent(message),
      "_blank"
    );
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
            <b>
              Produtos Crediti
            </b>

            <small>
              Conheça nossas opções
            </small>
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

          <section className="partner">
            <img
              src="/creditin.png"
              alt="Creditin"
            />

            <h2>
              Renda Extra Crediti
            </h2>

            <p>
              Quer se tornar um bancário autônomo?
              Faça seu cadastro na plataforma
              Renda Extra Crediti.
            </p>

            <button
              className="yellow"
              onClick={
                becomePartner
              }
            >
              QUERO SER PARCEIRO
            </button>

            <button
              className="yellow"
              onClick={training}
            >
              SOLICITAR TREINAMENTO AGORA
            </button>
          </section>
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
  document.getElementById("root")
).render(<App />);
