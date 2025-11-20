import React from 'react';
import { CheckIcon } from '../components/Icons';

const InstallationPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-surface p-8 rounded-lg shadow-xl animate-fade-in-up">
      <h1 className="text-3xl font-bold text-primary mb-6 border-b pb-4">Panduan Instalasi & Deployment</h1>
      
      {/* Why Install Section */}
      <section className="mb-10 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h2 className="text-2xl font-semibold text-primary mb-3">Mengapa Menginstal Aplikasi Ini?</h2>
        <p className="text-gray-700 mb-4">
          Dengan menginstal aplikasi Koperasi MASTER di perangkat Anda, Anda mendapatkan pengalaman layaknya aplikasi native, termasuk:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start">
            <CheckIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-1"/>
            <strong>Akses Cepat:</strong> Buka aplikasi langsung dari Home Screen atau Desktop Anda tanpa perlu membuka browser dan mengetik alamat.
          </li>
          <li className="flex items-start">
            <CheckIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-1"/>
            <strong>Bekerja Offline:</strong> Akses aplikasi dan lihat produk bahkan tanpa koneksi internet.
          </li>
          <li className="flex items-start">
            <CheckIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-1"/>
            <strong>Kinerja Lebih Baik:</strong> Aplikasi berjalan di jendelanya sendiri dan terasa lebih responsif.
          </li>
        </ul>
      </section>

      {/* User Installation Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-center mb-6">Instalasi untuk Pengguna</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Desktop */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold text-center mb-3">Desktop (PC/Laptop)</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">Untuk pengguna Windows, MacOS, dan Linux.</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Buka aplikasi di <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.</li>
              <li>Cari ikon <strong>"Install"</strong> di pojok kanan atas address bar.</li>
              <li>Klik ikon tersebut dan konfirmasi instalasi.</li>
              <li>Aplikasi akan muncul di desktop Anda.</li>
            </ol>
          </div>

          {/* Android */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold text-center mb-3">Android</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">Untuk pengguna ponsel & tablet Android.</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Buka aplikasi di browser <strong>Google Chrome</strong>.</li>
              <li>Ketuk menu (tiga titik vertikal) di pojok kanan atas.</li>
              <li>Pilih <strong>"Install app"</strong> atau <strong>"Add to Home screen"</strong>.</li>
              <li>Ikuti petunjuk untuk menambahkan ikon ke layar utama.</li>
            </ol>
          </div>

          {/* iOS */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-bold text-center mb-3">iOS (iPhone/iPad)</h3>
            <p className="text-sm text-gray-600 mb-4 text-center">Untuk pengguna perangkat Apple.</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Buka aplikasi di browser <strong>Safari</strong>.</li>
              <li>Ketuk tombol <strong>"Share"</strong> (kotak dengan panah ke atas).</li>
              <li>Gulir ke bawah dan pilih <strong>"Add to Home Screen"</strong>.</li>
              <li>Konfirmasi nama, lalu ketuk <strong>"Add"</strong>.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Developer Deployment Section */}
      <section>
        <h2 className="text-3xl font-semibold text-center mb-6">Panduan Build & Deployment untuk Developer</h2>
        <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
          Aplikasi ini sekarang dikonfigurasi untuk menggunakan proses build untuk mem-bundle semua file JavaScript/TypeScript menjadi satu file yang dioptimalkan untuk production. Ini meningkatkan kinerja dan kompatibilitas.
        </p>
        
        <div className="space-y-8">
          {/* Build Steps */}
          <div>
            <h3 className="text-2xl font-semibold mb-3">Langkah-langkah Proses Build</h3>
            <ol className="list-decimal list-inside space-y-3 bg-gray-50 p-6 rounded-lg border">
              <li>
                <strong>Prasyarat:</strong>
                <p className="text-sm text-gray-600 ml-5">Pastikan Anda memiliki <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Node.js</a> (versi 16 atau lebih baru) dan npm terinstal di komputer Anda.</p>
              </li>
              <li>
                <strong>Setup Proyek:</strong>
                <p className="text-sm text-gray-600 ml-5">Buat file bernama `package.json` di root direktori proyek Anda dan salin konten berikut ke dalamnya:</p>
                <pre className="text-xs bg-slate-800 text-white p-3 rounded-md mt-2 overflow-x-auto">
                  <code>
{`{
  "name": "koperasi-master-app",
  "version": "1.0.0",
  "scripts": {
    "build": "esbuild index.tsx --bundle --outfile=bundle.js --minify --sourcemap",
    "dev": "esbuild index.tsx --bundle --outfile=bundle.js --servedir=./ --watch"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "esbuild": "^0.23.0",
    "typescript": "^5.5.3"
  }
}`}
                  </code>
                </pre>
              </li>
              <li>
                <strong>Instalasi Dependensi:</strong>
                <p className="text-sm text-gray-600 ml-5">Buka terminal di direktori proyek dan jalankan perintah:</p>
                <pre className="text-xs bg-slate-800 text-white p-3 rounded-md mt-2"><code>npm install</code></pre>
              </li>
              <li>
                <strong>Jalankan Build:</strong>
                <p className="text-sm text-gray-600 ml-5">Untuk membuat file bundle untuk production, jalankan:</p>
                 <pre className="text-xs bg-slate-800 text-white p-3 rounded-md mt-2"><code>npm run build</code></pre>
                <p className="text-sm text-gray-600 ml-5 mt-2">Perintah ini akan membuat file baru bernama `bundle.js` di root direktori.</p>
              </li>
            </ol>
          </div>
          
          {/* Deployment Examples */}
          <div>
            <h3 className="text-2xl font-semibold mb-3">Panduan Deployment</h3>
            <div className="space-y-6">
                {/* Vercel */}
                 <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-xl font-bold mb-2">Deploy ke Vercel/Netlify</h4>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Push kode Anda ke repository Git (GitHub, GitLab, dll).</li>
                        <li>Impor repository ke Vercel atau Netlify.</li>
                        <li>Platform akan mendeteksi `package.json` dan menanyakan konfigurasi build.</li>
                        <li>Gunakan pengaturan berikut:</li>
                         <ul className="list-disc list-inside ml-10 text-sm text-gray-600 mt-2">
                          <li><strong>Build Command:</strong> `npm run build`</li>
                          <li><strong>Publish/Output Directory:</strong> `.` (atau biarkan kosong/root)</li>
                          <li><strong>Install Command:</strong> `npm install`</li>
                        </ul>
                        <li>Klik "Deploy". Platform akan menjalankan build dan men-deploy hasilnya.</li>
                    </ol>
                </div>

                {/* Shared Hosting */}
                 <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="text-xl font-bold mb-2">Deploy ke Shared Hosting (cth: Hostinger)</h4>
                     <ol className="list-decimal list-inside space-y-2">
                        <li>Jalankan perintah `npm run build` di komputer lokal Anda.</li>
                        <li>Kompres file-file berikut ke dalam satu file ZIP:
                           <ul className="list-disc list-inside ml-10 text-sm text-gray-600 mt-2">
                             <li>`index.html`</li>
                             <li>`bundle.js` (hasil dari build)</li>
                             <li>`manifest.json`, `sw.js`, `logo.svg`, `metadata.json`</li>
                           </ul>
                        </li>
                        <li>Login ke panel kontrol hosting Anda, buka "File Manager" dan navigasi ke `public_html`.</li>
                        <li>Unggah dan ekstrak file ZIP tersebut. Aplikasi Anda kini dapat diakses melalui domain Anda.</li>
                    </ol>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InstallationPage;