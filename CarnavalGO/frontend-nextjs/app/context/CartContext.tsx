'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: number; // ID del lugar
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  // Guardar en localStorage y recalcular totales cada vez que cambian los items
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));

    const newTotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setTotal(newTotal);

    const newCount = items.reduce((sum, item) => sum + item.cantidad, 0);
    setItemCount(newCount);
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id);

      if (existingItem) {
        // Si ya existe, actualizamos la cantidad
        return prevItems.map((item) =>
          item.id === newItem.id
            ? { ...item, cantidad: item.cantidad + newItem.cantidad }
            : item
        );
      } else {
        // Si no existe, lo añadimos
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
