import React from 'react';
import { Supplier } from '../../types';
import { EditIcon, TrashIcon } from '../Icons';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplierId: number) => void;
}

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perusahaan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telepon</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.length > 0 ? suppliers.map(supplier => (
            <tr key={supplier.id}>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{supplier.supplierCode}</td>
              <td className="px-6 py-4 whitespace-nowrap">{supplier.companyName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{supplier.address}</td>
              <td className="px-6 py-4 whitespace-nowrap">{supplier.phoneNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap">{supplier.salesName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(supplier)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                  <EditIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(supplier.id)} className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data supplier.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierTable;