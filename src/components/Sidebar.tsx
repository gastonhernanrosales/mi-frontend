// Sidebar.tsx
import { Home, Package, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  role: 'admin' | 'cajero';
  logout: () => void;
  isOpen: boolean; // control de visibilidad en móvil
  closeSidebar: () => void;
}

export default function Sidebar({ role, logout, isOpen, closeSidebar }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2 className="logo">Sistema de Ventas #TWstore</h2>
        <nav>
          <button onClick={() => { navigate(role === 'admin' ? '/admin' : '/cajero'); closeSidebar(); }}>
            <Home /> Inicio
          </button>

          {role === 'admin' && (
            <>
              <button onClick={() => { navigate('/admin/products'); closeSidebar(); }}>
                <Package /> Productos
              </button>
              <button onClick={() => { navigate('/admin/users'); closeSidebar(); }}>
                <Users /> Usuarios
              </button>
            </>
          )}

          {role === 'cajero' && (
            <button onClick={() => { navigate('/cajero/venta'); closeSidebar(); }}>
              <ShoppingCart /> Nueva Venta
            </button>
          )}

          <button onClick={() => { logout(); closeSidebar(); }} className="logout">
            <LogOut /> Cerrar Sesión
          </button>
        </nav>
      </aside>
      <div className={`overlay ${isOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
    </>
  );
}

