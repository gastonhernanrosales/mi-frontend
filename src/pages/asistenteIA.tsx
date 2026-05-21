import { useState } from "react";
import "../styles/asistenteIA.css";

interface Mensaje {
  texto: string;
  tipo: "usuario" | "ia";
}

export default function AsistenteIA() {
  const [mensaje, setMensaje] = useState("");

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      texto: "👋 Hola, soy el asistente inteligente del sistema.",
      tipo: "ia",
    },
  ]);

  const [escribiendo, setEscribiendo] = useState(false);
  const iniciarReconocimientoVoz = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "es-ES";

  recognition.start();

  recognition.onstart = () => {
    console.log("🎤 Escuchando...");
  };

  recognition.onresult = (event: any) => {
    const texto = event.results[0][0].transcript;

    setMensaje(texto);
  };

  recognition.onerror = () => {
    alert("Error usando micrófono");
  };
};
  const hablarTexto = (texto: string) => {
  const speech = new SpeechSynthesisUtterance(texto);

  speech.lang = "es-ES";

  speech.rate = 1;

  speech.pitch = 1;

  window.speechSynthesis.speak(speech);
};

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje: Mensaje = {
      texto: mensaje,
      tipo: "usuario",
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);

    const textoUsuario = mensaje;

    setMensaje("");

    setEscribiendo(true);

    try {
      // 🔥 IA FAKE TEMPORAL
      setTimeout(() => {
        let respuesta = "";

        const texto = textoUsuario.toLowerCase();

        if (texto.includes("stock")) {
          respuesta =
            "📦 Hay 5 productos con stock bajo.";
        } else if (texto.includes("ventas")) {
          respuesta =
            "💰 Las ventas de hoy son $152.000.";
        } else if (texto.includes("turno")) {
          respuesta =
            "🧾 El turno actual lleva 14 ventas.";
        } else if (texto.includes("hola")) {
          respuesta =
            "👋 Hola, ¿en qué puedo ayudarte?";
        } else {
          respuesta =
            "🤖 Estoy aprendiendo nuevas funciones.";
        }

        const respuestaIA: Mensaje = {
          texto: respuesta,
          tipo: "ia",
        };

        setMensajes((prev) => [...prev, respuestaIA]);
        hablarTexto(respuesta);

        setEscribiendo(false);
      }, 1500);

    } catch (error) {
      setEscribiendo(false);
    }
  };

  return (
    <div className="ia-container">

      <div className="ia-header">
        🤖 Asistente IA
      </div>

      <div className="ia-chat">

        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={
              msg.tipo === "usuario"
                ? "mensaje usuario"
                : "mensaje ia"
            }
          >
            {msg.texto}
          </div>
        ))}

        {escribiendo && (
          <div className="typing">
            🤖 escribiendo...
          </div>
        )}

      </div>

      <div className="ia-input-container">

        <input
          type="text"
          placeholder="Escribí un mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="ia-input"
        />

        <button
          onClick={enviarMensaje}
          className="ia-send"
        >
          ➤
        </button>
        <button
  onClick={iniciarReconocimientoVoz}
  className="ia-mic"
>
  🎤
</button>

      </div>

    </div>
  );}