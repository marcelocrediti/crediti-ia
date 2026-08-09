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

/* =========================================================
   FORMATA TELEFONE
   ========================================================= */

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

/* =========================================================
   PRIMEIRO NOME
   ========================================================= */

function firstName(name) {
  return String(name)
    .trim()
    .split(/\s+/)[0];
}

/* =========================================================
   APP
   ========================================================= */

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
    phone
    whatsapp
    city
    ready
  */

  const [step, setStep] = useState("name");

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    whatsapp: false,
    city: ""
  });

  const [pendingMessage, setPendingMessage] =
    useState("");

  const chatRef = useRef(null);

  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* =========================================================
     TECLADO DO IPHONE
     ========================================================= */

  useEffect(() => {
    if (screen !== "chat") return;

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

  /* =========================================================
     HISTÓRICO SEMPRE NO FINAL
     ========================================================= */

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

  /* =========================================================
     ADICIONAR MENSAGEM
     ========================================================= */

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

  /* =========================================================
     ABRIR CHAT
     ========================================================= */

  function openChat(firstMessage = "") {
    const initialMessages = [
      {
        role: "assistant",
        text:
          "Oi! Eu sou o Creditin, assistente da Crediti. Para começar, me diz seu nome."
      }
    ];

    setMessages(initialMessages);

    messagesRef.current =
      initialMessages;

    setCustomer({
      name: "",
      phone: "",
      whatsapp: false,
      city: ""
    });

    setStep("name");

    setText("");

    setPendingMessage(
      firstMessage || ""
    );

    setScreen("chat");
  }

  /* =========================================================
     CADASTRO INICIAL
     ========================================================= */

  function handleRegistration(value) {
    const cleanValue =
      String(value).trim();

    if (step === "name") {
      if (cleanValue.length < 2) {
        addMessage(
          "assistant",
          "Me diz seu nome para a gente continuar."
        );

        return;
      }

      const name =
        cleanValue;

      const shortName =
        firstName(name);

      setCustomer((current) => ({
        ...current,
        name
      }));

      setStep("phone");

      addMessage(
        "assistant",
        `Prazer, ${shortName}! Agora me passa seu número de telefone com DDD.`
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
        `${firstName(customer.name)}, esse número ${formatted} também é seu WhatsApp? Responda sim ou não.`
      );

      return;
    }

    if (step === "whatsapp") {
      const answer =
        cleanValue
          .toLowerCase()
          .normalize("NFD")
          .replace(
            /[\u0300-\u036f]/g,
            ""
          );

      const yes =
        [
          "sim",
          "s",
          "sou",
          "e",
          "é",
          "yes"
        ].includes(answer);

      const no =
        [
          "nao",
          "n",
          "não"
        ].includes(answer);

      if (!yes && !no) {
        addMessage(
          "assistant",
          "Só confirma para mim: esse número é seu WhatsApp? Pode responder sim ou não."
        );

        return;
      }

      setCustomer((current) => ({
        ...current,
        whatsapp: yes
      }));

      setStep("city");

      addMessage(
        "assistant",
        `Perfeito, ${firstName(customer.name)}. Agora me diz de qual cidade você está falando.`
      );

      return;
    }

    if (step === "city") {
      if (cleanValue.length < 2) {
        addMessage(
          "assistant",
          "Me diz o nome da sua cidade para continuarmos."
        );

        return;
      }

      const updatedCustomer = {
        ...customer,
        city: cleanValue
      };

      setCustomer(
        updatedCustomer
      );

      setStep("ready");

      if (pendingMessage) {
        const request =
          pendingMessage;

        setPendingMessage("");

        addMessage(
          "assistant",
          `Tudo certo, ${firstName(updatedCustomer.name)}! Agora vou te ajudar com isso.`
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
          `Tudo certo, ${firstName(updatedCustomer.name)}! Agora me conta o que você precisa. Vou buscar a melhor opção para você.`
        );
      }
    }
  }

  /* =========================================================
     ENVIAR PARA IA
     ========================================================= */

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

              phone:
                customerData.phone,

              whatsapp:
                customerData.whatsapp,

              city:
                customerData.city
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

  /* =========================================================
     ENVIAR
     ========================================================= */

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

  /* =========================================================
     ALTERAÇÃO DO CAMPO
     ========================================================= */

  function handleInputChange(event) {
    let value =
      event.target.value;

    /*
      Durante a etapa do telefone,
      aplica máscara automaticamente.
    */

    if (step === "phone") {
      value =
        formatPhone(value);
    }

    setText(value);
  }

  /* =========================================================
     PARCEIRO
     ========================================================= */

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

  /* =========================================================
     TREINAMENTO
     ========================================================= */

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

  /* =========================================================
     CHAT
     ========================================================= */

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
                : step === "phone"
                ? "(85) 99203-2558"
                : step === "whatsapp"
                ? "Sim ou não..."
                : step === "city"
                ? "Digite sua cidade..."
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

  /* =========================================================
     PRODUTOS
     ========================================================= */

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
              Quer se tornar um
              bancário autônomo?
              Faça seu cadastro na
              plataforma Renda Extra
              Crediti.
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
              SOLICITAR TREINAMENTO
              AGORA
            </button>
          </section>
        </main>
      </div>
    );
  }

  /* =========================================================
     HOME
     ========================================================= */

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
