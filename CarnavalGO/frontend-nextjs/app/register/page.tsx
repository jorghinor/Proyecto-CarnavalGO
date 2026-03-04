'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    password_confirmation: '',
    ci_dni: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Importante para evitar redirecciones de Laravel
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }

      login(data.access_token, data.cliente);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900/50 backdrop-blur-sm py-12">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Crear Cuenta</h2>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
            <input name="nombre" type="text" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CI / DNI</label>
            <input name="ci_dni" type="text" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Teléfono</label>
            <input name="telefono" type="text" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input name="password" type="password" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirmar Contraseña</label>
            <input name="password_confirmation" type="password" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-bold mt-4">
            Registrarse
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <Link href="/login" className="text-purple-600 hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
