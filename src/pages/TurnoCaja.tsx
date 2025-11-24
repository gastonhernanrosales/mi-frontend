import { useEffect, useState } from "react";
import { API_URL } from "../config";

import "../styles/TurnoCaja.css";
import { data } from "react-router-dom";

type Venta = {
  id: number;
  total: number;
  metodoPago: string;
  fecha: string;
  usuarioId: number;
};

export default function TurnoCaja({ user }: any) {
  const [turno, setTurno] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fondoInicial, setFondoInicial] = useState("");
  

  useEffect(() => {
    console.log(user.id);
    if (!user?.id) return; // <<< prevent null
    fetch(`${API_URL}/api/Turnos/abierto/${user.id}`)
      .then(async (res) => {
        const text = await res.text(); // leemos todo crudo

        if (!text) {
          setTurno(null);
        } else {
          setTurno(JSON.parse(text));
        }

        setLoading(false);
         });
  }, []);

  const abrirTurno = async () => {
    if (!fondoInicial) return alert("Colocá el fondo inicial");
    if (!user?.id) {
      alert("Error: usuario no encontrado");
      return;
    }

    const res = await fetch(`${API_URL}/api/Turnos/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuarioId: user.id,
        fondoInicial: parseFloat(fondoInicial),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(data);
      setTurno(data);
      alert("Turno iniciado correctamente");
    } else {
      console.log(data);
      alert("Ya existe un turno abierto",);
    }
  };

  const cerrarTurno = async () => {
    const userId = localStorage.getItem("userId");

    // 1️⃣ Obtener turno abierto
    const turnoRes = await fetch(`${API_URL}/api/Turnos/abierto/${userId}`);
    const turnoText = await turnoRes.text();
    let turno: any = null;

    if (turnoText) {
      try {
        turno = JSON.parse(turnoText);
      } catch {
      turno = null;
  }
}

    if (!turno) {
      alert("No tenés turno abierto");
      return;
    }

    // 2️⃣ Traer ventas en el rango
    const ventasRes = await fetch(
      `${API_URL}/api/ventas/GetByUserAndTurno?userId=${userId}&desde=${turno.inicio}&hasta=${new Date().toISOString()}`
    );

    const ventas: Venta[] = await ventasRes.json();

    // 3️⃣ Total efectivo
    const totalEfectivo = ventas
      .filter((v) => v.metodoPago.toLowerCase() === "efectivo")
      .reduce((s: number, v: Venta) => s + v.total, 0);

    const efectivoFinal = prompt(
      `Total en efectivo calculado por el sistema: $${totalEfectivo}\n\nIngresá el efectivo contado:`
    );

    if (!efectivoFinal) return;

    // 4️⃣ Enviar cierre
    const cerrarRes = await fetch(`${API_URL}/api/Turnos/cerrar/${turno.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parseFloat(efectivoFinal)),
    });

    const data = await cerrarRes.json();
    alert(data.mensaje);
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

          <button onClick={cerrarTurno}>Cerrar Turno</button>
        </div>
      )}
    </div>
  );
}