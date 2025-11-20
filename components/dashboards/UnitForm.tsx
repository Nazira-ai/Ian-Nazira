import React, { useState, useEffect } from 'react';
import { Unit } from '../../types';

interface UnitFormProps {
  unitToEdit?: Unit | null;
  onSubmit: (unitData: Omit<Unit, 'id'> | Unit) => void;
  onCancel: () => void;
  error: string | null;
}

const UnitForm: React.FC<UnitFormProps> = ({ unitToEdit, onSubmit, onCancel, error }) => {
  const [name, setName] = useState('');
  const isEditing = !!unitToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(unitToEdit.name);
    }
  }, [unitToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit({ ...unitToEdit, name });
    } else {
      onSubmit({ name });
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-primary mb-6">{isEditing ? 'Edit Satuan' : 'Tambah Satuan Baru'}</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nama Satuan</label>
          <input 
            id="name" 
            name="name" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Contoh: Pcs, Kg, Liter"
            className="w-full p-2 bg-white border border-gray-300 rounded-md" 
            required 
          />
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">
            Batal
          </button>
          <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnitForm;
