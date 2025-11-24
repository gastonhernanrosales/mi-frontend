import { useState,useEffect } from 'react';
import { User } from './type';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './styles/App.css';
import CashierDashboard from './pages/CashierDashboard';
import {   Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Pago from './pages/Pago';
import Venta from './pages/Venta';
import Profile from './pages/Profile';
import MisVentas from './pages/MisVentas';
import Products from './pages/Products';
import PrivateRoute from './PrivateRoute';
import ManageProducts from './pages/ManageProducts';
import Users from './pages/Users';
import VentasAdmin from './pages/VentasAdmin';
import StockControl from './pages/StockControl';
import TurnoCaja from './pages/TurnoCaja';
import TurnosAdminPanel from './pages/TurnosAdminPanel';
import TurnoDetalle from './pages/TurnoDetalle';
export default function App() {
  
  
  const [user, setUser] = useState<User | null>(null);
  
  
  useEffect(() => {
    const idStr = localStorage.getItem('userid');
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (idStr &&token && email && role && name) {
      setUser({id:parseInt(idStr), name, email, role: role.toLowerCase() as 'admin' | 'cajero' });
    }
  }, []);
  return <AppRoutes user={user} setUser={setUser} />;
}
function AppRoutes({ user, setUser }: { user: User | null; setUser: (u: User | null) => void }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login'); // 🔹 redirige visualmente al login
    
  };
  

  return (
    <Routes>
      
      <Route path="/login" element={<Login setUser={setUser} />} />

      {/* ADMIN */}
      <Route element={<PrivateRoute user={user} role="admin" />}>
        <Route path="/admin" element={<AdminDashboard user={user!} logout={logout} />}>
          <Route path="products" element={<Products userRole="admin" />} />
          <Route path="manage-products" element={<ManageProducts userRole="admin" />} />
          <Route path="users" element={<Users />} />
          <Route path="ventasadmin" element={<VentasAdmin />} />
          <Route path="turnos" element={<TurnosAdminPanel />} />
          <Route path="/admin/turnos/detalle/:id" element={<TurnoDetalle />} />
          <Route path="/admin/stock-control" element={<StockControl  />}
          
/>
          
        </Route>
      </Route>

      {/* CAJERO */}
      <Route element={<PrivateRoute user={user} role="cajero" />}>
        <Route path="/cajero" element={<CashierDashboard user={user!} logout={logout} />}>
          <Route path="venta" element={<Venta user={user!} logout={logout} />} />
          <Route path="perfil" element={<Profile user={user!} />} />
          <Route path="mis-ventas" element={<MisVentas />} />
          <Route path="productos" element={<Products />} />
          <Route path="pago" element={<Pago />} />
          <Route path="turno" element={<TurnoCaja user={user!} />} />
          <Route path="/turnos/detalle/:id" element={<TurnoDetalle />} />
        </Route>
      </Route>

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" replace />} /> 
    </Routes>
  );
  
}