import React, { useState, useEffect, useCallback } from 'react';
import { Unit } from '../../types';
import { api } from '../../services/api';
import UnitTable from './UnitTable';
import UnitForm from './UnitForm';
import { PlusIcon } from '../Icons';

const UnitManagement: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allUnits = await api.fetchUnits();
      setUnits(allUnits);
    } catch (err) {
      setError('Gagal memuat data satuan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const handleAddClick = () => {
    setEditingUnit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (unit: Unit) => {
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleDelete = async (unitId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus satuan ini? Ini mungkin mempengaruhi produk yang ada.')) {
      try {
        await api.deleteUnit(unitId);
        fetchUnits();
      } catch (err) {
        setError('Gagal menghapus satuan.');
      }
    }
  };

  const handleFormSubmit = async (unitData: Omit<Unit, 'id'> | Unit) => {
    setError(null);
    try {
      if ('id' in unitData) {
        await api.updateUnit(unitData);
      } else {
        await api.addUnit(unitData);
      }
      setIsFormOpen(false);
      fetchUnits();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan satuan.');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingUnit(null);
  };

  if (isFormOpen) {
    return (
      <UnitForm
        unitToEdit={editingUnit}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        error={error}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Daftar Satuan Produk</h3>
        <button
          onClick={handleAddClick}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Satuan
        </button>
      </div>
      {loading && <p>Memuat...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <UnitTable units={units} onEdit={handleEditClick} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default UnitManagement;
