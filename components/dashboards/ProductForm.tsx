import React, { useState, useEffect } from 'react';
import { Product, Category, Supplier, Unit, PriceTier } from '../../types';
import { api } from '../../services/api';
import { PlusIcon, TrashIcon } from '../Icons';

interface ProductFormProps {
  productToEdit?: Product | null;
  onSubmit: (productData: Omit<Product, 'id'> | Product) => void;
  onCancel: () => void;
  error: string | null;
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

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onSubmit, onCancel, error }) => {
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
    discountPercent: '',
    sku: '',
    supplierCode: '',
  });
  
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const isEditing = !!productToEdit;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedSuppliers, fetchedUnits] = await Promise.all([
          api.fetchCategories(),
          api.fetchSuppliers(),
          api.fetchUnits()
        ]);
        
        setCategories(fetchedCategories);
        setSuppliers(fetchedSuppliers);
        setUnits(fetchedUnits);

        if (!isEditing) {
          if (fetchedCategories.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: fetchedCategories[0].id }));
          }
          if (fetchedSuppliers.length > 0) {
            setFormData(prev => ({ ...prev, supplierCode: fetchedSuppliers[0].supplierCode }));
          }
          if (fetchedUnits.length > 0) {
              setFormData(prev => ({ ...prev, unitId: fetchedUnits[0].id }));
          }
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
        discountPercent: String(productToEdit.discountPercent || ''),
        sku: productToEdit.sku || '',
        supplierCode: productToEdit.supplierCode || '',
      });
      setPriceTiers(productToEdit.priceTiers || []);
      setImagePreview(productToEdit.imageUrl);
    }
  }, [productToEdit, isEditing]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Nama produk tidak boleh kosong.';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi tidak boleh kosong.';
    
    const costPriceNum = Number(formData.costPrice);
    if (isNaN(costPriceNum) || costPriceNum < 0) {
      newErrors.costPrice = 'Harga pokok harus berupa angka positif.';
    }

    const sellingPriceNum = Number(formData.sellingPrice);
    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      newErrors.sellingPrice = 'Harga jual harus berupa angka positif.';
    }

    const stockNum = Number(formData.stock);
    if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      newErrors.stock = 'Stok harus berupa angka bulat (0 atau lebih).';
    }

    if (formData.barcode && !/^\d+$/.test(formData.barcode)) {
      newErrors.barcode = 'Barcode harus hanya berisi angka.';
    }

    const discountNum = Number(formData.discountPercent);
    if (formData.discountPercent && (isNaN(discountNum) || discountNum < 0 || discountNum > 100)) {
        newErrors.discountPercent = 'Diskon harus berupa angka antara 0 dan 100.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleTierChange = (index: number, field: keyof PriceTier, value: string) => {
    const newTiers = [...priceTiers];
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0) {
        newTiers[index] = { ...newTiers[index], [field]: numValue };
        setPriceTiers(newTiers);
    }
  };

  const addTier = () => {
    setPriceTiers([...priceTiers, { minQuantity: 0, price: 0 }]);
  };

  const removeTier = (index: number) => {
    setPriceTiers(priceTiers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const submittedData = {
        name: formData.name,
        description: formData.description,
        costPrice: parseFloat(formData.costPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        stock: parseInt(formData.stock, 10) || 0,
        barcode: formData.barcode,
        imageUrl: formData.imageUrl,
        categoryId: Number(formData.categoryId),
        unitId: Number(formData.unitId),
        specifications: stringToSpecs(formData.specifications),
        discountPercent: Number(formData.discountPercent) || 0,
        priceTiers: priceTiers.filter(t => t.minQuantity > 0 && t.price > 0),
        sku: formData.sku,
        supplierCode: formData.supplierCode,
    };
    
    if (isEditing && productToEdit) {
      const updatedProduct: Product = { ...productToEdit, ...submittedData };
      onSubmit(updatedProduct);
    } else {
      const newProduct: Omit<Product, 'id'|'unitName'> = { ...submittedData };
      onSubmit(newProduct as Omit<Product, 'id'>);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-primary mb-6">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... other form fields ... */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nama Produk</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">Kategori</label>
              <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white" required>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Deskripsi</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required rows={3}></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="costPrice">Harga Pokok (IDR)</label>
                <input id="costPrice" name="costPrice" type="number" value={formData.costPrice} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
                {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sellingPrice">Harga Jual Satuan (IDR)</label>
                <input id="sellingPrice" name="sellingPrice" type="number" value={formData.sellingPrice} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
                {errors.sellingPrice && <p className="text-red-500 text-xs mt-1">{errors.sellingPrice}</p>}
            </div>
        </div>

        {/* Price Tiers Section */}
        <div className="border p-4 rounded-md space-y-3">
          <h3 className="text-md font-semibold text-gray-800">Harga Jual Satuan (Grosir)</h3>
          <p className="text-xs text-gray-500 -mt-2">Opsional. Atur harga lebih murah untuk pembelian dalam jumlah tertentu.</p>
          {priceTiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <span className="text-sm">Min. Qty:</span>
              <input 
                type="number"
                value={tier.minQuantity}
                onChange={(e) => handleTierChange(index, 'minQuantity', e.target.value)}
                className="w-24 p-2 border rounded-md"
                placeholder="Jumlah"
              />
               <span className="text-sm">Harga:</span>
              <input 
                type="number"
                value={tier.price}
                onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                className="w-32 p-2 border rounded-md"
                placeholder="Harga"
              />
              <button type="button" onClick={() => removeTier(index)} className="text-red-500 hover:text-red-700 p-2">
                <TrashIcon className="h-5 w-5"/>
              </button>
            </div>
          ))}
          <button type="button" onClick={addTier} className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center">
            <PlusIcon className="h-4 w-4 mr-1"/> Tambah Tingkatan Harga
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">Stok</label>
                <input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" required />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unitId">Satuan</label>
              <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white" required>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discountPercent">Diskon (%)</label>
                <input id="discountPercent" name="discountPercent" type="number" placeholder="0" value={formData.discountPercent} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" />
                <p className="text-xs text-gray-500 mt-1">Diskon ini tidak berlaku jika harga grosir aktif.</p>
                {errors.discountPercent && <p className="text-red-500 text-xs mt-1">{errors.discountPercent}</p>}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sku">SKU</label>
                <input id="sku" name="sku" type="text" placeholder="cth: SNK-KRP-001" value={formData.sku} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="barcode">Barcode</label>
                <input id="barcode" name="barcode" type="text" value={formData.barcode} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md" />
                {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="supplierCode">Supplier</label>
                <select id="supplierCode" name="supplierCode" value={formData.supplierCode} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                  <option value="">--Pilih Supplier--</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.supplierCode}>
                      {sup.companyName} ({sup.supplierCode})
                    </option>
                  ))}
                </select>
            </div>
        </div>
        <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Gambar Produk</label>
            <div className="flex items-center gap-4">
                {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-md object-cover border"/>}
                <input 
                    id="image" 
                    name="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none file:bg-gray-50 file:text-gray-700 file:border-0 file:py-2 file:px-4"
                />
            </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specifications">Spesifikasi</label>
           <textarea id="specifications" name="specifications" value={formData.specifications} onChange={handleChange} className="w-full p-2 bg-white border border-gray-300 rounded-md font-mono text-sm" rows={4}></textarea>
           <p className="text-xs text-gray-500 mt-1">Masukkan satu spesifikasi per baris, format: `Key: Value`. Contoh: `Berat: 250g`</p>
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

export default ProductForm;