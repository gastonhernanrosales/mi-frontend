import { useEffect, useState } from "react";
import { API_URL } from "../config";
import Modal from "../components/Modal";
import "../styles/TurnoCaja.css";

export default function TurnoCaja({ user }: any) {
  const [turno, setTurno] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fondoInicial, setFondoInicial] = useState("");
  const [efectivoFinal, setEfectivoFinal] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [resumen, setResumen] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/turnos/abierto`)
      .then((res) => res.json())
      .then((data) => {
        setTurno(data);
        setLoading(false);
      });
  }, []);

  const abrirTurno = async () => {
    if (!fondoInicial) return alert("Coloca el fondo inicial");

    const res = await fetch(`${API_URL}/api/turnos/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: user.id,
        fondoInicial: parseFloat(fondoInicial),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setTurno(data);
      alert("Turno iniciado correctamente");
    } else {
      alert("Ya existe un turno abierto");
    }
  };

  const prepararCierre = async () => {
    if (!efectivoFinal)
      return alert("Coloca el efectivo contado al final");

    const res = await fetch(`${API_URL}/api/turnos/${turno.id}/ventas`);
    const data = await res.json();

    const totalVentas = data.totalVentas;

    const esperado = turno.fondoInicial + totalVentas;
    const contado = parseFloat(efectivoFinal);
    const diferencia = contado - esperado;

    setResumen({ totalVentas, esperado, contado, diferencia });
    setOpenModal(true);
  };

  const cerrarTurno = async () => {
    const res = await fetch(`${API_URL}/api/turnos/cerrar/${turno.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        efectivoFinal: parseFloat(efectivoFinal),
      }),
    });

    if (res.ok) {
      setTurno(null);
      setOpenModal(false);
      alert("Turno cerrado correctamente");
    }
  };

  if (loading) return <div>Cargando turno...</div>;

  return (
    <div className="turno-container">
      {!turno ? (
        <div className="turno-card">
          <h2>🟢 Apertura de Caja</h2>

          <label>Fondo Inicial:</label>
          <input
            type="number"
            value={fondoInicial}
            onChange={(e) => setFondoInicial(e.target.value)}
            placeholder="Ej: 15000"
          />

          <button onClick={abrirTurno}>Abrir Turno</button>
        </div>
      ) : (
        <div className="turno-card">
          <h2>🔴 Cierre de Caja</h2>

          <p>
            <strong>Inicio:</strong>{" "}
            {turno.inicio
              ? new Date(turno.inicio).toLocaleTimeString()
              : "—"}
          </p>

          <p>
            <strong>Fondo Inicial:</strong> ${turno.fondoInicial}
          </p>

          <label>Efectivo Contado:</label>
          <input
            type="number"
            value={efectivoFinal}
            onChange={(e) => setEfectivoFinal(e.target.value)}
            placeholder="Ej: 38200"
          />

          <button onClick={prepararCierre}>Cerrar Turno</button>
        </div>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <h2>🧾 Resumen del Turno</h2>

        {resumen && (
          <div className="modal-resumen">
            <p><strong>Total Ventas:</strong> ${resumen.totalVentas}</p>
            <p><strong>Efectivo Esperado:</strong> ${resumen.esperado}</p>
            <p><strong>Efectivo Contado:</strong> ${resumen.contado}</p>
            <p
              style={{
                fontWeight: "bold",
                color: resumen.diferencia === 0 ? "green" : "red",
              }}
            >
              Diferencia: ${resumen.diferencia}
            </p>

            <button className="confirm-btn" onClick={cerrarTurno}>
              Confirmar Cierre
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}