import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types';
import { api } from '../../services/api';

interface UserFormProps {
  userToEdit?: User | null;
  onSubmit: (userData: Omit<User, 'id'> | User) => void;
  onCancel: () => void;
  availableRoles: Role[];
  error: string | null;
}

const UserForm: React.FC<UserFormProps> = ({ userToEdit, onSubmit, onCancel, availableRoles, error }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: availableRoles[0] || Role.CUSTOMER,
  });
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        fullName: userToEdit.fullName,
        email: userToEdit.email,
        password: '', // Password is not pre-filled for security
        role: userToEdit.role,
      });
    }
  }, [userToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (isEditing) {
      const updatedUser: User = {
        ...userToEdit,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      };
      onSubmit(updatedUser);
    } else {
      const newUser: Omit<User, 'id'> = {
        ...formData,
      };
      onSubmit(newUser);
    }
    // Note: Parent component will handle closing the form, so we don't reset state here.
  };
  
  const handleValidationAction = async (action: 'VALIDATED' | 'REJECTED') => {
    if (!userToEdit) return;
    
    let newStatus: User['identityCardStatus'];
    let newUrl: string | undefined;

    if (action === 'VALIDATED') {
        newStatus = 'VALIDATED';
        newUrl = userToEdit.identityCardUrl;
    } else { // REJECTED
        newStatus = 'NOT_UPLOADED';
        newUrl = '';
    }

    const updatedUser: User = {
        ...userToEdit,
        identityCardStatus: newStatus,
        identityCardUrl: newUrl,
    };
    
    // We call the API directly here for a quick update.
    try {
        await api.updateUser(updatedUser);
        // We call onSubmit to trigger a refresh in the parent component
        onSubmit(updatedUser);
    } catch(err) {
        console.error("Failed to update KTP status", err);
        // Optionally show an error to the admin
    }
  };


  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-primary mb-6">{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">Nama Lengkap</label>
          <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" placeholder={isEditing ? 'Kosongkan jika tidak ingin diubah' : ''} required={!isEditing} />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">Role</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white" required>
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">
            Batal
          </button>
          <button type="submit" disabled={isSaving} className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover disabled:bg-gray-400">
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>

      {isEditing && userToEdit.role === Role.CUSTOMER && userToEdit.identityCardStatus === 'PENDING_VALIDATION' && (
        <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-yellow-700 mb-4">Validasi KTP</h3>
            {userToEdit.identityCardUrl ? (
                <img src={userToEdit.identityCardUrl} alt="Foto KTP Pengguna" className="w-full h-auto rounded-md border mb-4"/>
            ) : (
                <p className="text-gray-500 italic">Gambar KTP tidak tersedia.</p>
            )}
            <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => handleValidationAction('REJECTED')}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">
                    Tolak KTP
                </button>
                <button 
                  onClick={() => handleValidationAction('VALIDATED')}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700">
                    Setujui KTP
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserForm;