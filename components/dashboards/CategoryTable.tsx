import React from 'react';
import { Category } from '../../types';
import { EditIcon, TrashIcon } from '../Icons';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Kategori</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Kategori</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.length > 0 ? categories.map(category => (
            <tr key={category.id}>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{category.categoryCode}</td>
              <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(category)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                  <EditIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(category.id)} className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data kategori.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;