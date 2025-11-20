import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Page, Role, Supplier } from '../types';
import { ShoppingCartIcon, UserCircleIcon, WalletIcon } from './Icons';
import { api } from '../services/api';

const Header: React.FC = () => {
  const { currentUser, setCurrentPage, cart, openLogoutModal, logoUrl } = useAppContext();
  const [supplier, setSupplier] = useState<Supplier | null | undefined>(undefined); // undefined: loading, null: not found

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    const checkSupplierStatus = async () => {
        if (currentUser && currentUser.role === Role.CUSTOMER) {
            setSupplier(undefined); // Start loading
            const sup = await api.fetchSupplierByUserId(currentUser.id);
            setSupplier(sup || null);
        } else {
            setSupplier(null);
        }
    };
    checkSupplierStatus();
  }, [currentUser]);

  const renderSupplierCTA = () => {
      if (!currentUser || currentUser.role !== Role.CUSTOMER) return null;

      if (supplier === undefined) {
          return <span className="text-sm text-gray-500">Memeriksa status...</span>;
      }

      if (supplier === null) {
          return (
              <button onClick={() => setCurrentPage(Page.REGISTER_SUPPLIER)} className="text-gray-600 hover:text-primary font-medium">
                  Daftar Jadi Penjual
              </button>
          );
      }

      if (supplier.status === 'PENDING_APPROVAL') {
          return <span className="text-sm text-yellow-600">Pendaftaran ditinjau</span>;
      }
      
      if (supplier.status === 'REJECTED') {
          return <span className="text-sm text-red-600">Pendaftaran ditolak</span>;
      }

      return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <header className="bg-surface shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo and Title */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => setCurrentPage(Page.HOME)}
        >
          <img src={logoUrl} alt="Koperasi MASTER Logo" className="h-10 w-10 mr-3 object-contain" />
          <span className="text-xl font-bold text-primary hidden sm:block">Koperasi MASTER</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => setCurrentPage(Page.HOME)} className="text-gray-600 hover:text-primary font-medium">Beranda</button>
          <button onClick={() => setCurrentPage(Page.ABOUT)} className="text-gray-600 hover:text-primary font-medium">Tentang Kami</button>
          {renderSupplierCTA()}
        </nav>

        {/* Right Side Icons & User Info */}
        <div className="flex items-center space-x-4">
          {/* Digital Wallet Section */}
          {currentUser && currentUser.role === Role.CUSTOMER && (
            <button onClick={() => setCurrentPage(Page.PROFILE)} className="flex items-center text-gray-600 hover:text-primary p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <WalletIcon className="h-7 w-7 mr-2"/>
                <div className="text-left hidden sm:block text-sm">
                    {currentUser.digitalWalletProvider && currentUser.digitalWalletBalance !== undefined ? (
                        <>
                            <span className="font-semibold block -mb-1">{currentUser.digitalWalletProvider}</span>
                            <span className="text-xs text-green-600 font-bold">{formatCurrency(currentUser.digitalWalletBalance)}</span>
                        </>
                    ) : (
                        <span className="font-semibold leading-tight">Hubungkan<br/>Dompet</span>
                    )}
                </div>
            </button>
           )}

          {/* Cart Icon */}
          <button onClick={() => setCurrentPage(Page.CART)} className="relative text-gray-600 hover:text-primary">
            <ShoppingCartIcon className="h-7 w-7" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Section */}
          <div className="relative group">
            <button className="flex items-center text-gray-600 hover:text-primary">
              <UserCircleIcon className="h-7 w-7" />
            </button>
            <div className="absolute right-0 top-full pt-2 w-48 bg-surface rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
              {currentUser ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-semibold truncate">{currentUser.fullName}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                  {currentUser.role !== Role.CUSTOMER && (
                    <button
                      onClick={() => setCurrentPage(Page.DASHBOARD)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                  )}
                   <button
                    onClick={() => setCurrentPage(Page.PROFILE)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profil Saya
                  </button>
                  <button
                    onClick={openLogoutModal}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentPage(Page.LOGIN)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setCurrentPage(Page.REGISTER)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Daftar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;