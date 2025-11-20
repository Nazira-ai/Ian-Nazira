import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';

interface SupplierFormProps {
  supplierToEdit?: Supplier | null;
  onSubmit: (supplierData: Omit<Supplier, 'id'> | Supplier) => void;
  onCancel: () => void;
  error: string | null;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplierToEdit, onSubmit, onCancel, error }) => {
  const [formData, setFormData] = useState({
    supplierCode: '',
    companyName: '',
    address: '',
    phoneNumber: '',
    salesName: '',
  });
  const isEditing = !!supplierToEdit;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        supplierCode: supplierToEdit.supplierCode,
        companyName: supplierToEdit.companyName,
        address: supplierToEdit.address,
        phoneNumber: supplierToEdit.phoneNumber,
        salesName: supplierToEdit.salesName,
      });
    }
  }, [supplierToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit({ ...supplierToEdit, ...formData });
    } else {
      // Fix: Provide default userId and status for new suppliers created by admin.
      // userId: 0 acts as a placeholder/system user since admin creation doesn't link to a specific user account in this form.
      onSubmit({ 
        ...formData,
        userId: 0,
        status: 'APPROVED' 
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-primary mb-6">{isEditing ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplierCode">Kode Supplier</label>
          <input id="supplierCode" name="supplierCode" type="text" value={formData.supplierCode} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="companyName">Nama Perusahaan</label>
          <input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">Alamat</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required rows={3}></textarea>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">Nomor Telepon</label>
          <input id="phoneNumber" name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salesName">Nama Sales</label>
          <input id="salesName" name="salesName" type="text" value={formData.salesName} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
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

export default SupplierForm;