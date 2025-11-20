import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Koperasi MASTER. All rights reserved.</p>
        <div className="mt-4 text-sm text-slate-400 space-y-2">
            <p><strong>Alamat Kantor:</strong> Jl. Banjaranyar - Pasiraman Km. 0,5 RT 03 RW 05 Desa Banjaranyar Kec. Pekuncen Kab. Banyumas Jawa Tengah</p>
            <p><strong>Kontak Person:</strong> 0852-2939-0451 | info@koperasimaster.com</p>
            <a 
              href="https://maps.google.com/?q=-7.353199045376862,109.08042832617498"
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block text-accent hover:text-yellow-400 transition-colors font-semibold"
            >
              Lihat Lokasi Toko di Peta
            </a>
            <p className="pt-2">Ian_nazira by ian.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;