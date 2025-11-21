import { useEffect, useState } from "react";

import { API_URL } from "../config";

interface Product {
  id: number;
  nombre: string;
  categoria: {
    id: number;
    nombre: string;
  };
  stock: number;
}


export default function StockControl() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const LOW_STOCK_LIMIT = 5;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/Producto`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error cargando productos", err);
      }
    }

    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalProductos = products.length;
  const sinStock = products.filter((p) => p.stock <= 0).length;
  const bajoStock = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_LIMIT
  ).length;

  const imprimir = () => window.print();

  return (
    <div className="stock-container">
      {/* HEADER */}
      <div className="stock-header">
        <h1>📦 Control de Stock</h1>
        <button onClick={imprimir} className="print-btn">
          🖨️ Imprimir
        </button>
      </div>

      {/* DASHBOARD */}
      <div className="stock-dashboard">
        <div className="stat-card">
          <h3>Total productos</h3>
          <span>{totalProductos}</span>
        </div>

        <div className="stat-card warning">
          <h3>Stock bajo (≤ {LOW_STOCK_LIMIT})</h3>
          <span>{bajoStock}</span>
        </div>

        <div className="stat-card danger">
          <h3>Sin stock</h3>
          <span>{sinStock}</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="stock-search">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <table className="table-stock">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock Actual</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((prod) => (
            <tr
              key={prod.id}
              className={
                prod.stock <= 0
                  ? "danger-row"
                  : prod.stock <= LOW_STOCK_LIMIT
                  ? "warning-row"
                  : ""
              }
            >
              <td>{prod.nombre}</td>
              <td>{prod.categoria?.nombre ?? "Sin categoría"}</td>
              <td>{prod.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}