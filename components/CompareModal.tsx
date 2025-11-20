import React from 'react';
import { useAppContext } from '../context/AppContext';
import { XIcon } from './Icons';

const CompareModal: React.FC = () => {
  const { compareItems, closeCompareModal } = useAppContext();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-primary">Perbandingan Produk</h2>
          <button onClick={closeCompareModal} className="text-gray-500 hover:text-gray-800">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left">
            <tbody>
              {/* Image */}
              <tr className="bg-gray-50">
                <td className="p-4 font-semibold w-1/4">Gambar</td>
                {compareItems.map(product => (
                  <td key={product.id} className="p-4">
                    <img src={product.imageUrl} alt={product.name} className="h-32 w-32 object-contain mx-auto" />
                  </td>
                ))}
              </tr>
              {/* Name */}
              <tr>
                <td className="p-4 font-semibold border-b">Nama</td>
                {compareItems.map(product => (
                  <td key={product.id} className="p-4 font-bold text-lg border-b">{product.name}</td>
                ))}
              </tr>
              {/* Price */}
              <tr className="bg-gray-50">
                <td className="p-4 font-semibold border-b">Harga</td>
                {compareItems.map(product => {
                    const hasDiscount = product.discountPercent && product.discountPercent > 0;
                    const discountedPrice = hasDiscount ? product.sellingPrice * (1 - product.discountPercent! / 100) : product.sellingPrice;
                    return (
                      <td key={product.id} className="p-4 font-bold border-b">
                        {hasDiscount ? (
                          <div>
                            <p className="text-sm text-gray-500 line-through">{formatCurrency(product.sellingPrice)}</p>
                            <p className="text-primary">{formatCurrency(discountedPrice)}</p>
                          </div>
                        ) : (
                          <p className="text-primary">{formatCurrency(product.sellingPrice)}</p>
                        )}
                      </td>
                    )
                })}
              </tr>
              {/* Description */}
              <tr>
                <td className="p-4 font-semibold border-b">Deskripsi</td>
                {compareItems.map(product => (
                  <td key={product.id} className="p-4 text-sm text-gray-600 border-b">{product.description}</td>
                ))}
              </tr>
              {/* Specifications */}
              {/* Fix: Explicitly type specKey as a string to resolve indexing error. */}
              {Array.from(new Set(compareItems.flatMap(p => Object.keys(p.specifications)))).map((specKey: string) => (
                 <tr key={specKey} className="bg-gray-50">
                    <td className="p-4 font-semibold border-b">{specKey}</td>
                    {compareItems.map(product => (
                        <td key={product.id} className="p-4 text-sm border-b">
                            {product.specifications[specKey] || '-'}
                        </td>
                    ))}
                </tr>
              ))}
               {/* Stock */}
               <tr>
                <td className="p-4 font-semibold border-b">Stok</td>
                {compareItems.map(product => (
                  <td key={product.id} className="p-4 font-bold border-b">{product.stock > 0 ? product.stock : 'Habis'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t mt-auto text-right">
            <button onClick={closeCompareModal} className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-hover">
                Tutup
            </button>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;