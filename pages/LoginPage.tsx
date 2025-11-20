import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { Page } from '../types';

const LoginPage: React.FC = () => {
  const { login, setCurrentPage, showToast } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(email, password);
      if (user) {
        login(user);
      } else {
        showToast('Email atau password salah.', 'error');
      }
    } catch (error) {
       showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-hover disabled:bg-gray-400"
          >
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>
         <p className="text-center mt-4 text-sm text-gray-600">
            Belum punya akun?{' '}
            <button onClick={() => setCurrentPage(Page.REGISTER)} className="text-primary hover:underline font-semibold">
                Daftar di sini
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;