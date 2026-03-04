'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Reserva {
  id: number;
  lugar: {
    nombre: string;
    ubicacion: string;
  };
  fecha_reserva: string;
  cantidad_entradas: number;
  monto_total: number;
  estado_pago: string;
  created_at: string;
}

export default function PerfilPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchReservas = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/mis-reservas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReservas(data.data);
        }
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [user, token, authLoading, router]);

  const handleDownloadInvoice = (reservaId: number) => {
    fetch(`http://localhost:8000/api/reservas/${reservaId}/invoice`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al descargar');
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_reserva_${reservaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(err => alert('Error al descargar la factura'));
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800 font-medium">
            &larr; Volver al Inicio
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-medium text-slate-900">Información Personal</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Nombre</p>
              <p className="text-lg font-medium text-slate-900">{user?.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-lg font-medium text-slate-900">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-medium text-slate-900">Historial de Reservas</h2>
          </div>

          {reservas.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No tienes reservas registradas aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Lugar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{reserva.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{reserva.lugar.nombre}</div>
                        <div className="text-sm text-slate-500">{reserva.lugar.ubicacion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(reserva.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        Bs. {reserva.monto_total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reserva.estado_pago === 'pagado' ? 'bg-green-100 text-green-800' :
                          reserva.estado_pago === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reserva.estado_pago.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {reserva.estado_pago === 'pagado' ? (
                          <button
                            onClick={() => handleDownloadInvoice(reserva.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Descargar Factura
                          </button>
                        ) : (
                          <Link href={`/checkout/${reserva.id}`} className="text-purple-600 hover:text-purple-900">
                            Pagar Ahora
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
