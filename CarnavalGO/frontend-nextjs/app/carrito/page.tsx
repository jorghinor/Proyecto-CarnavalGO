'use client';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function CarritoPage() {
  const { items, removeFromCart, clearCart, total } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // Enviar todo el carrito al backend para crear una ORDEN
      const response = await fetch('http://localhost:8000/api/ordenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            cantidad: item.cantidad
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la orden.');
      }

      const data = await response.json();

      // Limpiamos el carrito
      clearCart();

      // Redirigimos al checkout de la ORDEN
      router.push(`/checkout-orden/${data.orden_id}`);

    } catch (error: any) {
      console.error('Error en checkout:', error);
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Tu carrito está vacío</h1>
        <p className="text-slate-600 mb-8">Parece que aún no has elegido tu experiencia.</p>
        <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition">
          Explorar Lugares
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Carrito de Compras</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <ul className="divide-y divide-slate-200">
            {items.map((item) => (
              <li key={item.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center">
                  {item.imagen_url && (
                    <img src={`http://localhost:8000${item.imagen_url}`} alt={item.nombre} className="w-16 h-16 object-cover rounded-md mr-4" />
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{item.nombre}</h3>
                    <p className="text-slate-500">Cantidad: {item.cantidad}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-slate-900 mr-6">Bs. {item.precio * item.cantidad}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xl font-bold text-slate-900">Total</span>
            <span className="text-2xl font-black text-purple-600">Bs. {total}</span>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/" className="px-6 py-3 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition">
            Seguir Comprando
          </Link>
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="px-6 py-3 bg-purple-600 text-white rounded-md font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Procesando...' : 'Proceder al Pago'}
          </button>
        </div>
      </div>
    </div>
  );
}
