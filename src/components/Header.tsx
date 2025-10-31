// Header.tsx
import { User } from '../type';

interface HeaderProps {
  user: User;
  toggleSidebar: () => void; // para abrir/cerrar el sidebar en pantallas pequeñas
}

export default function Header({ user, toggleSidebar }: HeaderProps) {
  return (
    <header className="header">
      <button className="hamburger" onClick={toggleSidebar}>☰</button>
      <div>
        <h1>Bienvenido{user ? `, ${user.name}` : ''}</h1>
        <p className="role">{user.role.toUpperCase()}</p>
      </div>
    </header>
  );
}