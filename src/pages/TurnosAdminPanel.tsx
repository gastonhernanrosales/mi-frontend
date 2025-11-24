import { useEffect, useState } from "react";
import { API_URL } from "../config";
import "../styles/TurnosAdminPanel.css";
import { useNavigate } from "react-router-dom";


export default function TurnosAdminPanel() {
  const [turnos, setTurnos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/Turnos`)
      .then(res => res.json())
      .then(data => setTurnos(data));
  }, []);

 

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
            <th>Acciones</th> {/* NUEVO */}
          </tr>
        </thead>

        <tbody>
          {turnos.map((t: any) => (
            <tr key={t.id}>
              <td>{t.usuario?.nombre ?? "—"}</td>
              <td>{new Date(t.inicio).toLocaleString()}</td>
              <td>{t.cierre ? new Date(t.cierre).toLocaleString() : "—"}</td>
              <td>${t.fondoInicial}</td>
              <td>${t.totalEfectivo ?? 0}</td>
              <td>${t.efectivoFinal}</td>
              <td className={t.diferencia === 0 ? "diferencia-ok" : "diferencia-mala"}>
              ${t.diferencia}
              </td>
              {/* BOTÓN VER DETALLE */}
              <td>
                <button
                  className="btn-ver-detalle"
                  onClick={() => navigate(`/turnos/detalle/${t.id}`)}
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}