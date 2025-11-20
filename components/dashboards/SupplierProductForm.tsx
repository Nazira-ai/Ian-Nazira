import React, { useState, useEffect } from 'react';
import { Product, Category, Unit, Supplier } from '../../types';
import { api } from '../../services/api';

interface SupplierProductFormProps {
  productToEdit?: Product | null;
  onSubmit: (productData: Omit<Product, 'id'> | Product) => void;
  onCancel: () => void;
  error: string | null;
  supplier: Supplier;
}

const specsToString = (specs: { [key: string]: string }): string => {
  if (!specs) return '';
  return Object.entries(specs).map(([key, value]) => `${key}: ${value}`).join('\n');
};

const stringToSpecs = (str: string): { [key: string]: string } => {
  const specs: { [key: string]: string } = {};
  str.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      if (key && value) {
        specs[key] = value;
      }
    }
  });
  return specs;
};

const SupplierProductForm: React.FC<SupplierProductFormProps> = ({ productToEdit, onSubmit, onCancel, error, supplier }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    barcode: '',
    imageUrl: '',
    categoryId: 0,
    unitId: 0,
    specifications: '',
    sku: '',
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const isEditing = !!productToEdit;

  // Auto-calculate selling price
  useEffect(() => {
    const cost = parseFloat(formData.costPrice);
    if (!isNaN(cost) && cost >= 0) {
        const selling = cost * 1.10;
        setFormData(prev => ({...prev, sellingPrice: selling.toFixed(2)}));
    } else {
        setFormData(prev => ({...prev, sellingPrice: ''}));
    }
  }, [formData.costPrice]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedUnits] = await Promise.all([
          api.fetchCategories(),
          api.fetchUnits()
        ]);
        setCategories(fetchedCategories);
        setUnits(fetchedUnits);
        if (!isEditing) {
          if (fetchedCategories.length > 0) setFormData(prev => ({ ...prev, categoryId: fetchedCategories[0].id }));
          if (fetchedUnits.length > 0) setFormData(prev => ({ ...prev, unitId: fetchedUnits[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch data for product form", err);
      }
    };
    fetchData();
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        costPrice: String(productToEdit.costPrice),
        sellingPrice: String(productToEdit.sellingPrice),
        stock: String(productToEdit.stock),
        barcode: productToEdit.barcode,
        imageUrl: productToEdit.imageUrl,
        categoryId: productToEdit.categoryId,
        unitId: productToEdit.unitId,
        specifications: specsToString(productToEdit.specifications),
        sku: productToEdit.sku || '',
      });
    }
  }, [productToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submittedData = {
        name: formData.name,
        description: formData.description,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        barcode: formData.barcode,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/400.png?text=No+Image',
        categoryId: Number(formData.categoryId),
        unitId: Number(formData.unitId),
        specifications: stringToSpecs(formData.specifications),
        sku: formData.sku,
        supplierId: supplier.id,
        supplierCode: supplier.supplierCode,
        discountPercent: 0, // Suppliers cannot set discounts
        priceTiers: [], // Suppliers cannot set price tiers
    };
    
    if (isEditing && productToEdit) {
      onSubmit({ ...productToEdit, ...submittedData });
    } else {
      onSubmit(submittedData as Omit<Product, 'id'>);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-primary mb-6">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
         <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="name">Nama Produk</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="description">Deskripsi</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required rows={3}></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="costPrice">Harga Pokok (Modal Anda)</label>
                <input id="costPrice" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="sellingPrice">Harga Jual (Otomatis)</label>
                <input id="sellingPrice" name="sellingPrice" type="number" value={formData.sellingPrice} className="w-full p-2 bg-gray-200 border border-gray-300 rounded-md" disabled />
                <p className="text-xs text-gray-500 mt-1">Harga Jual = Harga Pokok + 10%</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="stock">Stok</label>
                <input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="unitId">Satuan</label>
              <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white" required>
                {units.map(unit => (<option key={unit.id} value={unit.id}>{unit.name}</option>))}
              </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="sku">SKU (Kode Internal Anda)</label>
                <input id="sku" name="sku" type="text" value={formData.sku} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="barcode">Barcode</label>
                <input id="barcode" name="barcode" type="text" value={formData.barcode} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" />
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="specifications">Spesifikasi</label>
           <textarea id="specifications" name="specifications" value={formData.specifications} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md font-mono text-sm" rows={4} placeholder="Contoh: Berat: 250g"></textarea>
           <p className="text-xs text-gray-500 mt-1">Satu spesifikasi per baris, format: `Key: Value`.</p>
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">
            Batal
          </button>
          <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-hover">
            Simpan Produk
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierProductForm;
