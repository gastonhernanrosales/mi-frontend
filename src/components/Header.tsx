// Header.tsx
import { User } from '../type';

interface HeaderProps {
  user: User;
  toggleSidebar: () => void; // para abrir/cerrar el sidebar en pantallas pequeñas
}

export default function Header({ user, toggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button className="hamburger" onClick={toggleSidebar}>☰</button>
        <h1>Bienvenido{user ? `, ${user.name}` : ''}</h1>
      </div>
      <span className="role-badge">
        {user.role.toUpperCase()}
      </span>
      
    </header>
  );
}