import React, { useState, useEffect, useCallback } from 'react';
import { Supplier, User, Role } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const SupplierApproval: React.FC = () => {
    const [pendingSuppliers, setPendingSuppliers] = useState<Supplier[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useAppContext();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [allSuppliers, allUsers] = await Promise.all([api.fetchSuppliers(), api.fetchUsers()]);
            setPendingSuppliers(allSuppliers.filter(s => s.status === 'PENDING_APPROVAL'));
            setUsers(allUsers);
        } catch (error) {
            showToast('Gagal memuat data persetujuan supplier.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApproval = async (supplier: Supplier, isApproved: boolean) => {
        const userToUpdate = users.find(u => u.id === supplier.userId);
        if (!userToUpdate) {
            showToast('User tidak ditemukan untuk supplier ini.', 'error');
            return;
        }

        try {
            // 1. Update supplier status
            const updatedSupplier = { ...supplier, status: isApproved ? 'APPROVED' : 'REJECTED' } as Supplier;
            await api.updateSupplier(updatedSupplier);

            // 2. If approved, update user role
            if (isApproved) {
                const updatedUser = { ...userToUpdate, role: Role.SUPPLIER };
                await api.updateUser(updatedUser);
            }
            
            showToast(`Pendaftaran supplier ${isApproved ? 'disetujui' : 'ditolak'}.`, 'success');
            fetchData(); // Refresh list

        } catch (error) {
            showToast('Gagal memproses persetujuan.', 'error');
        }
    };

    const getUserName = (userId: number) => users.find(u => u.id === userId)?.fullName || 'N/A';

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Persetujuan Pendaftaran Supplier</h3>
            {loading ? <p>Memuat...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pengguna</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Usaha</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {pendingSuppliers.length > 0 ? pendingSuppliers.map(s => (
                                <tr key={s.id}>
                                    <td className="px-4 py-2">{getUserName(s.userId)}</td>
                                    <td className="px-4 py-2">{s.companyName}</td>
                                    <td className="px-4 py-2">{s.phoneNumber}</td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                        <button onClick={() => handleApproval(s, false)} className="bg-red-500 text-white px-3 py-1 text-xs rounded-md hover:bg-red-600">Tolak</button>
                                        <button onClick={() => handleApproval(s, true)} className="bg-green-500 text-white px-3 py-1 text-xs rounded-md hover:bg-green-600">Setujui</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">Tidak ada pendaftaran yang menunggu persetujuan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SupplierApproval;
