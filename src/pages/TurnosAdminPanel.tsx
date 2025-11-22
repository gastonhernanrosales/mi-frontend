import { useEffect, useState } from "react";
import { API_URL } from "../config";
import "../styles/TurnosAdminPanel.css";
export default function TurnosAdminPanel() {
  const [turnos, setTurnos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/turnos`)
      .then(res => res.json())
      .then(data => setTurnos(data));
  }, []);

  const calcularDiferencia = (t: any) => {
    const esperado = t.fondoInicial + t.totalVentas;
    return t.efectivoFinal - esperado;
  };

  return (
    <div className="turnos-admin-container">
      <h1>📋 Turnos de Caja</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Cajero</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Fondo Inicial</th>
            <th>Total Ventas</th>
            <th>Efectivo Final</th>
            <th>Diferencia</th>
          </tr>
        </thead>

        <tbody>
          {turnos.map((t: any) => (
            <tr key={t.id}>
              <td>{t.usuario?.nombre ?? "—"}</td>
              <td>{new Date(t.inicio).toLocaleString()}</td>
              <td>{t.fin ? new Date(t.fin).toLocaleString() : "—"}</td>
              <td>${t.fondoInicial}</td>
              <td>${t.totalVentas}</td>
              <td>${t.efectivoFinal}</td>
              <td
                className={
                calcularDiferencia(t) === 0 ? "diferencia-ok" : "diferencia-mala"
                 }
                  >
                ${calcularDiferencia(t)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}