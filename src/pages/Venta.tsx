import { useState, useEffect } from "react";
import { User } from "../type";
import "../styles/Venta.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";


interface Props {
  user: User;
  logout: () => void;
}

type Product = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  codigoBarras: string;
  imageUrl: string;
};

interface CartItem extends Product {
  qty: number;
}

export default function Venta({ user, logout }: Props)
 {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleConfirmVenta = () => {
    if (cart.length === 0) {
      alert("No hay productos en el carrito");
      return;
    }
  
    // Navegar a Pago.tsx y pasar el carrito y total
    const storedUserId = Number(localStorage.getItem("userId"));
    navigate("/cajero/pago", { state: { cart, total,usuarioId:  storedUserId ,usuarioNombre: user.name} });
  };

  // Cargar todos los productos al iniciar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/Producto`);
        console.log("Status fetch:", res.status);
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addProductByBarcode = () => {
    const product = products.find(p => p.codigoBarras === barcode);
    if (!product) {
      alert("Producto no encontrado");
      return;
    }
    // Si ya está en el carrito, aumentar qty
    const exists = cart.find(c => c.id === product.id);
    if (exists) {
      setCart(
        cart.map(c =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    setBarcode("");
  };

  const updateQty = (id: number, qty: number) => {
    setCart(cart.map(c => (c.id === id ? { ...c, qty } : c)));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const total = cart.reduce((s, c) => s + c.precio * c.qty, 0);

  return (
    <div className="venta-container">
      <h1 className="venta-title">Nueva Venta</h1>
      <div>
          <span>Cajero: {user.name}</span>
          <button onClick={logout} style={{ marginLeft: "10px" }}>Cerrar sesión</button>
        </div>

      <div className="venta-form">
        <input
          className="venta-input"
          placeholder="Escanear o ingresar código de barras"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addProductByBarcode()}
        />
        <button className="venta-btn" onClick={addProductByBarcode}>
          Agregar
        </button>
      </div>

      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {cart.length === 0 ? (
        <p className="venta-empty">No hay productos en la venta.</p>
      ) : (
        <div className="venta-grid">
          {cart.map(item => (
            <div key={item.id} className="venta-card">
              <img
                src={item.imageUrl}
                alt={item.nombre}
                className="venta-img"
              />
              <div className="venta-info">
                <h3>{item.nombre}</h3>
                <p>{item.descripcion}</p>
                <p><b>Código:</b> {item.codigoBarras}</p>
                <p><b>Precio:</b> ${item.precio.toFixed(2)}</p>
                <div className="venta-actions">
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    className="venta-qty"
                    onChange={e =>
                      updateQty(item.id, parseInt(e.target.value))
                    }
                  />
                  <button
                    className="venta-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Quitar
                  </button>
                </div>
                <p className="venta-subtotal">
                  Subtotal: ${(item.precio * item.qty).toFixed(0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="venta-total">Total: ${total.toFixed(0)}</div>

      <button
        className="venta-finalizar"
        onClick={handleConfirmVenta}
      >
        Procesar Venta
      </button>
    </div>
  );
}
