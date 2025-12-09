
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Page, User, Product, CartItem, PaymentMethod, AboutPageContent, BankName, DigitalWalletProvider } from '../types';
import { api } from '../services/api';

interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}

type ToastType = 'success' | 'error';
interface Toast {
  message: string;
  type: ToastType;
}

interface AppContextType {
  currentPage: Page;
  currentPageId: number | string | null;
  setCurrentPage: (page: Page, id?: number | string | null) => void;
  currentUser: User | null;
  updateCurrentUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  isLogoutModalOpen: boolean;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  enabledPaymentMethods: PaymentMethod[];
  setEnabledPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  bankDetails: BankDetails | null;
  setBankDetails: (details: BankDetails | null) => void;
  featuredProductId: number | null;
  setFeaturedProductId: (id: number | null) => void;
  toast: Toast | null;
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
  applicationFee: number;
  setApplicationFee: (fee: number) => void;
  aboutPageContent: AboutPageContent;
  setAboutPageContent: (content: AboutPageContent) => void;
  enabledBanks: BankName[];
  setEnabledBanks: React.Dispatch<React.SetStateAction<BankName[]>>;
  enabledDigitalWallets: DigitalWalletProvider[];
  setEnabledDigitalWallets: React.Dispatch<React.SetStateAction<DigitalWalletProvider[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const onlinePaymentMethods = [PaymentMethod.COD, PaymentMethod.BANK_TRANSFER, PaymentMethod.DIGITAL_WALLET, PaymentMethod.QRIS];
const defaultBanks = [BankName.BCA, BankName.MANDIRI, BankName.BRI, BankName.BNI];
const defaultWallets = [DigitalWalletProvider.GOPAY, DigitalWalletProvider.OVO, DigitalWalletProvider.DANA];


const defaultAboutContent: AboutPageContent = {
    title: 'Tentang Koperasi MASTER',
    subtitle: 'Membangun Kesejahteraan Bersama Melalui Usaha Mandiri',
    visionTitle: 'Visi Kami',
    visionText: 'Menjadi koperasi yang unggul, modern, dan terpercaya dalam menyediakan kebutuhan anggota dan masyarakat serta meningkatkan kesejahteraan bersama secara berkelanjutan.',
    missionTitle: 'Misi Kami',
    missionItems: [
        'Menyediakan produk berkualitas dengan harga yang kompetitif.',
        'Memberikan pelayanan prima dan profesional kepada seluruh anggota.',
        'Mengembangkan usaha-usaha produktif yang inovatif dan relevan.',
        'Meningkatkan partisipasi aktif anggota dalam pembangunan koperasi.',
    ],
    historyTitle: 'Sejarah Singkat',
    historyText: 'Koperasi MASTER didirikan pada tahun 2010 oleh sekelompok masyarakat yang memiliki semangat gotong royong dan keinginan untuk memajukan perekonomian lokal. Berawal dari sebuah toko kecil yang sederhana, kami telah bertumbuh menjadi sebuah unit usaha yang melayani ratusan anggota dan pelanggan di wilayah Banyumas dan sekitarnya. Dengan berpegang teguh pada prinsip dari anggota, oleh anggota, dan untuk anggota, kami terus berkomitmen untuk memberikan manfaat yang sebesar-besarnya bagi semua.',
    galleryTitle: 'Galeri Kami',
    galleryImages: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1740&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1556740738-b6a63e2775df?q=80&w=1740&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1601599561213-832382a87b8a?q=80&w=1740&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=1740&auto=format&fit=crop',
    ],
    locationTitle: 'Temukan Kami',
    locationMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.3392306788226!2d109.07785337499426!3d-7.31590499269094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6f8a4e12345679%3A0x8a9b0c1d2e3f4g5h!2sKoperasi%20MASTER!5e0!3m2!1sen!2sid!4v1625828456789!5m2!1sen!2sid',
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, _setCurrentPage] = useState<Page>(Page.HOME);
  const [currentPageId, setCurrentPageId] = useState<number | string | null>(null);
  
  // User & Cart still use localStorage for session persistence across refreshes
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [compareItems, setCompareItems] = useState<Product[]>(() => {
    const savedCompare = localStorage.getItem('compareItems');
    return savedCompare ? JSON.parse(savedCompare) : [];
  });
  
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Settings loaded from DB (initially defaults, then updated)
  const [logoUrl, _setLogoUrl] = useState<string>('/logo.svg');
  const [enabledPaymentMethods, _setEnabledPaymentMethods] = useState<PaymentMethod[]>(onlinePaymentMethods);
  const [enabledBanks, _setEnabledBanks] = useState<BankName[]>(defaultBanks);
  const [enabledDigitalWallets, _setEnabledDigitalWallets] = useState<DigitalWalletProvider[]>(defaultWallets);
  const [bankDetails, _setBankDetails] = useState<BankDetails | null>(null);
  const [lowStockThreshold, _setLowStockThreshold] = useState<number>(5);
  const [applicationFee, _setApplicationFee] = useState<number>(0);
  const [aboutPageContent, _setAboutPageContent] = useState<AboutPageContent>(defaultAboutContent);

  const [featuredProductId, _setFeaturedProductId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('featuredProductId');
    return savedId ? JSON.parse(savedId) : null;
  });
  
  const [toast, setToast] = useState<Toast | null>(null);

  // Load Settings from Supabase on Mount
  useEffect(() => {
    const initSettings = async () => {
        try {
            // Load Site Settings
            const settings = await api.fetchSiteSettings();
            if (settings) {
                if (settings.logoUrl) _setLogoUrl(settings.logoUrl);
                if (settings.enabledPaymentMethods) _setEnabledPaymentMethods(settings.enabledPaymentMethods);
                if (settings.enabledBanks) _setEnabledBanks(settings.enabledBanks);
                if (settings.enabledDigitalWallets) _setEnabledDigitalWallets(settings.enabledDigitalWallets);
                if (settings.bankDetails) _setBankDetails(settings.bankDetails);
                if (settings.lowStockThreshold !== undefined) _setLowStockThreshold(settings.lowStockThreshold);
                if (settings.applicationFee !== undefined) _setApplicationFee(settings.applicationFee);
            } else {
                // Initialize default settings in DB if none exist
                await api.updateSiteSettings({
                    logoUrl: '/logo.svg',
                    enabledPaymentMethods: onlinePaymentMethods,
                    enabledBanks: defaultBanks,
                    enabledDigitalWallets: defaultWallets,
                    lowStockThreshold: 5,
                    applicationFee: 0
                });
            }

            // Load About Page
            const about = await api.fetchAboutPage();
            if (about) {
                _setAboutPageContent(about);
            } else {
                await api.updateAboutPage(defaultAboutContent);
            }
        } catch (error) {
            console.error("Failed to load settings from DB:", error);
        }
    };
    initSettings();
  }, []);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);
  
  useEffect(() => {
    if (featuredProductId) {
      localStorage.setItem('featuredProductId', JSON.stringify(featuredProductId));
    } else {
      localStorage.removeItem('featuredProductId');
    }
  }, [featuredProductId]);


  // Wrapper setters that update state AND save to DB
  const setLogoUrl = (url: string) => {
    _setLogoUrl(url);
    api.updateSiteSettings({ logoUrl: url });
  };

  const setEnabledPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>> = (value) => {
      // Handle functional update
      _setEnabledPaymentMethods(prev => {
          const newVal = value instanceof Function ? value(prev) : value;
          api.updateSiteSettings({ enabledPaymentMethods: newVal });
          return newVal;
      });
  };

  const setEnabledBanks: React.Dispatch<React.SetStateAction<BankName[]>> = (value) => {
      _setEnabledBanks(prev => {
          const newVal = value instanceof Function ? value(prev) : value;
          api.updateSiteSettings({ enabledBanks: newVal });
          return newVal;
      });
  };

   const setEnabledDigitalWallets: React.Dispatch<React.SetStateAction<DigitalWalletProvider[]>> = (value) => {
      _setEnabledDigitalWallets(prev => {
          const newVal = value instanceof Function ? value(prev) : value;
          api.updateSiteSettings({ enabledDigitalWallets: newVal });
          return newVal;
      });
  };

  const setBankDetails = (details: BankDetails | null) => {
    _setBankDetails(details);
    api.updateSiteSettings({ bankDetails: details });
  };

  const setLowStockThreshold = (threshold: number) => {
    _setLowStockThreshold(threshold);
    api.updateSiteSettings({ lowStockThreshold: threshold });
  };

  const setApplicationFee = (fee: number) => {
    _setApplicationFee(fee);
    api.updateSiteSettings({ applicationFee: fee });
  };

  const setAboutPageContent = (content: AboutPageContent) => {
    _setAboutPageContent(content);
    api.updateAboutPage(content);
  };
  
  // Featured Product ID is simpler, can stay local or use DB if needed. 
  // For now keeping it local storage via effect above.
  const setFeaturedProductId = (id: number | null) => {
    _setFeaturedProductId(id);
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const setCurrentPage = (page: Page, id: number | string | null = null) => {
    _setCurrentPage(page);
    setCurrentPageId(id);
    window.scrollTo(0, 0);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    setCurrentPage(Page.HOME);
    showToast(`Selamat datang kembali, ${user.fullName}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage(Page.HOME);
    showToast('Anda telah berhasil logout.', 'success');
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };
  
  const addToCompare = (product: Product) => {
    setCompareItems(prev => {
      if (prev.some(p => p.id === product.id) || prev.length >= 3) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: number) => {
    setCompareItems(prev => prev.filter(p => p.id !== productId));
  };
  
  const clearCompare = () => {
    setCompareItems([]);
  };
  
  const openCompareModal = () => setIsCompareModalOpen(true);
  const closeCompareModal = () => setIsCompareModalOpen(false);

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);


  return (
    <AppContext.Provider
      value={{
        currentPage,
        currentPageId,
        setCurrentPage,
        currentUser,
        updateCurrentUser,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareModalOpen,
        openCompareModal,
        closeCompareModal,
        isLogoutModalOpen,
        openLogoutModal,
        closeLogoutModal,
        logoUrl,
        setLogoUrl,
        enabledPaymentMethods,
        setEnabledPaymentMethods,
        bankDetails,
        setBankDetails,
        featuredProductId,
        setFeaturedProductId,
        toast,
        showToast,
        hideToast,
        lowStockThreshold,
        setLowStockThreshold,
        applicationFee,
        setApplicationFee,
        aboutPageContent,
        setAboutPageContent,
        enabledBanks,
        setEnabledBanks,
        enabledDigitalWallets,
        setEnabledDigitalWallets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
