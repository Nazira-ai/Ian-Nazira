import React, { useState } from 'react';
import { Role } from '../../types';
import UserManagement from './UserManagement';
import ProductStockManagement from './ProductStockManagement';
import { useAppContext } from '../../context/AppContext';
import SiteSettings from './SiteSettings';
import AboutPageEditor from './AboutPageEditor';
import ApplicationUpdate from './ApplicationUpdate';
import InstallationPage from '../../pages/InstallationPage';
import CategoryManagement from './CategoryManagement';
import SupplierManagement from './SupplierManagement';
import SalesReport from './reports/SalesReport';
import InventoryReport from './reports/InventoryReport';
import PurchaseReport from './reports/PurchaseReport';
import FinancialReport from './reports/FinancialReport';
import ProfitLossReport from './reports/ProfitLossReport';
import PurchasingManagement from './PurchasingManagement';
import ShippingManagement from './ShippingManagement';
import UnitManagement from './UnitManagement';
import SupplierApproval from './SupplierApproval';

type SuperAdminTab = 'users' | 'products' | 'categories' | 'units' | 'suppliers' | 'supplier-approval' | 'purchasing' | 'shipping' | 'reports' | 'settings' | 'about-editor' | 'app-update' | 'install-guide';
type ReportTab = 'sales' | 'inventory' | 'purchase' | 'financial' | 'profit-loss';

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('users');
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('sales');
  const { currentUser } = useAppContext();

  // Super Admin can manage all roles.
  const managedRoles = [Role.ADMIN, Role.CASHIER, Role.CUSTOMER, Role.SHIPPING, Role.SUPPLIER];

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activeTab) {
      case 'users':
        return <UserManagement managedRoles={managedRoles} />;
      case 'products':
        return <ProductStockManagement userRole={currentUser.role} />;
      case 'categories':
        return <CategoryManagement />;
      case 'units':
        return <UnitManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'supplier-approval':
        return <SupplierApproval />;
      case 'purchasing':
        return <PurchasingManagement setActiveTab={setActiveTab as any} />;
      case 'shipping':
        return <ShippingManagement />;
      case 'settings':
        return <SiteSettings />;
      case 'about-editor':
        return <AboutPageEditor />;
      case 'app-update':
        return <ApplicationUpdate />;
      case 'install-guide':
        return <div className="p-0 -m-6"><InstallationPage /></div>;
      case 'reports':
        return (
          <div>
            <div className="flex border-b border-gray-200 mb-4 flex-wrap">
              <button onClick={() => setActiveReportTab('sales')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'sales' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Penjualan
              </button>
              <button onClick={() => setActiveReportTab('inventory')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'inventory' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Inventaris
              </button>
              <button onClick={() => setActiveReportTab('purchase')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'purchase' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Pembelian
              </button>
              <button onClick={() => setActiveReportTab('financial')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'financial' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Keuangan
              </button>
              <button onClick={() => setActiveReportTab('profit-loss')} className={`px-4 py-2 text-sm font-medium ${activeReportTab === 'profit-loss' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}>
                Laba Rugi
              </button>
            </div>
            <div>
              {activeReportTab === 'sales' && <SalesReport />}
              {activeReportTab === 'inventory' && <InventoryReport />}
              {activeReportTab === 'purchase' && <PurchaseReport />}
              {activeReportTab === 'financial' && <FinancialReport />}
              {activeReportTab === 'profit-loss' && <ProfitLossReport />}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTabClass = (tabName: SuperAdminTab) => {
    return `px-4 py-2 font-semibold rounded-t-lg cursor-pointer ${
      activeTab === tabName
        ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-4">Dashboard Super Admin</h2>
      <p className="mb-6 text-gray-600">Anda memiliki akses penuh ke semua fitur manajemen.</p>
       <div className="flex border-b border-gray-300 mb-4 flex-wrap">
        <div onClick={() => setActiveTab('users')} className={getTabClass('users')}>Pengguna</div>
        <div onClick={() => setActiveTab('products')} className={getTabClass('products')}>Produk</div>
        <div onClick={() => setActiveTab('categories')} className={getTabClass('categories')}>Kategori</div>
        <div onClick={() => setActiveTab('units')} className={getTabClass('units')}>Satuan</div>
        <div onClick={() => setActiveTab('suppliers')} className={getTabClass('suppliers')}>Supplier</div>
        <div onClick={() => setActiveTab('supplier-approval')} className={getTabClass('supplier-approval')}>Persetujuan Supplier</div>
        <div onClick={() => setActiveTab('purchasing')} className={getTabClass('purchasing')}>Pembelian</div>
        <div onClick={() => setActiveTab('shipping')} className={getTabClass('shipping')}>Pengiriman</div>
        <div onClick={() => setActiveTab('reports')} className={getTabClass('reports')}>Laporan</div>
        <div onClick={() => setActiveTab('settings')} className={getTabClass('settings')}>Situs</div>
        <div onClick={() => setActiveTab('about-editor')} className={getTabClass('about-editor')}>Hal. Tentang</div>
        <div onClick={() => setActiveTab('app-update')} className={getTabClass('app-update')}>Info Aplikasi</div>
        <div onClick={() => setActiveTab('install-guide')} className={getTabClass('install-guide')}>Panduan</div>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;