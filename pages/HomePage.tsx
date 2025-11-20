import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          api.fetchProducts(),
          api.fetchCategories()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
        setLoading(true);
        try {
            const categoryId = selectedCategory ? parseInt(selectedCategory, 10) : undefined;
            const results = await api.searchProducts(searchTerm, categoryId, sortBy);
            setProducts(results);
        } catch (error) {
            console.error("Failed to search products", error);
        } finally {
            setLoading(false);
        }
    }
    const timer = setTimeout(() => {
        handleSearch();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <div>
      <div className="bg-surface p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <input
                type="text"
                placeholder="Cari nama barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 bg-white border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
                <option value="">Urutkan</option>
                <option value="price-asc">Harga: Terendah</option>
                <option value="price-desc">Harga: Tertinggi</option>
                <option value="name-asc">Nama: A-Z</option>
            </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-lg">Memuat produk...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
             <div className="col-span-full text-center py-10">
                <p className="text-lg text-gray-500">Produk tidak ditemukan.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;