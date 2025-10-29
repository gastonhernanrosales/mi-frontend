import "../styles/Profile.css";
import { User } from "../type";

type ProfileProps = {
  user: User;
};

export default function Profile({ user }: ProfileProps) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{initial}</div>
        <h2 className="profile-title">Mi Perfil</h2>

        <div className="profile-info">
          <p><span>Nombre:</span> {user.name}</p>
          <p><span>Email:</span> {user.email || "No disponible"}</p>
          <p><span>Rol:</span> {user.role}</p>
        </div>

        <button className="profile-button">Editar Perfil</button>
      </div>
    </div>
  );
}