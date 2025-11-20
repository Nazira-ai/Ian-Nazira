import React, { useState } from 'react';
import { Role } from '../../types';
import UserManagement from './UserManagement';
import ProductStockManagement from './ProductStockManagement';
import { useAppContext } from '../../context/AppContext';
import LowStockNotification from './LowStockNotification';
import SalesReport from './reports/SalesReport';
import InventoryReport from './reports/InventoryReport';
import PurchasingManagement from './PurchasingManagement';
import ShippingManagement from './ShippingManagement';
import UnitManagement from './UnitManagement';

type AdminTab = 'users' | 'products' | 'units' | 'purchasing' | 'shipping' | 'reports';
type ReportTab = 'sales' | 'inventory';


const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('sales');
  const { currentUser } = useAppContext();

  // Admin can manage Cashiers and Customers.
  const managedRoles = [Role.CASHIER, Role.CUSTOMER, Role.SHIPPING];

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'users':
        return <UserManagement managedRoles={managedRoles} />;
      case 'products':
        return <ProductStockManagement userRole={currentUser.role} />;
      case 'units':
        return <UnitManagement />;
      case 'purchasing':
        return <PurchasingManagement setActiveTab={setActiveTab as any} />;
      case 'shipping':
        return <ShippingManagement />;
      case 'reports':
        return (
          <div>
            <div className="flex border-b border-gray-200 mb-4">
              <button onClick={() => setActiveReportTab('sales')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'sales' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Laporan Penjualan
              </button>
              <button onClick={() => setActiveReportTab('inventory')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Laporan Stok Barang
              </button>
            </div>
            <div>
              {activeReportTab === 'sales' && <SalesReport />}
              {activeReportTab === 'inventory' && <InventoryReport />}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTabClass = (tabName: AdminTab) => {
    return `px-4 py-2 font-semibold rounded-t-lg cursor-pointer ${
      activeTab === tabName
        ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-4">Dashboard Admin</h2>
      <p className="mb-6 text-gray-600">Anda memiliki akses untuk mengelola pengguna dan produk.</p>
      <LowStockNotification onGoToProducts={() => setActiveTab('products')} />
       <div className="flex border-b border-gray-300 mb-4 flex-wrap">
        <div onClick={() => setActiveTab('users')} className={getTabClass('users')}>
          Pengguna
        </div>
        <div onClick={() => setActiveTab('products')} className={getTabClass('products')}>
          Stok Produk
        </div>
        <div onClick={() => setActiveTab('units')} className={getTabClass('units')}>
          Satuan
        </div>
        <div onClick={() => setActiveTab('purchasing')} className={getTabClass('purchasing')}>
          Pembelian Barang
        </div>
        <div onClick={() => setActiveTab('shipping')} className={getTabClass('shipping')}>
          Pengiriman
        </div>
         <div onClick={() => setActiveTab('reports')} className={getTabClass('reports')}>
          Laporan
        </div>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
