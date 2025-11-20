import React from 'react';
import SupplierProductManagement from './SupplierProductManagement';

const SupplierDashboard: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Dashboard Penjual</h2>
            <p className="mb-6 text-gray-600">Kelola produk yang Anda jual di platform Koperasi MASTER.</p>
            <SupplierProductManagement />
        </div>
    );
};

export default SupplierDashboard;
