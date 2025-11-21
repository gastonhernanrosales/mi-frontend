import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { Product } from "./Products";
import "../styles/stockControl.css";

interface VentaDetalle {
  id: number;
  cantidad: number;
  precioUnitario: number;
  producto: Product;
  venta: {
    id: number;
    fecha: string;
    estado: string;
  };
}

export default function StockControl() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [detalles, setDetalles] = useState<VentaDetalle[]>([]);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar productos
  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/Producto`);
      if (!res.ok) throw new Error("Error al cargar productos");
      setProductos(await res.json());
    } catch {
      setError("No se pudieron cargar los productos");
    }
  };

  // Cargar venta detalles
  const fetchDetalles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/VentaDetalles`);
      if (!res.ok) throw new Error();
      setDetalles(await res.json());
    } catch {
      setError("No se pudieron cargar las ventas");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProductos();
      await fetchDetalles();
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // 🧠 Filtrar ventas por fecha elegida
  const detallesDelDia = detalles.filter((det) => {
    const fechaVenta = new Date(det.venta.fecha).toISOString().slice(0, 10);
    return fechaVenta === fecha && det.venta.estado !== "cancelada";
  });

  // 🧮 Calcular lo vendido por producto
  const vendidosMap = new Map<number, number>();

  detallesDelDia.forEach((d) => {
    const actual = vendidosMap.get(d.producto.id) || 0;
    vendidosMap.set(d.producto.id, actual + d.cantidad);
  });

  return (
    <div className="stock-control-page">
      <h2>📦 Control de Stock</h2>

      {/* fecha */}
      <div className="stock-filtros">
        <label>Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
      </div>

      <table className="stock-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock Actual</th>
            <th>Vendido</th>
            <th>Stock Antes del Día</th>
            <th>Diferencia</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => {
            const vendidos = vendidosMap.get(p.id) || 0;

            const stockActual = p.stock;
            const stockEsperado = p.stock + vendidos;
            const diferencia = stockActual - stockEsperado;

            return (
              <tr key={p.id} className={diferencia !== 0 ? "stock-alerta" : ""}>
                <td>{p.nombre}</td>
                <td>{stockActual}</td>
                <td>{vendidos}</td>
                <td>{stockEsperado}</td>
                <td className={diferencia < 0 ? "diff-negativa" : "diff-ok"}>
                  {diferencia}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}