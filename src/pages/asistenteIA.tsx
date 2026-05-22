import { useState } from "react";
import "../styles/asistenteIA.css";
import { useRef } from "react";
interface Mensaje {
  texto: string;
  tipo: "usuario" | "ia";
}

export default function AsistenteIA() {
  const [mensaje, setMensaje] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [pensando, setPensando] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      texto: "👋 Hola, soy tonywilly assitent.",
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
    setEscuchando(true);
    console.log("🎤 Escuchando...");
  };

  recognition.onresult = (event: any) => {
    setEscuchando(false);
  const texto = event.results[0][0].transcript;

  setMensaje(texto);

  // 🔥 enviar automáticamente
  setTimeout(() => {
    enviarMensajeVoz(texto);
  }, 500);
};

  recognition.onerror = () => {
    alert("Error usando micrófono");
  };
};
  const hablarTexto = (texto: string) => {
  if(videoRef.current){
    videoRef.current.currentTime = 0;
    videoRef.current.play();
  }
  setHablando(true);
  const speech = new SpeechSynthesisUtterance(texto);

  speech.lang = "es-ES";

  speech.rate = 1;

  speech.pitch = 1;

  speech.onend = () => {
    setHablando(false);
    if(videoRef.current){
      videoRef.current.pause();
    }
  };
  
  window.speechSynthesis.speak(speech);
};
  const enviarMensajeVoz = async (textoVoz: string) => {

  const nuevoMensaje: Mensaje = {
    texto: textoVoz,
    tipo: "usuario",
  };

  setMensajes((prev) => [...prev, nuevoMensaje]);

  setEscribiendo(true);
  setPensando(true);

  setTimeout(() => {

    let respuesta = "";

    const texto = textoVoz.toLowerCase();

    if (texto.includes("stock")) {
      respuesta = "📦 Hay 5 productos con stock bajo.";
    }
    else if (texto.includes("ventas")) {
      respuesta = "💰 Las ventas de hoy son $152.000.";
    }
    else if (texto.includes("turno")) {
      respuesta = "🧾 El turno actual lleva 14 ventas.";
    }
    else if (texto.includes("hola")) {
      respuesta = "👋 Hola, ¿en qué puedo ayudarte?";
    }
    else {
      respuesta = "🤖 No encontré información.";
    }

    const respuestaIA: Mensaje = {
      texto: respuesta,
      tipo: "ia",
    };

    setMensajes((prev) => [...prev, respuestaIA]);

    hablarTexto(respuesta);

    setEscribiendo(false);
    setPensando(false);

  }, 1000);
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
      <div className="avatar-container">

  <video className={`avatar-video ${pensando ? "avatar-thinking" : ""}`}
    ref={videoRef}
    
    
    muted
    playsInline
    
  >
    <source src="/avatar.mp4" type="video/mp4" />
  </video>
  {hablando && (
    <div className="audio-wave">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )}

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
        {escuchando && (
    <div className="audio-wave">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
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