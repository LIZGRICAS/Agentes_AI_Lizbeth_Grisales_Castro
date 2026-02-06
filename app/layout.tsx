import React from 'react';
import './globals.css';
import Link from 'next/link';
import Providers from '../components/Providers';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <nav className="bg-brand-navy border-b border-white/10 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 md:h-20 items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-1.5">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-brand-rose" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                </svg>
                <span className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  Agentes<span className="text-brand-rose">AI</span>
                </span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden sm:block h-8 w-[1px] bg-white/10 mx-2"></div>
              <button className="border border-brand-orange text-brand-orange px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold hover:bg-brand-orange hover:text-white transition-all whitespace-nowrap">
                Login <span className="hidden xs:inline">Clientes</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pb-10 md:pb-20">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-1.5 opacity-50 grayscale">
            <span className="text-xl font-bold text-gray-900 tracking-tight">LizCreative</span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            © 2024 Lizbeth Grisales Castro - Arquitecta de sueños digitales.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100"></div>
            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Next.js App Router requiere una exportación por defecto `RootLayout` en `app/layout.tsx`.
// Añadimos un wrapper que reutiliza el componente `Layout` existente sin modificar su lógica.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}