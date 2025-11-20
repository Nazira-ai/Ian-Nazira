import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { AlertTriangleIcon, XIcon } from '../Icons';
import { useAppContext } from '../../context/AppContext';

interface LowStockNotificationProps {
    onGoToProducts: () => void;
}

const LowStockNotification: React.FC<LowStockNotificationProps> = ({ onGoToProducts }) => {
    const { lowStockThreshold } = useAppContext();
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStockLevels = async () => {
            try {
                const allProducts = await api.fetchProducts();
                const lowStock = allProducts.filter(p => p.stock > 0 && p.stock < lowStockThreshold);
                setLowStockProducts(lowStock);
                
                // Also log to console as requested
                if (lowStock.length > 0) {
                    console.warn(`LOW STOCK ALERT: ${lowStock.length} product(s) are below the threshold of ${lowStockThreshold} items.`);
                    lowStock.forEach(p => console.log(`- ${p.name}, Stock: ${p.stock}`));
                }

            } catch (error) {
                console.error("Failed to check stock levels:", error);
            } finally {
                setLoading(false);
            }
        };

        checkStockLevels();
    }, [lowStockThreshold]);

    if (loading || !isVisible || lowStockProducts.length === 0) {
        return null;
    }

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow" role="alert">
            <div className="flex">
                <div className="py-1">
                    <AlertTriangleIcon className="h-6 w-6 text-yellow-500 mr-4"/>
                </div>
                <div>
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-yellow-800">Perhatian: Stok Rendah</p>
                        <button onClick={() => setIsVisible(false)} className="text-yellow-500 hover:text-yellow-700">
                            <XIcon className="h-5 w-5"/>
                        </button>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                        Produk berikut memiliki stok di bawah ambang batas ({lowStockThreshold} item):
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                        {lowStockProducts.map(p => (
                            <li key={p.id}><strong>{p.name}</strong> (Sisa: {p.stock})</li>
                        ))}
                    </ul>
                    <button 
                        onClick={() => {
                            onGoToProducts();
                            setIsVisible(false);
                        }} 
                        className="mt-3 text-sm font-semibold bg-yellow-200 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-300"
                    >
                        Kelola Stok Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LowStockNotification;