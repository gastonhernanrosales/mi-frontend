
import { User } from '../type';

import '../styles/dashboard.css';

import {Outlet, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

interface Props {
  user: User;
  
  logout: () => void;
}

export default function CashierDashboard({ user, logout }: Props) {
  
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Verificamos si estamos en la página principal del admin
  const isCashierHome = location.pathname === '/cajero';
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

        <main>
        {isCashierHome && (
          
            <div className="card-grid">
            <div className="card" onClick={() => navigate("/cajero/venta")}>
              🛒 Nueva Venta
            </div>
            <div className="card" onClick={() => navigate("/cajero/turno")}>
             🧾 Turno de Caja
            </div>
            
            <div className="card" onClick={() => navigate("/cajero/mis-ventas")}>
              📋 Mis Ventas
            </div>
            <div className="card" onClick={() => navigate("/cajero/perfil")}>
              👤 Ver Perfil
            </div>
            <div className="card" onClick={() => navigate("/cajero/productos")}>
              📦 Consultar Productos
            
          </div>
        </div>
        )}
          <Outlet />
          <button
  className="ia-button"
  onClick={() => navigate("/cajero/asistente-ia")}
>
  ✨
  <span className="ia-badge">1</span>
</button>
          

          
       
        </main>
      </div>
    </Layout>
  );
}