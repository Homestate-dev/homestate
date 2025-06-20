'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // ① Estados controlados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ② Manejar envío
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const VALID_EMAIL = 'homestate.dev@gmail.com';
    const VALID_PASS = 'eupbO78sem456PlErA20siblipl';

    if (email === VALID_EMAIL && password === VALID_PASS) {
      // ③ Redirigir si las credenciales son correctas
      router.push('/administracion');
    } else {
      // ④ Mostrar error
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 transition hover:shadow-2xl">
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/static/logo.png"
            alt="Logo"
            className="w-24 h-24 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Iniciar Sesión
        </h2>

        {/* ⑤ Formulario controlado */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="mt-1 relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ejemplo@correo.com"
                required
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">📧</span>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔒</span>
            </div>
          </div>

          {/* ⑥ Mensaje de error */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
