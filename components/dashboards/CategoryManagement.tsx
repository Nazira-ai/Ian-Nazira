import React, { useState, useEffect, useCallback } from 'react';
import { Category } from '../../types';
import { api } from '../../services/api';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';
import { PlusIcon } from '../Icons';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allCategories = await api.fetchCategories();
      setCategories(allCategories);
    } catch (err) {
      setError('Gagal memuat data kategori.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Ini mungkin mempengaruhi produk yang ada.')) {
      try {
        await api.deleteCategory(categoryId);
        fetchCategories();
      } catch (err) {
        setError('Gagal menghapus kategori.');
      }
    }
  };

  const handleFormSubmit = async (categoryData: Omit<Category, 'id'> | Category) => {
    setError(null);
    try {
      if ('id' in categoryData) {
        await api.updateCategory(categoryData);
      } else {
        await api.addCategory(categoryData);
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori.');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  if (isFormOpen) {
    return (
      <CategoryForm
        categoryToEdit={editingCategory}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        error={error}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daftar Kategori Produk</h3>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Kategori
        </button>
      </div>
      {loading && <p>Memuat...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <CategoryTable categories={categories} onEdit={handleEditClick} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default CategoryManagement;