'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutFormOrden from './CheckoutFormOrden';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe('pk_test_51SOSqcCMNCdZtjjcOSMiWSeTqBuYXVqaCsg2ASetuTWb1Yw7hSK9rd38oxcKRRC1qAQw0dtfsszD7yDkviOOAKLa00obY8jEsg');

export default function CheckoutOrdenPage({ params }: { params: { id: string } }) {
  const ordenId = params.id;
  const [clientSecret, setClientSecret] = useState('');
  const [orden, setOrden] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
        router.push('/login');
        return;
    }

    if (!ordenId) {
      setError('ID de orden no encontrado.');
      setIsLoading(false);
      return;
    }

    const fetchOrdenAndPaymentIntent = async () => {
      try {
        // 1. Obtener detalles de la orden
        const response = await fetch(`http://localhost:8000/api/ordenes/${ordenId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los detalles de la orden.');
        }
        const ordenData = await response.json();
        setOrden(ordenData.data);

        // 2. Crear PaymentIntent para la orden
        const paymentIntentResponse = await fetch(`http://localhost:8000/api/ordenes/${ordenId}/payment-intents`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
          },
          body: JSON.stringify({ orden_id: ordenId }),
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

    fetchOrdenAndPaymentIntent();
  }, [ordenId, token, user, authLoading, router]);

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

        {!isLoading && !error && orden && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido #{orden.id}</h2>

            <ul className="divide-y divide-slate-200 mb-4">
                {orden.detalles.map((detalle: any) => (
                    <li key={detalle.id} className="py-2 flex justify-between">
                        <div>
                            <span className="font-medium">{detalle.lugar.nombre}</span>
                            <span className="text-slate-500 text-sm ml-2">x{detalle.cantidad}</span>
                        </div>
                        <span>Bs. {detalle.subtotal}</span>
                    </li>
                ))}
            </ul>

            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-purple-600">${orden.monto_total}</span>
            </div>
          </div>
        )}

        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutFormOrden ordenId={ordenId} />
          </Elements>
        )}
      </div>
    </div>
  );
}
