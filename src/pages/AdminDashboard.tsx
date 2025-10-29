
import { User } from '../type';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/dashboard.css';
import { Outlet,useLocation,useNavigate } from 'react-router-dom';

interface Props {
  user: User;
  logout: () => void;
}

export default function AdminDashboard({ user, logout }: Props) {
  
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Verificamos si estamos en la página principal del admin
  const isAdminHome = location.pathname === '/admin';

  return (
    <div className="dashboard-layout">
        <div className="background-particles">
    {Array.from({ length: 15 }).map((_, i) => (
      <span key={i} className="particle" style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${12 + Math.random() * 10}s`
      }} />
    ))}
  </div>
      <Sidebar role={user.role} logout={logout} />
      <div className="dashboard-content">
        <Header user={user} />

        <main>
          {/* 🔸 Mostrar las tarjetas SOLO si estamos en /admin */}
          {isAdminHome && (
          
            <div className="card-grid">
              <div className="card" onClick={() => navigate('/admin/manage-products')}>📦 Gestionar Productos</div>
              <div className="card" onClick={() => navigate('/admin/users')}>👤 Gestionar Usuarios</div>
              <div className="card" onClick={() => navigate('/admin/ventasadmin')}>💰 Ver Ventas</div>
              <div className="card" onClick={() => navigate('/admin/manage-products')}>📦 Gestionar Categorías o Proveedores</div>
              <div className="card">📝 Reportes / Informes</div>
              <div className="card">⚙️ Configuración del sistema</div>
              
              
            </div>
          )}
          
            <Outlet />
        </main>
      </div>
    </div>
  );
}