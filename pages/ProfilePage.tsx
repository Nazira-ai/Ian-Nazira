import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../services/api';
import { DigitalWalletProvider, Role, User } from '../types';
import { CheckIcon } from '../components/Icons';

const RolePermissions: React.FC<{ role: Role }> = ({ role }) => {
    const permissions = {
        [Role.SUPER_ADMIN]: [
            'Mengelola semua akun pengguna (Admin, Kasir, Pelanggan)',
            'Mengelola semua produk (menambah, mengubah, menghapus)',
            'Mengakses dan mengubah semua pengaturan situs (logo, pembayaran, dll)',
            'Melihat semua laporan dan analitik',
        ],
        [Role.ADMIN]: [
            'Mengelola akun pengguna Kasir dan Pelanggan',
            'Mengelola produk dan stok (menambah, mengubah)',
            'Melihat laporan penjualan',
        ],
        [Role.CASHIER]: [
            'Mengakses sistem Point of Sale (POS) untuk transaksi offline',
            'Melihat daftar produk dan harga',
            'Mencatat transaksi penjualan tunai dan non-tunai',
        ],
        [Role.CUSTOMER]: [
            'Melihat dan membeli produk secara online',
            'Mengelola keranjang belanja dan proses checkout',
            'Melihat riwayat pesanan pribadi',
            'Mengubah informasi profil pribadi',
        ],
        [Role.SUPPLIER]: [
            'Mengelola produk yang Anda jual (menambah, mengubah)',
            'Melihat riwayat penjualan produk Anda',
            'Mengubah informasi profil supplier Anda',
        ],
    };

    const rolePermissions = permissions[role] || [];
    const roleDescription = {
        [Role.SUPER_ADMIN]: 'Anda memiliki kontrol penuh atas seluruh sistem, termasuk pengguna, produk, dan pengaturan.',
        [Role.ADMIN]: 'Anda dapat mengelola operasional harian, termasuk pengguna di bawah Anda dan inventaris produk.',
        [Role.CASHIER]: 'Anda memiliki akses ke sistem kasir untuk melayani transaksi di toko fisik.',
        [Role.CUSTOMER]: 'Anda dapat berbelanja produk, melihat pesanan, dan mengelola informasi akun Anda.',
        [Role.SUPPLIER]: 'Anda dapat menjual produk Anda melalui platform kami dan mengelola inventaris Anda sendiri.',
    }

    return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-bold text-primary mb-2">Peran Anda: {role}</h3>
            <p className="text-gray-600 mb-4">{roleDescription[role]}</p>
            <h4 className="font-semibold text-gray-800 mb-3">Hak Akses Anda Termasuk:</h4>
            <ul className="space-y-2">
                {rolePermissions.map((permission, index) => (
                    <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{permission}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const KTPStatusBadge: React.FC<{ status: User['identityCardStatus'] }> = ({ status }) => {
    const statusInfo = {
        'NOT_UPLOADED': { text: 'Belum Diunggah', color: 'bg-red-100 text-red-800' },
        'PENDING_VALIDATION': { text: 'Menunggu Validasi', color: 'bg-yellow-100 text-yellow-800' },
        'VALIDATED': { text: 'Tervalidasi', color: 'bg-green-100 text-green-800' },
    };
    const currentStatus = status && statusInfo[status] ? statusInfo[status] : statusInfo['NOT_UPLOADED'];
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>;
}

const ProfilePage: React.FC = () => {
    const { currentUser, updateCurrentUser, showToast, enabledDigitalWallets } = useAppContext();
    const [formData, setFormData] = useState({
        fullName: '',
        location: '',
        password: '',
        confirmPassword: '',
    });
    const [walletProvider, setWalletProvider] = useState<DigitalWalletProvider | ''>('');
    const [walletBalance, setWalletBalance] = useState<number | string>('');

    const [identityCardFile, setIdentityCardFile] = useState<File | null>(null);
    const [identityCardPreview, setIdentityCardPreview] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                fullName: currentUser.fullName,
                location: currentUser.location || '',
                password: '',
                confirmPassword: '',
            });
            setIdentityCardPreview(currentUser.identityCardUrl);
            setWalletProvider(currentUser.digitalWalletProvider || '');
            setWalletBalance(currentUser.digitalWalletBalance !== undefined ? currentUser.digitalWalletBalance : '');
        }
    }, [currentUser]);

    if (!currentUser) {
        return <div className="text-center py-10">Silakan login untuk melihat profil Anda.</div>;
    }
    
    const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIdentityCardFile(file);
            const previewUrl = URL.createObjectURL(file);
            setIdentityCardPreview(previewUrl);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            showToast('Konfirmasi password tidak cocok.', 'error');
            return;
        }

        setLoading(true);
        try {
            let identityCardUpdate: Partial<User> = {};
            if (identityCardFile) {
                const base64Url = await fileToBase64(identityCardFile);
                identityCardUpdate = {
                    identityCardUrl: base64Url,
                    identityCardStatus: 'PENDING_VALIDATION'
                };
            }

            const updatedUserData: User = {
                ...currentUser,
                fullName: formData.fullName,
                location: formData.location,
                digitalWalletProvider: walletProvider as DigitalWalletProvider || undefined,
                digitalWalletBalance: walletBalance !== '' ? Number(walletBalance) : undefined,
                ...(formData.password && { password: formData.password }),
                ...identityCardUpdate
            };
            
            const updatedUser = await api.updateUser(updatedUserData);
            updateCurrentUser(updatedUser);
            
            showToast('Profil berhasil diperbarui!', 'success');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setIdentityCardFile(null);

        } catch (err) {
            showToast('Gagal memperbarui profil. Silakan coba lagi.', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const isPendingValidation = currentUser.identityCardStatus === 'PENDING_VALIDATION';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-primary">Profil Saya</h1>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface p-6 rounded-lg shadow-lg border space-y-4">
                    <h2 className="text-2xl font-semibold mb-2">Informasi Akun</h2>
                    
                    <input id="email" type="email" value={currentUser.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm cursor-not-allowed" />
                    <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                    {currentUser.role === Role.CUSTOMER && <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>}

                    {currentUser.role === Role.CUSTOMER && (
                         <div className="pt-4 border-t">
                             <div className="flex justify-between items-center mb-2">
                                 <label className="block text-sm font-medium text-gray-700">Kartu Tanda Penduduk (KTP)</label>
                                 <KTPStatusBadge status={currentUser.identityCardStatus} />
                             </div>
                             {identityCardPreview && <img src={identityCardPreview} alt="Pratinjau KTP" className="w-full h-auto rounded-md border mb-2"/>}
                             <input id="identityCardUrl" type="file" accept="image/*" onChange={handleIdCardChange} disabled={isPendingValidation} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:bg-gray-50 file:text-gray-700 file:border-0 file:py-2 file:px-4 disabled:bg-gray-200 disabled:cursor-not-allowed" />
                             {isPendingValidation && <p className="text-xs text-yellow-600 mt-1">KTP Anda sedang dalam proses validasi oleh admin. Anda tidak dapat mengubahnya saat ini.</p>}
                         </div>
                    )}

                    <div className="pt-4 border-t">
                         <p className="text-sm font-medium text-gray-700 mb-2">Ubah Password (opsional)</p>
                         <input id="password" name="password" placeholder="Password Baru" type="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                         <input id="confirmPassword" name="confirmPassword" placeholder="Konfirmasi Password Baru" type="password" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
                
                <div className="space-y-8">
                    <RolePermissions role={currentUser.role} />
                    
                    {currentUser.role === Role.CUSTOMER && (
                        <div className="bg-surface p-6 rounded-lg shadow-lg border">
                            <h2 className="text-2xl font-semibold mb-4">Konfigurasi Dompet Digital</h2>
                            <p className="text-sm text-gray-600 mb-4">Hubungkan dompet digital Anda untuk pembayaran yang lebih cepat. Saldo di sini hanya untuk simulasi dan harus diisi manual.</p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="walletProvider" className="block text-sm font-medium text-gray-700">Penyedia Dompet Digital</label>
                                    <select id="walletProvider" value={walletProvider} onChange={(e) => setWalletProvider(e.target.value as DigitalWalletProvider)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                                        <option value="">--Pilih Penyedia--</option>
                                        {enabledDigitalWallets.map(wallet => <option key={wallet} value={wallet}>{wallet}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-700">Saldo (Rp)</label>
                                    <input type="number" id="walletBalance" value={walletBalance} onChange={(e) => setWalletBalance(e.target.value)} placeholder="Contoh: 50000" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 text-right">
                    <button type="submit" disabled={loading} className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-hover disabled:bg-gray-400">
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;