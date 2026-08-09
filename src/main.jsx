import React, { useState } from "react";
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

function App() {
  const [screen, setScreen] = useState("home");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const openChat = (firstMessage = "") => {
    setScreen("chat");

    setMessages([
      {
        role: "assistant",
        text:
          "Olá! Eu sou o Creditin, assistente da Crediti. Me conte o que você precisa. Você não precisa saber o nome do produto."
      }
    ]);

    if (firstMessage) {
      setTimeout(() => sendMessage(firstMessage), 50);
    }
  };

  async function sendMessage(value = text) {
    value = String(value).trim();

    if (!value || busy) return;

    setText("");

    const history = messages;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: value
      }
    ]);

    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: value,
          history
        })
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            data.reply ||
            "Não consegui responder agora."
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            "Não consegui acessar o atendimento agora."
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  function becomePartner() {
    const url =
      import.meta.env.VITE_RENDA_EXTRA_URL;

    if (url) {
      window.open(url, "_blank");
    } else {
      alert(
        "O link do Renda Extra ainda será configurado."
      );
    }
  }

  function training() {
    const number =
      import.meta.env.VITE_TREINAMENTO_WHATSAPP_NUMBER;

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
      <div className="app">
        <header>
          <button
            className="back"
            onClick={() => setScreen("home")}
          >
            ‹
          </button>

          <img
            src="/creditin.png"
            className="avatar"
          />

          <div>
            <b>Crediti IA</b>
            <small>Assistente da Crediti</small>
          </div>
        </header>

        <main className="chat">
          {messages.map((message, index) => (
            <div
              className={"row " + message.role}
              key={index}
            >
              {message.role === "assistant" && (
                <img
                  src="/creditin.png"
                  className="avatar small"
                />
              )}

              <div className="bubble">
                {message.text}
              </div>
            </div>
          ))}

          {busy && (
            <div className="row assistant">
              <img
                src="/creditin.png"
                className="avatar small"
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
              setText(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Digite sua dúvida..."
          />

          <button
            className="yellow send"
            onClick={() => sendMessage()}
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
            onClick={() => setScreen("home")}
          >
            ‹
          </button>

          <div>
            <b>Produtos Crediti</b>
            <small>Conheça nossas opções</small>
          </div>
        </header>

        <main className="page">
          {products.map((product, index) => (
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
          ))}

          <section className="partner">
            <img
              src="/creditin.png"
              alt="Creditin"
            />

            <h2>Renda Extra Crediti</h2>

            <p>
              Quer se tornar um bancário autônomo?
              Faça seu cadastro na plataforma
              Renda Extra Crediti.
            </p>

            <button
              className="yellow"
              onClick={becomePartner}
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

        <h1>CREDITI IA</h1>

        <p>
          Seu crédito. Mais simples.
        </p>

        <button
          className="prompt"
          onClick={() => openChat()}
        >
          Como podemos ajudar?
        </button>

        <button
          className="yellow"
          onClick={() => openChat()}
        >
          ENCONTRAR MEU CRÉDITO
        </button>

        <button
          className="yellow"
          onClick={() => setScreen("products")}
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
