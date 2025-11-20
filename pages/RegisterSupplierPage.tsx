import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';
import { api } from '../services/api';

const RegisterSupplierPage: React.FC = () => {
    const { currentUser, setCurrentPage, showToast } = useAppContext();
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        phoneNumber: '',
        salesName: '', // This is the contact person
    });
    const [loading, setLoading] = useState(false);

    if (!currentUser) {
        setCurrentPage(Page.LOGIN);
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.addSupplier({
                ...formData,
                userId: currentUser.id
            });
            showToast('Pendaftaran berhasil! Aplikasi Anda akan ditinjau oleh Admin.', 'success');
            setTimeout(() => {
                setCurrentPage(Page.HOME);
            }, 3000);

        } catch (error) {
            showToast('Gagal mengirim pendaftaran. Coba lagi nanti.', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-lg bg-surface p-8 rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Daftar sebagai Penjual</h2>
                <p className="text-center text-gray-600 mb-6">Lengkapi informasi usaha Anda di bawah ini. Pendaftaran Anda akan ditinjau oleh Super Admin sebelum disetujui.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">Nama Usaha/Toko</label>
                        <input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleChange} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                     <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Alamat Lengkap Usaha</label>
                        <textarea id="address" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 bg-white border border-gray-300 rounded-md" required rows={3}></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">Nomor Telepon Aktif</label>
                        <input id="phoneNumber" name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salesName">Nama Kontak/Penanggung Jawab</label>
                        <input id="salesName" name="salesName" type="text" value={formData.salesName} onChange={handleChange} className="w-full p-3 bg-white border border-gray-300 rounded-md" required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-hover disabled:bg-gray-400">
                        {loading ? 'Mengirim...' : 'Kirim Pendaftaran'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterSupplierPage;
