import React, { useState, useEffect, useCallback } from 'react';
import { User, Role } from '../../types';
import { api } from '../../services/api';
import UserTable from './UserTable';
import UserForm from './UserForm';
import { PlusIcon } from '../Icons';

interface UserManagementProps {
  managedRoles: Role[];
}

const UserManagement: React.FC<UserManagementProps> = ({ managedRoles }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await api.fetchUsers();
      const filteredUsers = allUsers.filter(user => managedRoles.includes(user.role));
      setUsers(filteredUsers);
    } catch (err) {
      setError('Gagal memuat data pengguna.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [managedRoles]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      try {
        await api.deleteUser(userId);
        fetchUsers(); // Refresh list
      } catch (err) {
        setError('Gagal menghapus pengguna.');
        console.error(err);
      }
    }
  };

  const handleFormSubmit = async (userData: Omit<User, 'id'> | User) => {
    setError(null);
    try {
      if ('id' in userData) {
        // Editing user
        await api.updateUser(userData);
      } else {
        // Adding new user
        await api.addUser(userData);
      }
      setIsFormOpen(false);
      fetchUsers(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengguna.');
      console.error(err);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  if (isFormOpen) {
    return (
      <UserForm
        userToEdit={editingUser}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        availableRoles={managedRoles}
        error={error}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daftar Pengguna</h3>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Pengguna
        </button>
      </div>
      {loading && <p>Memuat...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <UserTable users={users} onEdit={handleEditClick} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default UserManagement;