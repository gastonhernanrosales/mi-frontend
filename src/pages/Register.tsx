import React, { useState } from 'react';

type User = {
  name: string;
  role: string;
};

type RegisterProps = {
  setUser: (user: User) => void;
};

export default function Register({ setUser }: RegisterProps) {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'cajero' | 'admin'>('cajero');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Llamar a tu API register aquí
    // Simulamos registro:
    setUser({ name, role });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Register</h2>
        <input
          type="text"
          placeholder="Nombre"
          className="w-full p-3 mb-4 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'cajero' | 'admin')}
          className="w-full p-3 mb-4 border rounded"
        >
          <option value="cajero">Cajero</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-bold">
          Registrarse
        </button>
      </form>
    </div>
  );
}
