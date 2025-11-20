import React from 'react';

// Assume the version is stored in package.json and made available somehow.
// For this static example, we'll hardcode it.
const APP_VERSION = '1.0.0';

const ApplicationUpdate: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-xl font-semibold mb-4">Pembaruan Aplikasi</h3>
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
        <div>
            <p className="font-semibold text-gray-800">Versi Terinstal</p>
            <p className="text-2xl font-bold text-primary">{APP_VERSION}</p>
        </div>
        <button 
            className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover"
            onClick={() => alert('Anda sudah menggunakan versi terbaru.')}
        >
            Cek Pembaruan
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Aplikasi ini menggunakan Service Worker untuk caching. Membersihkan cache browser Anda dan me-reload halaman akan memastikan Anda mendapatkan versi terbaru setelah deployment.
      </p>
    </div>
  );
};

export default ApplicationUpdate;
