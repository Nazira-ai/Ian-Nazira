import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AboutPageContent } from '../../types';

const AboutPageEditor: React.FC = () => {
    const { aboutPageContent, setAboutPageContent, showToast } = useAppContext();
    const [formData, setFormData] = useState<AboutPageContent>(aboutPageContent);
    const [missionText, setMissionText] = useState('');

    useEffect(() => {
        setFormData(aboutPageContent);
        setMissionText(aboutPageContent.missionItems.join('\n'));
    }, [aboutPageContent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGalleryChange = (index: number, value: string) => {
        const newImages = [...formData.galleryImages];
        newImages[index] = value;
        setFormData(prev => ({...prev, galleryImages: newImages}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const missionItems = missionText.split('\n').filter(item => item.trim() !== '');
        const finalData = { ...formData, missionItems };
        setAboutPageContent(finalData);
        showToast('Konten halaman "Tentang Kami" berhasil diperbarui!', 'success');
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Editor Halaman "Tentang Kami"</h3>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
                {/* Header Section */}
                <fieldset className="space-y-4 border p-4 rounded-md">
                    <legend className="font-semibold px-2">Bagian Header</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="title">Judul Utama</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="subtitle">Subjudul</label>
                        <input type="text" id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </fieldset>

                {/* Visi & Misi Section */}
                <fieldset className="space-y-4 border p-4 rounded-md">
                     <legend className="font-semibold px-2">Bagian Visi & Misi</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="visionText">Teks Visi</label>
                        <textarea id="visionText" name="visionText" value={formData.visionText} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="missionItems">Item Misi (satu per baris)</label>
                        <textarea id="missionItems" name="missionItems" value={missionText} onChange={(e) => setMissionText(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                </fieldset>
                
                {/* Sejarah Section */}
                <fieldset className="space-y-4 border p-4 rounded-md">
                     <legend className="font-semibold px-2">Bagian Sejarah</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="historyText">Teks Sejarah Singkat</label>
                        <textarea id="historyText" name="historyText" value={formData.historyText} onChange={handleChange} rows={5} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                </fieldset>
                
                 {/* Gallery Section */}
                <fieldset className="space-y-4 border p-4 rounded-md">
                     <legend className="font-semibold px-2">Bagian Galeri</legend>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i}>
                                <label className="block text-sm font-medium text-gray-700" htmlFor={`galleryImage${i}`}>URL Gambar Galeri {i + 1}</label>
                                <input type="text" id={`galleryImage${i}`} name={`galleryImage${i}`} value={formData.galleryImages[i] || ''} onChange={(e) => handleGalleryChange(i, e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                            </div>
                        ))}
                     </div>
                </fieldset>
                
                {/* Location Section */}
                 <fieldset className="space-y-4 border p-4 rounded-md">
                     <legend className="font-semibold px-2">Bagian Lokasi</legend>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="locationMapUrl">URL Embed Google Maps</label>
                        <input type="text" id="locationMapUrl" name="locationMapUrl" value={formData.locationMapUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                </fieldset>

                <div className="text-right">
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-primary-hover">
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AboutPageEditor;
