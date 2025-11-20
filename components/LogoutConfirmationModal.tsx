import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AlertTriangleIcon } from './Icons';

const LogoutConfirmationModal: React.FC = () => {
  const { logout, closeLogoutModal } = useAppContext();

  const handleConfirmLogout = () => {
    logout();
    closeLogoutModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 animate-fade-in-up">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-bold text-gray-900">
                Konfirmasi Logout
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Apakah Anda yakin ingin keluar dari akun Anda?
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Yakin, Logout
          </button>
          <button
            type="button"
            onClick={closeLogoutModal}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;
