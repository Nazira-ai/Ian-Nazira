
import React from 'react';
import { User, Role } from '../../types';
import { EditIcon, TrashIcon } from '../Icons';

const KTPStatusBadge: React.FC<{ status: User['identityCardStatus'] }> = ({ status }) => {
    const statusInfo = {
        'NOT_UPLOADED': { text: 'Belum Unggah', color: 'bg-red-100 text-red-800' },
        'PENDING_VALIDATION': { text: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
        'VALIDATED': { text: 'Valid', color: 'bg-green-100 text-green-800' },
    };
    const currentStatus = status && statusInfo[status] ? statusInfo[status] : statusInfo['NOT_UPLOADED'];
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentStatus.color}`}>{currentStatus.text}</span>;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status KTP</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length > 0 ? users.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === Role.ADMIN ? 'bg-green-100 text-green-800' :
                  user.role === Role.CASHIER ? 'bg-yellow-100 text-yellow-800' :
                  user.role === Role.SHIPPING ? 'bg-purple-100 text-purple-800' :
                  user.role === Role.SUPPLIER ? 'bg-indigo-100 text-indigo-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </td>
               <td className="px-6 py-4 whitespace-nowrap">
                {user.role === Role.CUSTOMER ? (
                  <KTPStatusBadge status={user.identityCardStatus} />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                  <EditIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data pengguna.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;