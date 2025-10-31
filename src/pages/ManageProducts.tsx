import { useState, useEffect, useRef } from "react";
import "../styles/ManageProducts.css";
import Modal from "../components/Modal";
import { API_URL } from "../config";

type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imageUrl: string;
  codigoBarras: string;
  categoriaId: number;
  categoriaNombre: string;
};

type Category = {
  id: number;
  nombre: string;
};

interface ProductsProps {
  userRole: "admin" | "cajero";
}

const APII_URL = `${API_URL}/api/Producto`;
const API_CATEGORIES = `${API_URL}/api/Categoria`;

const ManageProducts: React.FC<ProductsProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    imageUrl: "",
    codigoBarras: "",
    categoriaId: 0,
  });

  const [newCategoryName, setNewCategoryName] = useState("");

  // ----------- CARGAR CATEGORÍAS -----------
  const fetchCategories = async () => {
    try {
      const res = await fetch(API_CATEGORIES);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      // Mapear posible forma de respuesta
      const mapped = data.map((c: any) => ({
        id: c.Id ?? c.id,
        nombre: c.Nombre ?? c.nombre,
      }));
      setCategories(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ----------- LECTOR DE CÓDIGO DE BARRAS -----------
  useEffect(() => {
    let buffer = "";
    let timer: number | undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputRef.current && document.activeElement === inputRef.current) return;

      if (e.key.length === 1) buffer += e.key;
      else if (e.key === "Enter" && buffer.length > 0) {
        setForm((prev) => ({ ...prev, codigoBarras: buffer }));
        buffer = "";
      }

      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        buffer = "";
      }, 150);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // ----------- GET PRODUCTS -----------
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(APII_URL);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      const mapped = data.map((p: any) => ({
        id: p.Id ?? p.id,
        nombre: p.Nombre ?? p.nombre,
        descripcion: p.Descripcion ?? p.descripcion,
        precio: p.Precio ?? p.precio,
        stock: p.Stock ?? p.stock,
        imageUrl: p.ImageUrl ?? p.imageUrl,
        codigoBarras: p.CodigoBarras ?? p.codigoBarras,
        categoriaId: p.CategoriaId ?? p.categoriaId ?? p.categoria?.id ?? p.Categoria?.Id ?? 0,
        categoriaNombre: p.categoria?.nombre ?? p.Categoria?.Nombre ?? "",
        
      }));
      setProducts(mapped);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ----------- MODAL HANDLERS -----------
  const handleAdd = () => {
    setEditingProduct(null);
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      imageUrl: "",
      codigoBarras: "",
      categoriaId: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl,
      codigoBarras: product.codigoBarras,
      categoriaId: product.categoriaId,
    });
    setShowModal(true);
  };

  // ----------- CREATE / UPDATE PRODUCT -----------
  const handleCreateProduct = async () => {
    const payload = {
      Nombre: form.nombre,
      Descripcion: form.descripcion,
      Precio: +form.precio,
      Stock: +form.stock,
      ImageUrl: form.imageUrl,
      CodigoBarras: form.codigoBarras,
      CategoriaId: form.categoriaId,
    };

    const res = await fetch(APII_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al crear producto");
    const newProduct = await res.json();

    // Mapear respuesta y actualizar lista
    const mappedProduct: Product = {
      id: newProduct.Id ?? newProduct.id,
      nombre: payload.Nombre,
      descripcion: payload.Descripcion,
      precio: payload.Precio,
      stock: payload.Stock,
      imageUrl: payload.ImageUrl,
      codigoBarras: payload.CodigoBarras,
      categoriaId: newProduct.categoria?.id ?? newProduct.Categoria?.Id ?? 0,
      categoriaNombre: newProduct.categoria?.nombre ?? newProduct.Categoria?.Nombre ?? "",
      
    };

    setProducts((prev) => [...prev, mappedProduct]);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    const payload = {
      Nombre: form.nombre,
      Descripcion: form.descripcion,
      Precio: +form.precio,
      Stock: +form.stock,
      ImageUrl: form.imageUrl,
      CodigoBarras: form.codigoBarras,
      CategoriaId: form.categoriaId,
    };

    const res = await fetch(`${APII_URL}/PutProducto/${editingProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al actualizar producto");
    const updated = await res.json();
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              nombre: form.nombre,
              descripcion: form.descripcion,
              precio: +form.precio,
              stock: +form.stock,
              imageUrl: form.imageUrl,
              codigoBarras: form.codigoBarras,
              categoriaId: updated.categoria?.id ?? updated.Categoria?.Id ?? 0,
              categoriaNombre: updated.categoria?.nombre ?? updated.Categoria?.Nombre ?? "",
            }
          : p
      )
    );
  };

  const handleSave = async () => {
    try {
      if (
        !form.nombre ||
        !form.descripcion ||
        !form.precio ||
        !form.stock ||
        !form.imageUrl ||
        !form.codigoBarras ||
        !form.categoriaId
      ) {
        alert("Completa todos los campos y selecciona categoría");
        return;
      }

      if (editingProduct) await handleUpdateProduct();
      else await handleCreateProduct();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el producto");
    }
  };

  // ----------- DELETE PRODUCT -----------
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`${APII_URL}/DeleteProducto/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al borrar producto");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo borrar el producto");
    }
  };

  // ----------- CREAR NUEVA CATEGORÍA DESDE EL MODAL -----------
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Ingrese un nombre para la categoría");
      return;
    }

    try {
      const res = await fetch(API_CATEGORIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newCategoryName }),
      });
      if (!res.ok) throw new Error("Error al crear categoría");

      const nueva = await res.json();
      const mapped = {
        id: nueva.Id ?? nueva.id,
        nombre: nueva.Nombre ?? nueva.nombre,
      };
      setCategories((prev) => [...prev, mapped]);

      // Seleccionar la nueva categoría automáticamente en el formulario
      setForm((prev) => ({ ...prev, categoriaId: mapped.id }));

      setNewCategoryName("");
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la categoría");
    }
  };

  // ----------- RENDER -----------
  return (
    <>
      <div className="products-page">
        <h2>Administrar Productos</h2>

        {userRole === "admin" && (
          <button className="btn-add" onClick={handleAdd}>
            Agregar Producto
          </button>
        )}

        {loading && <p>Cargando productos...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="products-grid">
          {products.length === 0 ? (
            <p>No hay productos disponibles</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="product-card">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.nombre} className="product-image" />
                )}
                <div className="product-info">
                  <h3>{product.nombre}</h3>
                  <p>Descripcion: {product.descripcion}</p>
                  <p>Precio: ${product.precio.toFixed(2)}</p>
                  <p>Stock: {product.stock}</p>
                  <p>CodigoBarras: {product.codigoBarras}</p>
                  <p>{product.categoriaNombre ? product.categoriaNombre : "Sin categoría"}</p>
                  
                </div>
                {userRole === "admin" && (
                  <div className="product-actions">
                    <button className="btn-edit" onClick={() => handleEdit(product)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---------- MODAL PRODUCTO ---------- */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h3>{editingProduct ? "Editar Producto" : "Agregar Producto"}</h3>

        <div className="modal-form">
          {/* 🔹 Selector de categoría + botón NUEVA (sólo admin) */}
          <div className="categoria-select-row">
            <select
              value={form.categoriaId}
              onChange={(e) => setForm({ ...form, categoriaId: +e.target.value })}
            >
              <option value={0}>Seleccione categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            {userRole === "admin" && (
              <button
                type="button"
                className="btn-add-category"
                onClick={() => setShowCategoryModal(true)}
              >
                + Nueva
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descripcion"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <input
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={(e) => setForm({ ...form, precio: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <input
            type="text"
            placeholder="URL Imagen"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Codigo de Barras"
            value={form.codigoBarras}
            onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })}
          />
          <button className="btn-leer-codigo" type="button" onClick={() => inputRef.current?.focus()}>
            Leer Código de Barras
          </button>
        </div>

        <div className="modal-buttons">
          <button className="btn-save" onClick={handleSave}>
            Guardar
          </button>
          <button className="btn-cancel" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
        </div>
      </Modal>

      {/* ---------- MODAL NUEVA CATEGORÍA ---------- */}
      <Modal open={showCategoryModal} onClose={() => setShowCategoryModal(false)}>
        <h3>Agregar Nueva Categoría</h3>
        <input
          type="text"
          placeholder="Nombre de la categoría"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <div className="modal-buttons">
          <button className="btn-save" onClick={handleCreateCategory}>
            Guardar
          </button>
          <button className="btn-cancel" onClick={() => setShowCategoryModal(false)}>
            Cancelar
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ManageProducts;