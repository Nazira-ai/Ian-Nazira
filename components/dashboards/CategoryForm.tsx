import React, { useState, useEffect } from 'react';
import { Category } from '../../types';

interface CategoryFormProps {
  categoryToEdit?: Category | null;
  onSubmit: (categoryData: Omit<Category, 'id'> | Category) => void;
  onCancel: () => void;
  error: string | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ categoryToEdit, onSubmit, onCancel, error }) => {
  const [formData, setFormData] = useState({
    categoryCode: '',
    name: '',
  });
  const isEditing = !!categoryToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        categoryCode: categoryToEdit.categoryCode,
        name: categoryToEdit.name,
      });
    }
  }, [categoryToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit({ ...categoryToEdit, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-primary mb-6">{isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryCode">Kode Kategori</label>
          <input id="categoryCode" name="categoryCode" type="text" value={formData.categoryCode} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nama Kategori</label>
          <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
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

export default CategoryForm;