

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import CashierPOS from '../components/dashboards/CashierPOS';
import CustomerDashboard from '../components/dashboards/CustomerDashboard';
import ShippingDashboard from '../components/dashboards/ShippingDashboard';
import SupplierDashboard from '../components/dashboards/SupplierDashboard';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <div className="text-center py-10 text-red-500">Akses ditolak. Silakan login.</div>;
  }
  
  const renderDashboard = () => {
    switch(currentUser.role) {
      case Role.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case Role.ADMIN:
        return <AdminDashboard />;
      case Role.CASHIER:
        return <CashierPOS />;
      case Role.CUSTOMER:
        return <CustomerDashboard />;
      case Role.SHIPPING:
        return <ShippingDashboard />;
      case Role.SUPPLIER:
        return <SupplierDashboard />;
      default:
        return <div className="text-center py-10">Role tidak dikenali.</div>;
    }
  }

  return (
    <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Selamat datang, {currentUser.fullName}! Anda login sebagai {currentUser.role}.</p>
        <div className="bg-surface p-6 rounded-lg shadow-lg">
            {renderDashboard()}
        </div>
    </div>
  );
};

export default DashboardPage;