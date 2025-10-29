import { Home, Package, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface SidebarProps {
  role: 'admin' | 'cajero';
 
  logout: () => void;
}

export default function Sidebar({ role, logout}: SidebarProps) {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <h2 className="logo">Sistema de Ventas Eterlinda</h2>
      <nav>
        <button onClick={() => navigate(role === 'admin' ? '/admin' : '/cajero')}>
          <Home /> Inicio
        </button>

        {role === 'admin' && (
          <>
            <button onClick={() => navigate('/admin/products')}>
              <Package /> Productos
            </button>
            <button onClick={() => navigate('/admin/users')}>
              <Users /> Usuarios
            </button>
          </>
        )}

        {role === 'cajero' && (
          <button onClick={() => navigate('/cajero/venta')}>
            <ShoppingCart /> Nueva Venta
          </button>
        )}

        <button onClick={logout} className="logout">
          <LogOut /> Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}


