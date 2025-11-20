import React from 'react';
import { Unit } from '../../types';
import { EditIcon, TrashIcon } from '../Icons';

interface UnitTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (unitId: number) => void;
}

const UnitTable: React.FC<UnitTableProps> = ({ units, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Satuan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Satuan</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {units.length > 0 ? units.map(unit => (
            <tr key={unit.id}>
              <td className="px-6 py-4 whitespace-nowrap">{unit.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">{unit.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(unit)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                  <EditIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(unit.id)} className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data satuan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UnitTable;
