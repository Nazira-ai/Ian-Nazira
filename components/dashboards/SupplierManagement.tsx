import React, { useState, useEffect, useCallback } from 'react';
import { Supplier } from '../../types';
import { api } from '../../services/api';
import SupplierTable from './SupplierTable';
import SupplierForm from './SupplierForm';
import { PlusIcon } from '../Icons';

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allSuppliers = await api.fetchSuppliers();
      setSuppliers(allSuppliers);
    } catch (err) {
      setError('Gagal memuat data supplier.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAddClick = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleDelete = async (supplierId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus supplier ini?')) {
      try {
        await api.deleteSupplier(supplierId);
        fetchSuppliers();
      } catch (err) {
        setError('Gagal menghapus supplier.');
      }
    }
  };

  const handleFormSubmit = async (supplierData: Omit<Supplier, 'id'> | Supplier) => {
    setError(null);
    try {
      if ('id' in supplierData) {
        await api.updateSupplier(supplierData);
      } else {
        await api.addSupplier(supplierData);
      }
      setIsFormOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan supplier.');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  if (isFormOpen) {
    return (
      <SupplierForm
        supplierToEdit={editingSupplier}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        error={error}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daftar Supplier</h3>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Supplier
        </button>
      </div>
      {loading && <p>Memuat...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <SupplierTable suppliers={suppliers} onEdit={handleEditClick} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default SupplierManagement;