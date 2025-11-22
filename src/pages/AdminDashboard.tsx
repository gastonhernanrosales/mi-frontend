import { User } from '../type';
import Layout from '../components/Layout';  // 👈 usamos el nuevo Layout
import '../styles/dashboard.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

interface Props {
  user: User;
  logout: () => void;
}

export default function AdminDashboard({ user, logout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Verificamos si estamos en la página principal del admin
  const isAdminHome = location.pathname === '/admin';

  return (
    <Layout user={user} role={user.role} logout={logout}>
      <div className="dashboard-layout">
        {/* Fondo animado */}
        <div className="background-particles">
          {Array.from({ length: 15 }).map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${12 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Contenido principal */}
        <main>
          {/* Mostrar las tarjetas solo si estamos en /admin */}
          {isAdminHome && (
            <div className="card-grid">
              <div className="card" onClick={() => navigate('/admin/manage-products')}>
                📦 Gestionar Productos
              </div>
              <div className="card" onClick={() => navigate('/admin/users')}>
                👤 Gestionar Usuarios
              </div>
              <div className="card" onClick={() => navigate('/admin/turnos')}>
               🧾 Turnos de Caja
              </div>
              <div className="card" onClick={() => navigate('/admin/ventasadmin')}>
                💰 Ver Ventas
              </div>
              <div className="card" onClick={() => navigate('/admin/manage-products')}>
                🏷️ Gestionar Categorías o Proveedores
              </div>
              <div className="card" onClick={() => navigate('/admin/stock-control')}>
                 📦 Control de Stock
              </div>
              <div className="card">📝 Reportes / Informes</div>
              <div className="card">⚙️ Configuración del sistema</div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </Layout>
  );
}