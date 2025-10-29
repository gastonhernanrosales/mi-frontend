import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MisVentas.css";
import { API_URL } from "../config";

interface Venta {
  id: number;
  fecha: string;
  total: number;
  estado: string; // nuevo campo
}

export default function MisVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userId = localStorage.getItem("userId"); // guardado al iniciar sesión

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/Ventas/GetByUser/${userId}`);
        setVentas(response.data);
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, [userId]);

  if (loading) return <p>Cargando ventas...</p>;

  return (
    <div className="misventas-container">
      <h1>📋 Mis Ventas</h1>
      {ventas.length === 0 ? (
        <p>No realizaste ventas aún.</p>
      ) : (
        <table className="ventas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th> {/* Nuevo */}
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>${v.total.toFixed(2)}</td>
                <td style={{ color: v.estado === "cancelada" ? "#ef4444" : "#10b981" }}>
                {v.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}