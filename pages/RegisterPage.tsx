import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Page, Role } from '../types';
import { api } from '../services/api';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const RegisterPage: React.FC = () => {
    const { setCurrentPage } = useAppContext();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [location, setLocation] = useState('');
    const [identityCard, setIdentityCard] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!identityCard) {
            setError('Silakan unggah foto KTP Anda.');
            return;
        }

        setLoading(true);
        
        try {
            const identityCardUrl = await fileToBase64(identityCard);
            
            await api.addUser({
                fullName,
                email,
                password,
                location,
                identityCardUrl,
                identityCardStatus: 'PENDING_VALIDATION',
                role: Role.CUSTOMER,
            });

            setMessage('Pendaftaran berhasil! Akun Anda sedang ditinjau. Silakan login setelah akun Anda disetujui.');
            
            setTimeout(() => {
                setCurrentPage(Page.LOGIN);
            }, 3000);

        } catch (err) {
            setError('Gagal mendaftar. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-lg bg-surface p-8 rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Daftar Akun Baru</h2>
                <form onSubmit={handleSubmit}>
                    {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{message}</p>}
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">Nama Lengkap</label>
                        <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">Lokasi (Kota/Kabupaten)</label>
                        <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identityCard">Upload Foto KTP</label>
                        <input id="identityCard" type="file" accept="image/*" onChange={(e) => setIdentityCard(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:bg-gray-50 file:text-gray-700 file:border-0 file:py-2 file:px-4" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-hover disabled:bg-gray-400">
                        {loading ? 'Mendaftar...' : 'Daftar'}
                    </button>
                </form>
                 <p className="text-center mt-4 text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <button onClick={() => setCurrentPage(Page.LOGIN)} className="text-primary hover:underline font-semibold">
                        Login di sini
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;