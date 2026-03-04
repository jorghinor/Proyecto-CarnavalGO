import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // Importar CartProvider

export const metadata = {
  title: 'CarnavalGO',
  description: 'Plataforma digital del Carnaval de Oruro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen relative">
        <AuthProvider>
          <CartProvider> {/* Envolver con CartProvider */}
            {/* CAPA 1 (Fondo): Marca de Agua (Diablada) */}
            <div
              className="fixed inset-0 z-[-1] opacity-50 pointer-events-none mix-blend-multiply"
              style={{
                backgroundImage: 'url(/diablada.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>

            {/* CAPA 2 (Frente): Contenido de la página */}
            <div className="relative z-10">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
