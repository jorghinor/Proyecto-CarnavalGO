'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

export default function CompraExitosaPage() {
  const searchParams = useSearchParams();
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const reservaIdParam = searchParams.get('reserva_id');

  const [message, setMessage] = useState('Verificando tu pago...');
  const [reservaId, setReservaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { token, user, isLoading: authLoading } = useAuth(); // Obtener token
  const router = useRouter();

  useEffect(() => {
    // Esperar a que la autenticación cargue
    if (authLoading) return;

    if (!paymentIntentClientSecret) {
      setMessage('No se encontró el secreto del intento de pago.');
      setIsLoading(false);
      return;
    }

    if (!reservaIdParam) {
      setMessage('No se encontró el ID de la reserva.');
      setIsLoading(false);
      return;
    }

    // Si no hay token, no podemos confirmar (porque la ruta está protegida)
    // Podríamos redirigir al login, pero perderíamos el contexto del pago.
    // Lo ideal es mostrar un mensaje o intentar confirmar si el token existe.
    if (!token) {
        setMessage('Debes iniciar sesión para confirmar tu compra.');
        setIsLoading(false);
        return;
    }

    const verifyPayment = async () => {
      try {
        const paymentIntentId = paymentIntentClientSecret.split('_secret_')[0];

        const response = await fetch('http://localhost:8000/api/confirm-payment', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Enviar token
              'Accept': 'application/json'
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            reserva_id: reservaIdParam
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage('¡Tu compra ha sido exitosa!');
          setReservaId(data.reserva.id);
        } else {
          setMessage(`Error al confirmar el pago: ${data.error || 'Error desconocido'}`);
        }
      } catch (error) {
        setMessage('Ocurrió un error inesperado al verificar el pago.');
        console.error('Error verifying payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [paymentIntentClientSecret, reservaIdParam, token, authLoading]);

  const handleDownloadInvoice = () => {
    if (reservaId && token) {
      // Para descargar archivos protegidos, no podemos usar window.open directamente con headers.
      // Opción 1: Usar fetch para obtener el blob y descargarlo (más complejo).
      // Opción 2: Pasar el token en la URL (menos seguro, pero rápido).
      // Opción 3: Hacer que la ruta de descarga de factura sea pública pero con un token temporal (complejo).

      // Vamos a intentar la Opción 1: Fetch + Blob
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
    }
  };

  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Estado de la Compra</h1>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {message}
          </div>
        ) : (
          <>
            <p className={`text-lg mb-6 ${reservaId ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
            {reservaId && (
              <div className="mb-6">
                <p className="text-slate-700 font-medium">ID de Reserva: <span className="font-bold">{reservaId}</span></p>
                <button
                  onClick={handleDownloadInvoice}
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Descargar Factura (PDF)
                </button>
              </div>
            )}
            <Link href="/" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-md transition duration-300">
              Volver al Inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
