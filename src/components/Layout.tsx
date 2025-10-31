import '../styles/dashboard.css'; // 👈 importa los estilos del panel
import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { User } from '../type';

interface LayoutProps {
  user: User;
  role: 'admin' | 'cajero';
  logout: () => void;
  children: ReactNode;
}

export default function Layout({ user, role, logout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      <Header user={user} toggleSidebar={toggleSidebar} />
      <Sidebar role={role} logout={logout} isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}