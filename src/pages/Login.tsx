import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { User as UserType } from '../type';
import '../styles/App.css';
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config';

interface LoginProps {
  setUser: (user: UserType) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'admin' | 'cajero'>('admin');
  const [showIntro, setShowIntro] = useState(false);
  const navigate = useNavigate();
  // 🔹 LOGIN FUNCTION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Usuario: email,  // ✅ Debe coincidir con el DTO del backend
          Password: password
        }),
      });

      if (!response.ok) {
        alert("Email o contraseña incorrectos");
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // 🔹 Guardar sesión en localStorage
      localStorage.setItem("userId", data.id.toString());
      localStorage.setItem("userName", data.nombre); // 👈 importante
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.usuario);
      localStorage.setItem("userRole", data.rol.toLowerCase());
     
      
      // 🔹 Crear objeto de usuario
      const loggedUser = {
        id: data.id,
        name: data.nombre,
        role: data.rol.toLowerCase(), // "admin" o "cajero"
        email: data.usuario,
      };

      setUser(loggedUser);
      setShowIntro(true);
      
      localStorage.setItem(
  "redirectRole",
  data.rol.toLowerCase()
);

setShowIntro(true);

    } catch (error) {
      console.error("Error de login:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    {showIntro ? (

      <div className="startup-intro">

        <video
  autoPlay
  playsInline
  className="startup-video"
  onEnded={() => {

    const role =
      localStorage.getItem("redirectRole");

    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/cajero");
    }

  }}
>
  <source src="/startup.mp4" type="video/mp4" />
</video>

      </div>

    ) : (

      <div className="login-page">

        <video
          autoPlay
          loop
          muted
          playsInline
          className="login-video"
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>

        <div className="login-card">

          <h2>Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <Mail className="icon" />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <Lock className="icon" />

              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <div className="input-group">
              <User className="icon" />

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as 'admin' | 'cajero')
                }
              >
                <option value="admin">
                  Administrador
                </option>

                <option value="cajero">
                  Cajero
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Entrar"}
            </button>

          </form>

        </div>

      </div>

    )}
  </>
);}