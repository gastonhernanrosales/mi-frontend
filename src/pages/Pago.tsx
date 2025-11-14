import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Pago.css";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { API_URL } from "../config";

type CartItem = {
  id: number;
  nombre: string;
  precio: number;
  qty: number;
};

export default function Pago() {
  
  const location = useLocation();
  const navigate = useNavigate();

  // Recupero datos desde Venta.tsx
  const { cart, total, usuarioId, usuarioNombre } = location.state as {
    cart: CartItem[];
    total: number;
    usuarioId?: number;
    usuarioNombre?: string;
  };

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pagoId, setPagoId] = useState<number | null>(null);
  const [metodo, setMetodo] = useState<string>("");
  const [ventaRegistradaId, setVentaRegistradaId] = useState<number | null>(null);
  // Modal de monto recibido (efectivo)
  const [isMontoModalOpen, setIsMontoModalOpen] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState<string>("");
  const [vuelto, setVuelto] = useState<number | null>(null);
  const APII_URL = `${API_URL}/api/pago`;
  const VENTA_URL = `${API_URL}/api/ventas`;


  const handleConfirmMonto = async () => {
    const monto = parseFloat(montoRecibido);
    if (isNaN(monto) || monto < total) {
      alert("El monto recibido es menor al total. Ingrese un monto válido.");
      return;
    }
  
    const calculoVuelto = monto - total;
    setVuelto(calculoVuelto); // guarda el vuelto
  };



// ✅ Revisar estado del pago automáticamente para QR
  useEffect(() => {
    if (!pagoId || metodo !== "MercadoPago") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${APII_URL}/Estado/${pagoId}`);
        const data = await res.json();

        if (data.status === "approved" || data.status === "completado") {
          clearInterval(interval);
          setMensaje("Pago aprobado! Registrando venta...");
          await confirmarVenta(pagoId, metodo);
        } else {
          setMensaje(`Esperando aprobación del pago... Estado actual: ${data.status}`);
        }
      } catch (error) {
        console.error("Error revisando estado del pago:", error);
      }
    }, 5000); // cada 5 segundos

    return () => clearInterval(interval);
  }, [pagoId, metodo]);

  // ✅ Crear pago
  const handleConfirm = async (m: string) => {
    try {
      setLoading(true);
      setMetodo(m);
      setMensaje("💳 Procesando pago...");

      const metodoPago = m === "MercadoPago" ? "qr" : m.toLowerCase();
      const token = localStorage.getItem("token");
      if (!token) return alert("No se encontró token. Inicia sesión de nuevo.");

      // Crear pago en backend
      const pagoResponse = await fetch(`${APII_URL}/CrearPago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Monto: total,
          Metodo: metodoPago,
          Email: "cliente@test.com", // reemplazar si hay email real
        }),
      });

      const text = await pagoResponse.text();
      let pagoData: any;
      try {
        pagoData = JSON.parse(text);
      } catch {
        pagoData = { error: text };
      }

      if (!pagoResponse.ok) throw new Error(pagoData.error || `Error: ${pagoResponse.status}`);

      setPagoId(pagoData.pagoId);

      if (m === "Efectivo") {
        await confirmarVenta(pagoData.pagoId,"Efectivo");
      } else if (m === "Tarjeta") {
        setMensaje("Procesá el pago en el Point físico de MercadoPago. La venta se registrará cuando el pago esté confirmado.");
      } else {
        // MercadoPago QR
        setQrUrl(pagoData.qrUrl);
        setMensaje("Escaneá el QR desde tu app de MercadoPago.");
      }
    } catch (error: any) {
      console.error(error);
      setMensaje("Error procesando el pago/venta");
      alert("Hubo un error al procesar el pago o registrar la venta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Confirmar venta solo después de pago aprobado
  const confirmarVenta = async (pagoId: number, metodoPago: string) => {
    try {
      setLoading(true);
      setMensaje("🧾 Registrando venta...");

      const token = localStorage.getItem("token");
      
      const response = await fetch(`${VENTA_URL}/ConfirmarPago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pagoId,
          usuarioId,
          metodoPago,
          detalles: cart.map((item) => ({
            productoId: item.id,
            cantidad: item.qty,
            precioUnitario: item.precio,
          })),
          total,
        }),
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (!response.ok) throw new Error(data.error || `Error: ${response.status}`);

      setVentaRegistradaId(data.ventaId);
      
      
    } catch (error: any) {
      console.error(error);

    // Detectar si el backend devolvió un error de stock insuficiente
    if (error.message?.toLowerCase().includes("stock")) {
      alert("❌ No hay suficiente stock para uno o más productos. Verificá el inventario antes de continuar.");
    } else {
      alert("Hubo un error al registrar la venta: " + error.message);
    }

    setMensaje("Error al registrar la venta. Verificá el stock o intentá nuevamente.");
  } finally {
    setLoading(false);
  }
  };
  
  return (
    <>
      <div className="pago-container">
        <h1 className="pago-title">Método de Pago</h1>

        <div className="pago-resumen">
          <h3>Resumen de compra:</h3>
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.nombre} x{item.qty} = ${(item.precio * item.qty).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="pago-total">Total: ${total.toFixed(2)}</p>
        </div>

        <div className="pago-metodos">
          <button  className="pago-btn"onClick={() => setIsMontoModalOpen(true)} >
            Efectivo
          </button>
          <button onClick={() => handleConfirm("Tarjeta")} className="pago-btn">
            Tarjeta
          </button>
          <button onClick={() => handleConfirm("MercadoPago")} className="pago-btn">
            QR / MercadoPago
          </button>
        </div>

        {loading && <p className="pago-status">Procesando...</p>}
        {mensaje && <p className="pago-status">{mensaje}</p>}
        {ventaRegistradaId && <p className="pago-status">Venta registrada con ID: {ventaRegistradaId}</p>}
      </div>

      {/* Modal QR */}
<Modal open={!!qrUrl} onClose={() => setQrUrl(null)}>
  <h3>Escaneá este QR para pagar</h3>
  {qrUrl && <img src={qrUrl} alt="QR MercadoPago" />}
  <button onClick={() => setQrUrl(null)}>Cerrar</button>
</Modal>



<Modal open={isMontoModalOpen} onClose={() => {
  setIsMontoModalOpen(false);
  setVuelto(null); // reset al cerrar
  setMontoRecibido("");
}}>
  <h3>Monto recibido</h3>
  <input
    type="number"
    value={montoRecibido}
    onChange={(e) => setMontoRecibido(e.target.value)}
    placeholder="Ingrese monto recibido"
    style={{ fontSize: "24px", padding: "12px", width: "100%", marginTop: "8px" }}
  />

  {vuelto !== null && (
    <p style={{
      fontSize: "28px",
      fontWeight: "bold",
      color: "#10b981",
      marginTop: "12px",
      textAlign: "center"
    }}>
      💵 Vuelto: ${vuelto.toFixed(0)}
    </p>
  )}

  <div className="modal-buttons" style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
    <button
      onClick={() => {
        setIsMontoModalOpen(false);
        setVuelto(null);
        setMontoRecibido("");
      }}
      className="btn-cancel"
    >
      Cancelar
    </button>
    <button
    onClick={handleConfirmMonto} // solo calcula vuelto
    className="btn-save"
  >
    Calcular Vuelto
  </button>

  {vuelto !== null && (
    <button
      onClick={async () => {
        await handleConfirm("Efectivo"); // ahora sí registra venta
        setIsMontoModalOpen(false);
        setVuelto(null);
        setMontoRecibido("");
      }}
      className="btn-save"
    >
      Confirmar Venta
    </button>
  )}
  </div>
</Modal>



  {ventaRegistradaId && (
  <div className="modall">
    <div className="modal-content success ticket"style={{ fontFamily: "monospace", fontSize: "13px" }}>
      <div className="ticket" id="ticket">
        <h2>#TWstore</h2>
        <p className="titulo">🧾 Ticket de Venta</p>

        <p><strong>ID Venta:</strong> {ventaRegistradaId}</p>
        <p><strong>Cajero:</strong> {usuarioNombre}</p>
        <p><strong>Método de Pago:</strong> {metodo}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>

        <hr />

        <h4>Productos</h4>

        <div className="ticket-header">
          <span>Producto</span>
          <span>Cant</span>
          <span>P.Unit</span>
          <span>Imp</span>
        </div>

        {cart.map(item => (
          <div key={item.id} className="ticket-item">
            <span>{item.nombre}</span>
            <span>{item.qty}</span>
            <span>${item.precio.toFixed(0)}</span>
            <span>${(item.precio * item.qty).toFixed(0)}</span>
          </div>
        ))}

        <hr />

        <p className="total"><strong>Total:</strong> ${total.toFixed(0)}</p>

        <p className="gracias">Gracias por elegir #TWstore ¡Nos encanta tenerte como cliente!😁❤️</p>
        <p className="gracias">Si esto fuera una reseña, te daríamos 5 estrellas ⭐⭐⭐⭐⭐ 😂</p>
        <p style={{ height: "60px" }}></p>
      </div>

      {/* Botón visible solo en pantalla */}
      <button className="cerrar-btn" onClick={() => window.print()}>
      Imprimir Ticket
      </button>
      <button
        className="cerrar-btn"
        onClick={() => navigate("/cajero")}
      >
        Cerrar
      </button>
    </div>
  </div>
  )}
  </>
);
}
