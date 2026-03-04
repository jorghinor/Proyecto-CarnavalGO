'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { useAuth } from '../../context/AuthContext'; // Importar useAuth
import { useRouter } from 'next/navigation';

// Reemplaza esto con tu clave pública de Stripe real
const stripePromise = loadStripe('pk_test_51SOSqcCMNCdZtjjcOSMiWSeTqBuYXVqaCsg2ASetuTWb1Yw7hSK9rd38oxcKRRC1qAQw0dtfsszD7yDkviOOAKLa00obY8jEsg');

export default function CheckoutPage({ params }: { params: { id: string } }) {
  const reservaId = params.id;
  const [clientSecret, setClientSecret] = useState('');
  const [reserva, setReserva] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token, user, isLoading: authLoading } = useAuth(); // Obtener token y estado de carga
  const router = useRouter();

  useEffect(() => {
    // Esperar a que la autenticación cargue
    if (authLoading) return;

    // Si no hay usuario o token, redirigir al login
    if (!user || !token) {
        router.push('/login');
        return;
    }

    if (!reservaId) {
      setError('ID de reserva no encontrado.');
      setIsLoading(false);
      return;
    }

    const fetchReservaAndPaymentIntent = async () => {
      try {
        // 1. Obtener detalles de la reserva desde el backend (CON TOKEN)
        const response = await fetch(`http://localhost:8000/api/reservas/${reservaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los detalles de la reserva.');
        }
        const reservaData = await response.json();
        setReserva(reservaData.data);

        // 2. Crear PaymentIntent en el backend (CON TOKEN)
        const paymentIntentResponse = await fetch('http://localhost:8000/api/payment-intents', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
          },
          body: JSON.stringify({ reserva_id: reservaId }),
        });

        if (!paymentIntentResponse.ok) {
          const errorData = await paymentIntentResponse.json();
          throw new Error(errorData.error || 'Error al crear el Payment Intent.');
        }

        const paymentIntentData = await paymentIntentResponse.json();
        setClientSecret(paymentIntentData.clientSecret);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservaAndPaymentIntent();
  }, [reservaId, token, user, authLoading, router]);

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = clientSecret ? {
    clientSecret,
    appearance,
  } : {};

  if (authLoading) {
      return <div className="min-h-screen flex items-center justify-center">Cargando autenticación...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-slate-900 mb-8">Finalizar Compra</h1>

        {isLoading && <div className="text-center text-purple-600">Cargando detalles del pago...</div>}
        {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md mb-4">Error: {error}</div>}

        {!isLoading && !error && reserva && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">Reserva #{reserva.id}</h2>
            {reserva.lugar && (
                <>
                    <p className="text-lg font-bold text-slate-800">{reserva.lugar.nombre}</p>
                    <p className="text-slate-600 mb-4">{reserva.lugar.ubicacion}</p>
                </>
            )}
            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-purple-600">${reserva.monto_total}</span>
            </div>
          </div>
        )}

        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm reservaId={reservaId} />
          </Elements>
        )}
      </div>
    </div>
  );
}
