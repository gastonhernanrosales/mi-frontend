import { User } from '../type';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="header">
      <h1>Bienvenido{user ? `, ${user.name}` : ''}</h1>
      <p className="role">{user.role.toUpperCase()}</p>
    </header>
  );
}
