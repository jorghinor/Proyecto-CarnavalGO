'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { useCart, CartItem } from './context/CartContext'; // Importar useCart y CartItem
import Link from 'next/link';

// --- Interfaces ---
interface Lugar {
  id: number;
  nombre: string;
  ubicacion: string;
  precio: number;
  imagen_url: string | null;
  estado: 'disponible' | 'ocupado' | 'mantenimiento';
}

interface Danza {
  id: number;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
}

interface Video {
  id: number;
  titulo: string;
  descripcion: string;
  url_video: string;
  miniatura_url: string | null;
}

const ITEMS_PER_PAGE = 9;

// --- Componente de Paginación Reutilizable ---
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-slate-800 text-white px-4 py-2 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <span className="text-slate-700 font-medium">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-slate-800 text-white px-4 py-2 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
};

// --- Componente para el Header de Autenticación y Carrito ---
const AuthNav = () => {
  const { user, logout, isLoading } = useAuth();
  const { itemCount } = useCart(); // Obtener cantidad de items del carrito
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || isLoading) {
    return null;
  }

  return (
    <>
      {/* Enlace al Carrito */}
      <Link href="/carrito" className="relative mr-4 text-slate-700 hover:text-purple-600 transition">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>

      {user ? (
        <div className="flex items-center gap-4 ml-4 border-l pl-4 border-slate-300">
          <Link href="/perfil" className="text-slate-700 font-bold hover:text-purple-600 transition">
            Hola, {user.nombre}
          </Link>
          <button
            onClick={logout}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <Link href="/login" className="ml-4 text-purple-600 hover:text-purple-800 font-bold transition">
          Iniciar Sesión
        </Link>
      )}
    </>
  );
};

// --- Componente para el Streaming en Vivo ---
const LiveStreamPlayer = ({ videoUrl }: { videoUrl: string }) => {
  // Función simple para extraer ID de YouTube
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  if (!videoId) return null;

  return (
    <section className="py-12 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6 animate-pulse">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            EN VIVO
          </span>
          <h2 className="text-2xl md:text-3xl font-bold">Transmisión Oficial del Carnaval</h2>
        </div>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-800">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};


export default function Home() {
  // --- Hooks ---
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart(); // Hook del carrito

  // --- Estados Generales ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<Lugar | Danza | null>(null);

  // --- Estados para Lugares ---
  const [allLugares, setAllLugares] = useState<Lugar[]>([]);
  const [lugaresCurrentPage, setLugaresCurrentPage] = useState(1);

  // --- Estados para Danzas ---
  const [allDanzas, setAllDanzas] = useState<Danza[]>([]);
  const [danzasCurrentPage, setDanzasCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Estados para Videos ---
  const [videos, setVideos] = useState<Video[]>([]);
  const [liveVideo, setLiveVideo] = useState<Video | null>(null); // Estado para el video en vivo

  // --- Efecto para Cargar Datos ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [lugaresRes, danzasRes, videosRes] = await Promise.all([
          fetch(`http://localhost:8000/api/lugares`),
          fetch(`http://localhost:8000/api/danzas?search=${searchTerm}`),
          fetch(`http://localhost:8000/api/videos`)
        ]);

        if (!lugaresRes.ok || !danzasRes.ok || !videosRes.ok) {
          throw new Error('Error al obtener los datos del servidor.');
        }

        const lugaresData = await lugaresRes.json();
        const danzasData = await danzasRes.json();

        let videosData = { data: [] };
        try {
          const videosRes = await fetch(`http://localhost:8000/api/videos`);
          if (videosRes.ok) {
            videosData = await videosRes.json();
          }
        } catch (videoError) {
          console.error("Error fetching videos API:", videoError);
        }

        setAllLugares(lugaresData.data);
        setAllDanzas(danzasData.data);
        setVideos(videosData.data);

        // Buscar video en vivo (que contenga "VIVO" o "LIVE" en el título)
        const foundLive = videosData.data.find((v: Video) =>
          v.titulo.toUpperCase().includes('VIVO') || v.titulo.toUpperCase().includes('LIVE')
        );
        setLiveVideo(foundLive || null);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(debounceFetch);
    };
  }, [searchTerm]);

  // --- Lógica de Paginación ---
  const paginatedLugares = allLugares.slice((lugaresCurrentPage - 1) * ITEMS_PER_PAGE, lugaresCurrentPage * ITEMS_PER_PAGE);
  const totalLugaresPages = Math.ceil(allLugares.length / ITEMS_PER_PAGE);

  const paginatedDanzas = allDanzas.slice((danzasCurrentPage - 1) * ITEMS_PER_PAGE, danzasCurrentPage * ITEMS_PER_PAGE);
  const totalDanzasPages = Math.ceil(allDanzas.length / ITEMS_PER_PAGE);

  // --- Lógica de Añadir al Carrito ---
  const handleAddToCart = (lugar: Lugar) => {
    const item: CartItem = {
      id: lugar.id,
      nombre: lugar.nombre,
      precio: lugar.precio,
      cantidad: 1, // Por defecto 1
      imagen_url: lugar.imagen_url
    };

    addToCart(item);
    setModalContent(null); // Cerrar modal
    // Opcional: Mostrar notificación de éxito
    alert('¡Lugar añadido al carrito!');
  };


  return (
    <>
      <main className="min-h-screen font-sans text-slate-900">

        {/* HEADER / NAVBAR */}
        <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                CarnavalGO
              </span>
            </div>
            <nav className="hidden md:flex gap-8 font-medium text-sm items-center">
              <a href="#inicio" className="hover:text-purple-600 transition">Inicio</a>
              <a href="#paquetes" className="hover:text-purple-600 transition">Paquetes</a>
              <a href="#danzas" className="hover:text-purple-600 transition">Danzas</a>
              <a href="#videos" className="hover:text-purple-600 transition">Videos</a>
              <a href="#contacto" className="hover:text-purple-600 transition">Contacto</a>
              <AuthNav /> {/* Componente de Navegación de Auth y Carrito */}
            </nav>

            {!user && (
              <a href="#paquetes" className="hidden lg:block bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-bold text-sm transition shadow-lg hover:shadow-purple-500/30 ml-4">
                Comprar Entradas
              </a>
            )}
          </div>
        </header>

        {/* HERO SECTION */}
        <section id="inicio" className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10" />
            <img
              src="/diablada.jpeg"
              alt="Diablada de Oruro"
              className="w-full h-full object-cover transition-transform duration-700 animate-slow-zoom"
            />
          </div>
          <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight drop-shadow-2xl animate-fade-in-up"
            >
              <span style={{ textShadow: '0 0 15px rgba(50, 255, 50, 0.7), 0 0 25px rgba(50, 255, 50, 0.5)' }}>
                VIVE LA
              </span>
              <br/>
              <span className="text-red-500" style={{ textShadow: '0 0 15px rgba(239, 68, 68, 0.7)' }}>MAGIA</span>{' '}
              <span className="text-yellow-400" style={{ textShadow: '0 0 15px rgba(250, 204, 21, 0.7)' }}>DE</span>{' '}
              <span className="text-green-500" style={{ textShadow: '0 0 15px rgba(34, 197, 94, 0.7)' }}>ORURO</span>
            </h1>
          </div>
        </section>

        {/* LIVE STREAM SECTION (Solo visible si hay un video en vivo) */}
        {liveVideo && (
          <LiveStreamPlayer videoUrl={liveVideo.url_video} />
        )}

        {/* PAQUETES SECTION */}
        <section id="paquetes" className="py-24 px-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-purple-600 font-bold tracking-wider uppercase text-sm mb-2">Tu lugar ideal</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style={{ textShadow: '0 0 15px rgba(251, 146, 60, 0.7), 0 0 25px rgba(251, 146, 60, 0.5)' }}>Elige tu Experiencia</h3>
            </div>

            {isLoading && <div className="text-center text-purple-600">Cargando...</div>}
            {error && <div className="text-center text-red-600">Error: {error}</div>}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedLugares.map((lugar) => (
                    <div
                      key={lugar.id}
                      onClick={() => setModalContent(lugar)}
                      className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 cursor-pointer relative"
                      style={{
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), -5px 0 15px -3px rgba(255,0,0,0.3), 5px 0 15px -3px rgba(0,255,0,0.3), 0 -5px 15px -3px rgba(255,255,0,0.3)'
                      }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${lugar.estado === 'disponible' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {lugar.estado}
                        </div>
                        <img
                          src={lugar.imagen_url ? `http://localhost:8000${lugar.imagen_url}` : 'https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen'}
                          alt={lugar.nombre}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{lugar.nombre}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-purple-600">${lugar.precio}</span>
                          <span className="text-slate-500 text-sm">/ persona</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={lugaresCurrentPage} totalPages={totalLugaresPages} onPageChange={setLugaresCurrentPage} />
              </>
            )}
          </div>
        </section>

        {/* DANZAS SECTION */}
        <section id="danzas" className="py-24 px-4 bg-slate-100/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-purple-600 font-bold tracking-wider uppercase text-sm mb-2">Cultura Viva</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style={{ textShadow: '0 0 15px rgba(251, 146, 60, 0.7), 0 0 25px rgba(251, 146, 60, 0.5)' }}>Explora Nuestras Danzas</h3>
              <div className="mt-4 max-w-md mx-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar danza (ej: Diablada, Morenada...)"
                  className="w-full py-3 px-5 bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                />
              </div>
            </div>

            {isLoading && <div className="text-center text-purple-600">Cargando...</div>}
            {error && <div className="text-center text-red-600">Error: {error}</div>}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedDanzas.map((danza) => (
                    <div
                      key={danza.id}
                      onClick={() => setModalContent(danza)}
                      className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 cursor-pointer relative"
                      style={{
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05), -5px 0 15px -3px rgba(255,0,0,0.3), 5px 0 15px -3px rgba(0,255,0,0.3), 0 -5px 15px -3px rgba(255,255,0,0.3)'
                      }}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={danza.imagen_url ? `http://localhost:8000${danza.imagen_url}` : 'https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen'}
                          alt={danza.nombre}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <h2 className="text-2xl font-bold mb-2">{danza.nombre}</h2>
                        <p className="text-slate-600 text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: danza.descripcion }}></p>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={danzasCurrentPage} totalPages={totalDanzasPages} onPageChange={setDanzasCurrentPage} />
              </>
            )}
          </div>
        </section>

        {/* VIDEOS SECTION */}
        <section id="videos" className="py-24 px-4 bg-slate-900/90 text-white backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-purple-400 font-bold tracking-wider uppercase text-sm mb-2">Revive la Magia</h2>
              <h3 className="text-4xl md:text-5xl font-bold mb-4" style={{ textShadow: '0 0 15px rgba(251, 146, 60, 0.7), 0 0 25px rgba(251, 146, 60, 0.5)' }}>Videoteca del Carnaval</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <a key={video.id} href={video.url_video} target="_blank" rel="noopener noreferrer" className="group block bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-56">
                    <img
                      src={video.miniatura_url ? `http://localhost:8000${video.miniatura_url}` : 'https://placehold.co/600x400/EEE/31343C?text=Sin+Miniatura'}
                      alt={video.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{video.titulo}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTO & QR SECTION */}
        <section id="contacto" className="py-24 px-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-2xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

            <div className="p-12 md:p-16 text-center relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ textShadow: '0 0 15px rgba(251, 146, 60, 0.7), 0 0 25px rgba(251, 146, 60, 0.5)' }}>¿Listo para asegurar tu lugar?</h2>
              <p className="text-purple-200 mb-10 max-w-xl mx-auto">
                Realiza tu reserva ahora mismo escaneando el código QR o contactándonos directamente por WhatsApp.
              </p>

              <div className="bg-white p-6 rounded-2xl inline-block shadow-xl mb-8 transform hover:scale-105 transition duration-300">
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300">
                  <span className="text-slate-400 font-medium">QR de Pago</span>
                </div>
                <p className="text-slate-900 font-bold mt-4">Escanea para Pagar</p>
              </div>

              <div>
                <a
                  href="https://wa.me/59112345678?text=Hola,%20estoy%20interesado%20en%20reservar%20entradas%20para%20el%20Carnaval%20de%20Oruro%202026."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full transition shadow-lg hover:shadow-green-500/30"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-.967-.272-.297-.471-.446-.646-.446-.175 0-.446.074-.694.347-.248.272-.942.918-.942 2.231 0 1.313.967 2.581 1.116 2.78.149.198 1.905 2.904 4.617 4.072 2.713 1.169 2.713.779 3.208.73.495-.05 1.586-.649 1.809-1.275.223-.627.223-1.165.149-1.29-.074-.124-.272-.198-.57-.347m-5.421 7.403l-.008.004zm4.944-10.299l-.003.001z"/></svg>
                  Contactar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-950/90 text-slate-400 py-12 border-t border-slate-900 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">CarnavalGO</h3>
              <p className="text-sm">Plataforma Oficial de Reservas</p>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition">Términos y Condiciones</a>
              <a href="#" className="hover:text-white transition">Política de Privacidad</a>
              <a href="#" className="hover:text-white transition">Soporte</a>
            </div>
            <div className="text-sm">
              © 2026 CarnavalGO. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </main>

      {/* MODAL */}
      <Transition appear show={modalContent !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setModalContent(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {modalContent && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold leading-6 text-gray-900"
                      >
                        {modalContent.nombre}
                      </Dialog.Title>
                      <div className="mt-4">
                        <img
                          src={modalContent.imagen_url ? `http://localhost:8000${modalContent.imagen_url}` : 'https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen'}
                          alt={modalContent.nombre}
                          className="w-full h-64 object-cover rounded-md"
                        />
                        <div className="mt-4 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: (modalContent as Danza).descripcion || '' }}></div>
                        {'precio' in modalContent && (
                          <div className="mt-4">
                            <p className="text-lg font-bold">Precio: <span className="text-purple-600">${(modalContent as Lugar).precio}</span></p>
                            <p className="text-sm">Ubicación: {(modalContent as Lugar).ubicacion}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
                          onClick={() => setModalContent(null)}
                        >
                          Cerrar
                        </button>
                        {'precio' in modalContent && (
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                            onClick={() => handleAddToCart(modalContent as Lugar)}
                          >
                            Añadir al Carrito
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
