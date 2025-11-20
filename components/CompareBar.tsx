import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XIcon } from './Icons';

const CompareBar: React.FC = () => {
  const { compareItems, removeFromCompare, clearCompare, openCompareModal } = useAppContext();

  if (compareItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white shadow-lg z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-lg">Bandingkan Produk ({compareItems.length}/3)</h3>
          <div className="flex gap-3">
            {compareItems.map(product => (
              <div key={product.id} className="relative bg-slate-700 p-1 rounded-md">
                <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-cover rounded" />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700"
                  title="Hapus"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={openCompareModal}
                disabled={compareItems.length < 2}
                className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-md font-bold disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                Bandingkan
            </button>
            <button
                onClick={clearCompare}
                className="text-slate-300 hover:text-white"
            >
                Bersihkan
            </button>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
