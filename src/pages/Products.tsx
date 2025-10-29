import { useEffect, useState } from 'react';
import '../styles/products.css';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imageUrl: string;
  codigoBarras: string;
  categoriaId: number;
  categoriaNombre: string; // para mostrar el nombre
}

export interface Category {
  id: number;
  nombre: string;
}

interface ProductsProps {
  userRole?: 'admin' | 'cajero';
}

export default function Products({ userRole }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState(''); // 🔍 búsqueda por texto
  const [filtroCategoria, setFiltroCategoria] = useState(0); // 🔹 filtro por categoría
  const navigate = useNavigate();

  // Cargar productos
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/Producto`);
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();

      // mapear para incluir categoriaNombre
      const mapped = data.map((p: any) => ({
        id: p.Id || p.id,
        nombre: p.Nombre || p.nombre,
        descripcion: p.Descripcion || p.descripcion,
        precio: p.Precio || p.precio,
        stock: p.Stock || p.stock,
        imageUrl: p.ImageUrl || p.imageUrl,
        codigoBarras: p.CodigoBarras || p.codigoBarras,
        categoriaId: p.CategoriaId ?? p.categoriaId ?? p.categoria?.id ?? p.Categoria?.Id ?? 0,
        categoriaNombre: p.categoria?.nombre ?? p.Categoria?.Nombre ?? "",
        
      }));

      setProducts(mapped);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/Categoria`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filtrado dinámico por texto y categoría
  const productosFiltrados = products.filter((p) =>
    `${p.nombre} ${p.descripcion} ${p.codigoBarras} ${p.categoriaNombre}`
      .toLowerCase()
      .includes(filtro.toLowerCase()) &&
    (filtroCategoria === 0 || p.categoriaId === filtroCategoria)
  );

  return (
    <div className="products-page">
      <h2>Productos</h2>

      {/* 🔹 Buscador y filtro por categoría */}
      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar por nombre, descripción o código..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="buscador-input"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(+e.target.value)}
        >
          <option value={0}>Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Botón para ir a gestionar productos */}
      {userRole === 'admin' && (
        <button className="btn-add" onClick={() => navigate('/admin/manage-products')}>
          Gestionar Productos
        </button>
      )}

      {loading && <p className="loading">Cargando productos...</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* 🔹 Lista de productos */}
      <div className="products-grid">
        {productosFiltrados.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            ⚠️ No se encontraron productos que coincidan con la búsqueda.
          </div>
        ) : (
          productosFiltrados.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl || '/placeholder.png'}
                alt={product.nombre || 'Producto'}
                className="product-image"
              />
              <div className="product-info">
                <span className="product-name">{product.nombre || 'Sin nombre'}</span>
                <span className="product-description">{product.descripcion || 'Sin descripción'}</span>
                <span className="product-price">${product.precio?.toFixed(2) || '0.00'}</span>
                <span className="product-stock">Stock: {product.stock ?? 0}</span>
                <span className="product-description">{product.codigoBarras || 'Sin código'}</span>
                <span className="product-categoria">{product.categoriaNombre || 'Sin categoría'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}