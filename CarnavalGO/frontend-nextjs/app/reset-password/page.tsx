'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    token: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (token && email) {
      setFormData(prev => ({ ...prev, token, email }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.email || 'Error al resetear la contraseña.');
      }

      setMessage(data.message + ' Serás redirigido al login.');
      setTimeout(() => router.push('/login'), 3000);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Nueva Contraseña</h2>

        {message && <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm">{message}</div>}
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={formData.token} />
          <input type="hidden" name="email" value={formData.email} />

          <div>
            <label className="block text-sm font-medium text-slate-700">Nueva Contraseña</label>
            <input name="password" type="password" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirmar Nueva Contraseña</label>
            <input name="password_confirmation" type="password" onChange={handleChange} className="mt-1 w-full px-4 py-2 border rounded-md" required />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-bold mt-4">
            Guardar Nueva Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
