import { useEffect, useState } from 'react';
import '../styles/users.css';
import { API_URL } from '../config';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Cajero';
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Usuario que se está editando o creando
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  //const [newUser, setNewUser] = useState<User>({ name: '', email: '', password: '', role: 'cajero' });
  type FormUser = Omit<User, 'role'> & { role: 'Admin' | 'Cajero' | '' };
  const [formUser, setFormUser] = useState<FormUser>({
    name: '',
    email: '',
    password: '',
    role:'',
  });
  
  // Fetch de usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem("token");
      console.log("Token usado:", token);
      if (!token) {
        setError('No se encontró token, inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/Usuario`, {
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` },
      });
      if (res.status === 403) {
        console.log("Token al abrir Users:", token);
        // Token inválido o expirado → cerrar sesión
        localStorage.removeItem("token");
        //window.location.href = "/login";
        return;
      }

      if (res.status === 401) {
        setError('No autorizado - el token es inválido o expiró.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Error al obtener usuarios');

      const data = await res.json();
      
      const normalized = data.map((u: any) => ({
        id: u.id,
        name: u.nombre,   // ← acá se corrige
        email: u.email,
        password: u.password,
        role: u.rol?.toLowerCase() || "cajero", // por si viene "Admin"
      }));
      setUsers(normalized);
    } catch (err) {
      setError('No se pudo cargar la lista de usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  // 🔹 Abrir modal para agregar usuario
  const openAddModal = () => {
    setSelectedUser(null); // No hay usuario seleccionado → modo agregar
    setFormUser({ name: '', email: '', password: '', role: '' });
    setShowModal(true);
  };
  const openEditModal = (user: User) => {
    setSelectedUser(user); // Guardamos usuario seleccionado → modo editar
    setFormUser({ 
      name: user.name, 
      email: user.email, 
      password: "", // contraseña no se muestra
      role: "", 
    });
    setShowModal(true);
  };
  const handleSaveUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert('No autorizado - inicia sesión nuevamente.');
      return;
    }
    if (!formUser.role || (formUser.role !== 'Admin' && formUser.role !== 'Cajero')) {
      alert('Debes seleccionar un rol: Admin o Cajero');
      return;
    }

    try {
      if (selectedUser) {
        // 🔹 Modo Editar
        const res = await fetch(`${API_URL}/api/Usuario/PutUsuario/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedUser.id,
            nombre: formUser.name,
            email: formUser.email,
            rol: formUser.role,
            ...(formUser.password ? { password: formUser.password } : {}), // solo si se cambió
          }),
        });

        if (!res.ok) throw new Error("Error al editar usuario");
        alert("Usuario actualizado correctamente");

      } else {
        // 🔹 Modo Agregar
        const res = await fetch(`${API_URL}/api/Usuario/createUser`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formUser),
        });

        if (!res.ok) throw new Error("Error al crear usuario");
        alert("Usuario creado correctamente");
      }

      setShowModal(false);
      fetchUsers(); // refresca la lista

    } catch (err) {
      console.error(err);
      alert('Error al guardar usuario');
    }
  };

  
  // 🔹 Eliminar usuario
const handleDeleteUser = async (id?: number) => {
  if (!id) return;
  const confirmDelete = confirm("¿Seguro que deseas eliminar este usuario?");
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No autorizado - inicia sesión nuevamente.");
      return;
    }

    const res = await fetch(`${API_URL}/api/Usuario/DeleteUsuario/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });

    if (!res.ok) throw new Error("Error al eliminar usuario");

    alert("Usuario eliminado correctamente");
    fetchUsers(); // refresca lista
  } catch (err) {
    console.error(err);
    alert("Error al eliminar usuario");
  }
};



  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Usuarios</h2>
        <button className="btn-add" onClick={openAddModal}>Agregar Usuario</button>
      </div>

      {loading && <p className="loading">Cargando usuarios...</p>}
      {error && <p className="error-msg">{error}</p>}

      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
              <span className={`user-role ${user.role}`}>{user.role}</span>
            </div>
            <div className="user-actions">
              <button className="btn-edit" onClick={() => openEditModal(user)}>Editar</button>
              <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedUser ? "Editar Usuario" : "Nuevo Usuario"}</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={formUser.name}
              onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              value={formUser.email}
              onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={selectedUser ? "Dejar vacío si no cambia" : "Contraseña"}
              style={{ flex: 0 }}
              value={formUser.password}
              onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginLeft: "8px" }}
             >
            {showPassword ? "🙈" : "👁️"}
            </button>
            <select
              value={formUser.role}
              onChange={(e) => setFormUser({ ...formUser, role: e.target.value as 'Admin' | 'Cajero' })}
            >
              <option value="" disabled>Selecciona un rol</option>
              <option value="Cajero">Cajero</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveUser}>Guardar</button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}