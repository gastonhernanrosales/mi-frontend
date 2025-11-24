import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../config";
import "../styles/TurnoDetalle.css";

export default function TurnoDetalle() {
  const { id } = useParams();
  const [detalle, setDetalle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/Turnos/detalle/${id}`)
      .then(res => res.json())
      .then(data => {
        setDetalle(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loading">Cargando detalles...</div>;

  if (!detalle) return <div className="loading">No se encontró el turno.</div>;

  return (
    <div className="detalle-container">
      <div className="detalle-card">

        <h1>📄 Resumen del Turno #{detalle.id}</h1>

        <div className="detalle-grid">
          <p><strong>Cajero:</strong> {detalle.cajero}</p>
          <p><strong>Inicio:</strong> {new Date(detalle.inicio).toLocaleString()}</p>
          <p><strong>Fin:</strong> {detalle.fin ? new Date(detalle.fin).toLocaleString() : "—"}</p>
          <p><strong>Fondo Inicial:</strong> ${detalle.fondoInicial}</p>
          <p><strong>Total Efectivo:</strong> ${detalle.totalEfectivo}</p>
          <p><strong>Total MP:</strong> ${detalle.totalMP}</p>
          <p><strong>Total Tarjeta:</strong> ${detalle.totalTarjeta}</p>
          <p><strong>Efectivo Esperado:</strong> ${detalle.efectivoEsperado}</p>
          <p><strong>Efectivo Final:</strong> ${detalle.efectivoFinal}</p>
          
          <p className={detalle.diferencia === 0 ? "ok" : "bad"}>
            <strong>Diferencia:</strong> ${detalle.diferencia}
          </p>
        </div>

        <h2 className="subtitulo">Ventas del Turno</h2>
        <div className="ventas-lista">
          {detalle.ventas.map((v: any) => (
            <div key={v.id} className="venta-item">
              <p><strong>ID:</strong> {v.id}</p>
              <p><strong>Total:</strong> ${v.total}</p>
              <p><strong>Método:</strong> {v.metodoPago}</p>
              <p><strong>Fecha:</strong> {new Date(v.fecha).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <button className="btn-print" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>
    </div>
  );
}