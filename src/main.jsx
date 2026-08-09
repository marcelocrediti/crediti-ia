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

const welcomeMessage = {
  role: "assistant",
  text:
    "Olá! Eu sou o Creditin, assistente da Crediti. Me conte o que você precisa. Você não precisa saber o nome do produto."
};

function App() {
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const [chatHeight, setChatHeight] =
    useState(window.innerHeight);

  const chatRef = useRef(null);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* ======================================================
     CONTROLE DO TECLADO NO IPHONE
     ====================================================== */

  useEffect(() => {
    if (screen !== "chat") return;

    const updateViewport = () => {
      const viewport = window.visualViewport;

      const height = viewport
        ? viewport.height
        : window.innerHeight;

      setChatHeight(height);

      /*
        Impede o Safari de deslocar a página inteira
        quando o teclado aparece.
      */
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

  /* ======================================================
     ROLA SOMENTE O HISTÓRICO
     ====================================================== */

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

  /* ======================================================
     ABRIR CHAT
     ====================================================== */

  const openChat = (firstMessage = "") => {
    const initialMessages = [
      welcomeMessage
    ];

    setMessages(initialMessages);
    messagesRef.current = initialMessages;

    setScreen("chat");

    if (firstMessage) {
      setTimeout(() => {
        sendMessage(
          firstMessage,
          initialMessages
        );
      }, 150);
    }
  };

  /* ======================================================
     ENVIAR MENSAGEM
     ====================================================== */

  async function sendMessage(
    value = text,
    customHistory = null
  ) {
    value = String(value).trim();

    if (!value || busy) return;

    setText("");

    const history =
      customHistory ||
      messagesRef.current;

    const userMessage = {
      role: "user",
      text: value
    };

    const updatedMessages = [
      ...history,
      userMessage
    ];

    setMessages(updatedMessages);
    messagesRef.current =
      updatedMessages;

    setBusy(true);

    try {
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
            history
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erro no servidor: " +
            response.status
        );
      }

      const data =
        await response.json();

      const assistantMessage = {
        role: "assistant",
        text:
          data.reply ||
          "Não consegui responder agora."
      };

      setMessages((current) => {
        const next = [
          ...current,
          assistantMessage
        ];

        messagesRef.current = next;

        return next;
      });
    } catch (error) {
      console.error(
        "Erro no atendimento:",
        error
      );

      const errorMessage = {
        role: "assistant",
        text:
          "Não consegui acessar o atendimento agora."
      };

      setMessages((current) => {
        const next = [
          ...current,
          errorMessage
        ];

        messagesRef.current = next;

        return next;
      });
    } finally {
      setBusy(false);
    }
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
     TREINAMENTO
     ====================================================== */

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

  /* ======================================================
     CHAT
     ====================================================== */

  if (screen === "chat") {
    return (
      <div
        className="app chat-app"
        style={{
          height: `${chatHeight}px`,
          minHeight: `${chatHeight}px`,
          maxHeight: `${chatHeight}px`
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
            onChange={(event) =>
              setText(
                event.target.value
              )
            }
            onFocus={() => {
              /*
                Depois que o teclado abrir,
                força o documento a continuar
                no topo.
              */
              setTimeout(() => {
                window.scrollTo(
                  0,
                  0
                );
              }, 100);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                event.preventDefault();

                sendMessage();
              }
            }}
            placeholder="Digite sua dúvida..."
            autoComplete="off"
          />

          <button
            className="yellow send"
            onClick={() =>
              sendMessage()
            }
          >
            ENVIAR
          </button>
        </div>
      </div>
    );
  }

  /* ======================================================
     PRODUTOS
     ====================================================== */

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
