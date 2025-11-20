import React, { useRef, useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { PaymentMethod, BankName, DigitalWalletProvider } from '../../types';

const onlinePaymentMethods = [PaymentMethod.COD, PaymentMethod.BANK_TRANSFER, PaymentMethod.DIGITAL_WALLET, PaymentMethod.QRIS];
const allBanks = Object.values(BankName);
const allWallets = Object.values(DigitalWalletProvider);

const SiteSettings: React.FC = () => {
  const { 
    logoUrl, 
    setLogoUrl,
    enabledPaymentMethods,
    setEnabledPaymentMethods,
    bankDetails,
    setBankDetails,
    lowStockThreshold,
    setLowStockThreshold,
    applicationFee,
    setApplicationFee,
    showToast,
    enabledBanks,
    setEnabledBanks,
    enabledDigitalWallets,
    setEnabledDigitalWallets,
  } = useAppContext();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localBankDetails, setLocalBankDetails] = useState({
    bankName: 'Bank Mandiri',
    accountHolder: 'Koperasi MASTER',
    accountNumber: '1234567890'
  });
  const [bankFormMessage, setBankFormMessage] = useState('');
  const [localThreshold, setLocalThreshold] = useState(lowStockThreshold);
  const [localApplicationFee, setLocalApplicationFee] = useState(applicationFee);

  useEffect(() => {
    if (bankDetails) {
      setLocalBankDetails(bankDetails);
    }
  }, [bankDetails]);

  useEffect(() => {
    setLocalThreshold(lowStockThreshold);
  }, [lowStockThreshold]);

  useEffect(() => {
    setLocalApplicationFee(applicationFee);
  }, [applicationFee]);


  const handleLogoChangeClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
      if (window.confirm('Apakah Anda yakin ingin mengembalikan logo ke default?')) {
          setLogoUrl('/logo.svg');
      }
  };

  const handlePaymentMethodToggle = (method: PaymentMethod, isEnabled: boolean) => {
    setEnabledPaymentMethods(prev => {
      const newSet = new Set(prev);
      if (isEnabled) {
        newSet.add(method);
      } else {
        newSet.delete(method);
      }
      return Array.from(newSet);
    });
  };

  const handleBankToggle = (bank: BankName, isEnabled: boolean) => {
    setEnabledBanks(prev => {
        const newSet = new Set(prev);
        if (isEnabled) newSet.add(bank);
        else newSet.delete(bank);
        return Array.from(newSet);
    });
  };

  const handleWalletToggle = (wallet: DigitalWalletProvider, isEnabled: boolean) => {
    setEnabledDigitalWallets(prev => {
        const newSet = new Set(prev);
        if (isEnabled) newSet.add(wallet);
        else newSet.delete(wallet);
        return Array.from(newSet);
    });
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalBankDetails(prev => ({...prev, [name]: value}));
  };
  
  const handleBankDetailsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setBankDetails(localBankDetails);
    setBankFormMessage('Informasi bank berhasil disimpan!');
    setTimeout(() => setBankFormMessage(''), 3000);
  };
  
  const handleThresholdSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newThreshold = Number(localThreshold);
    if (newThreshold >= 0) {
      setLowStockThreshold(newThreshold);
      showToast(`Ambang batas stok rendah berhasil diubah menjadi ${newThreshold}.`, 'success');
    } else {
      showToast('Ambang batas harus berupa angka positif.', 'error');
    }
  };

  const handleFeeSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newFee = Number(localApplicationFee);
    if (newFee >= 0) {
        setApplicationFee(newFee);
        showToast(`Biaya aplikasi berhasil diubah menjadi ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(newFee)}.`, 'success');
    } else {
        showToast('Biaya aplikasi harus berupa angka positif.', 'error');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Pengaturan Situs</h3>
      
      {/* Logo Settings */}
      <div className="mt-6 border rounded-lg p-6">
        <h4 className="font-semibold text-lg mb-2">Logo Aplikasi</h4>
        <p className="text-sm text-gray-600 mb-4">Logo ini akan muncul di header, invoice, dan tab browser. Direkomendasikan format SVG atau PNG transparan.</p>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-100 border rounded-lg flex items-center justify-center p-2">
            <img src={logoUrl} alt="Current Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/png, image/jpeg, image/svg+xml"
            />
            <button 
              onClick={handleLogoChangeClick}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
            >
              Ubah Logo
            </button>
            {logoUrl !== '/logo.svg' && (
              <button 
                onClick={handleResetLogo}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fee and Inventory Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Inventory Settings */}
        <div className="border rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-2">Pengaturan Inventaris</h4>
          <p className="text-sm text-gray-600 mb-4">Atur notifikasi untuk level stok produk.</p>
          <form className="max-w-md" onSubmit={handleThresholdSave}>
            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Ambang Batas Notifikasi Stok Rendah</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                value={localThreshold}
                onChange={(e) => setLocalThreshold(Number(e.target.value))}
                className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                min="0"
              />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
                Simpan
              </button>
            </div>
          </form>
        </div>

         {/* Application Fee Settings */}
         <div className="border rounded-lg p-6">
          <h4 className="font-semibold text-lg mb-2">Pengaturan Biaya</h4>
          <p className="text-sm text-gray-600 mb-4">Atur biaya tambahan untuk setiap transaksi.</p>
          <form className="max-w-md" onSubmit={handleFeeSave}>
            <label htmlFor="applicationFee" className="block text-sm font-medium text-gray-700">Biaya Aplikasi (Rp)</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="number"
                id="applicationFee"
                name="applicationFee"
                value={localApplicationFee}
                onChange={(e) => setLocalApplicationFee(Number(e.target.value))}
                className="block w-40 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                min="0"
              />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Payment and Bank Settings */}
      <div className="mt-6 border rounded-lg p-6">
        <h4 className="font-semibold text-lg mb-2">Pengaturan Pembayaran</h4>
        <p className="text-sm text-gray-600 mb-4">Pilih metode pembayaran yang akan tersedia bagi pelanggan saat checkout.</p>
        <div className="space-y-3">
          {onlinePaymentMethods.map(method => (
            <label key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
              <span className="font-medium text-gray-700">{method}</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enabledPaymentMethods.includes(method)}
                  onChange={(e) => handlePaymentMethodToggle(method, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          ))}
        </div>

        {/* Payment Provider Choices */}
        <div className="mt-8 border-t pt-6">
            <h4 className="font-semibold text-lg mb-2">Pilihan Penyedia Pembayaran</h4>
             <p className="text-sm text-gray-600 mb-4">Atur bank dan dompet digital yang bisa dipilih oleh pelanggan.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h5 className="font-semibold mb-3">Bank Tersedia</h5>
                    <div className="space-y-2">
                        {allBanks.map(bank => (
                            <label key={bank} className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={enabledBanks.includes(bank)}
                                    onChange={(e) => handleBankToggle(bank, e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{bank}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div>
                    <h5 className="font-semibold mb-3">Dompet Digital Tersedia</h5>
                    <div className="space-y-2">
                        {allWallets.map(wallet => (
                            <label key={wallet} className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={enabledDigitalWallets.includes(wallet)}
                                    onChange={(e) => handleWalletToggle(wallet, e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-700">{wallet}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
           <div className="flex justify-between items-center mb-2">
             <h4 className="font-semibold text-lg">Informasi Rekening (untuk Transfer Bank)</h4>
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${bankDetails ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {bankDetails ? 'Terhubung' : 'Belum Terhubung'}
             </span>
           </div>
           <p className="text-sm text-gray-600 mb-4">Informasi ini akan ditampilkan kepada pelanggan yang memilih metode pembayaran "Transfer Bank".</p>
            {!enabledPaymentMethods.includes(PaymentMethod.BANK_TRANSFER) && (
              <div className="p-3 bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400 text-sm rounded-r-lg">
                Metode "Transfer Bank" sedang tidak aktif. Aktifkan untuk menampilkan form ini kepada pelanggan.
              </div>
            )}
           <form className="space-y-4 mt-4" onSubmit={handleBankDetailsSave}>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="bankName">Nama Bank di Rekening</label>
                <input type="text" name="bankName" id="bankName" value={localBankDetails.bankName} onChange={handleBankDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="accountHolder">Nama Pemilik Rekening</label>
                <input type="text" name="accountHolder" id="accountHolder" value={localBankDetails.accountHolder} onChange={handleBankDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="accountNumber">Nomor Rekening</label>
                <input type="text" name="accountNumber" id="accountNumber" value={localBankDetails.accountNumber} onChange={handleBankDetailsChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div className="text-right">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">Simpan Informasi Bank</button>
              </div>
              {bankFormMessage && <p className="text-sm text-green-600 text-right mt-2">{bankFormMessage}</p>}
           </form>
        </div>
      </div>

    </div>
  );
};

export default SiteSettings;