import { useEffect, useState } from "react";
import { API_URL } from "../config";
import '../styles/StockControl.css';
import { useNavigate } from "react-router-dom";
interface Product {
  id: number;
  nombre: string;
  categoria?: {
    id: number;
    nombre: string;
  };
  stock: number;
}

type SortField = "nombre" | "stock";
type SortOrder = "asc" | "desc";
type StockFilter = "all" | "low" | "out";

export default function StockControl() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const navigate = useNavigate();
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

  /* FILTROS */
  const filtered = products
    .filter((p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) => {
      if (stockFilter === "low") return p.stock > 0 && p.stock <= LOW_STOCK_LIMIT;
      if (stockFilter === "out") return p.stock <= 0;
      return true;
    });

  /* ORDEN */
  const sortedProducts = [...filtered].sort((a, b) => {
    let result = 0;

    if (sortField === "nombre") {
      result = a.nombre.localeCompare(b.nombre);
    }

    if (sortField === "stock") {
      result = a.stock - b.stock;
    }

    return sortOrder === "asc" ? result : -result;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* STATS */
  const totalProductos = products.length;
  const sinStock = products.filter((p) => p.stock <= 0).length;
  const bajoStock = products.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_LIMIT
  ).length;

  const imprimir = () => window.print();

 
  const goToManageProducts = (product: Product) => {
  navigate("/admin/manage-products", {
    state: { product }
  });
};

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

      {/* FILTERS */}
      <div className="stock-filters">
        <button
          className={stockFilter === "all" ? "active" : ""}
          onClick={() => setStockFilter("all")}
        >
          Todos
        </button>

        <button
          className={stockFilter === "low" ? "active" : ""}
          onClick={() => setStockFilter("low")}
        >
          Bajo stock
        </button>

        <button
          className={stockFilter === "out" ? "active" : ""}
          onClick={() => setStockFilter("out")}
        >
          Sin stock
        </button>
      </div>

      {/* TABLE */}
      <table className="table-stock">
        <thead>
          <tr>
            <th onClick={() => handleSort("nombre")} className="sortable">
              Producto {sortField === "nombre" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
            </th>
            <th>Categoría</th>
            <th onClick={() => handleSort("stock")} className="sortable">
              Stock {sortField === "stock" && (sortOrder === "asc" ? "⬆️" : "⬇️")}
            </th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {sortedProducts.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.nombre}</td>
              <td>{prod.categoria?.nombre ?? "Sin categoría"}</td>
              <td>{prod.stock}</td>

              <td>
                {prod.stock <= 0 && <span className="badge danger">Sin stock</span>}
                {prod.stock > 0 && prod.stock <= LOW_STOCK_LIMIT && (
                  <span className="badge warning">Bajo</span>
                )}
                {prod.stock > LOW_STOCK_LIMIT && (
                  <span className="badge success">OK</span>
                )}
              </td>

              <td>
                <button
                  className="edit-btn"
                  onClick={() => goToManageProducts(prod)}
                >
                  ✏️ Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}