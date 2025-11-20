import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Page, User, Product, CartItem, PaymentMethod, AboutPageContent, BankName, DigitalWalletProvider } from '../types';

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
  const [logoUrl, _setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('customLogo') || '/logo.svg';
  });
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<PaymentMethod[]>(() => {
    const savedMethods = localStorage.getItem('enabledPaymentMethods');
    // By default, enable all online payment methods if nothing is saved
    return savedMethods ? JSON.parse(savedMethods) : onlinePaymentMethods;
  });
   const [enabledBanks, setEnabledBanks] = useState<BankName[]>(() => {
    const savedBanks = localStorage.getItem('enabledBanks');
    return savedBanks ? JSON.parse(savedBanks) : defaultBanks;
  });
  const [enabledDigitalWallets, setEnabledDigitalWallets] = useState<DigitalWalletProvider[]>(() => {
    const savedWallets = localStorage.getItem('enabledDigitalWallets');
    return savedWallets ? JSON.parse(savedWallets) : defaultWallets;
  });
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(() => {
    const savedDetails = localStorage.getItem('bankDetails');
    return savedDetails ? JSON.parse(savedDetails) : null;
  });
  const [featuredProductId, _setFeaturedProductId] = useState<number | null>(() => {
    const savedId = localStorage.getItem('featuredProductId');
    return savedId ? JSON.parse(savedId) : null;
  });
  const [toast, setToast] = useState<Toast | null>(null);
  const [lowStockThreshold, _setLowStockThreshold] = useState<number>(() => {
    const savedThreshold = localStorage.getItem('lowStockThreshold');
    return savedThreshold ? JSON.parse(savedThreshold) : 5; // Default to 5
  });
  const [applicationFee, _setApplicationFee] = useState<number>(() => {
    const savedFee = localStorage.getItem('applicationFee');
    return savedFee ? JSON.parse(savedFee) : 0; // Default to 0
  });
  const [aboutPageContent, _setAboutPageContent] = useState<AboutPageContent>(() => {
    const savedContent = localStorage.getItem('aboutPageContent');
    return savedContent ? JSON.parse(savedContent) : defaultAboutContent;
  });

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
    if (logoUrl && logoUrl !== '/logo.svg') {
      localStorage.setItem('customLogo', logoUrl);
    } else {
      localStorage.removeItem('customLogo');
    }
  }, [logoUrl]);

  useEffect(() => {
    localStorage.setItem('enabledPaymentMethods', JSON.stringify(enabledPaymentMethods));
  }, [enabledPaymentMethods]);

  useEffect(() => {
    localStorage.setItem('enabledBanks', JSON.stringify(enabledBanks));
  }, [enabledBanks]);

  useEffect(() => {
    localStorage.setItem('enabledDigitalWallets', JSON.stringify(enabledDigitalWallets));
  }, [enabledDigitalWallets]);

  useEffect(() => {
    if (bankDetails) {
      localStorage.setItem('bankDetails', JSON.stringify(bankDetails));
    } else {
      localStorage.removeItem('bankDetails');
    }
  }, [bankDetails]);
  
  useEffect(() => {
    if (featuredProductId) {
      localStorage.setItem('featuredProductId', JSON.stringify(featuredProductId));
    } else {
      localStorage.removeItem('featuredProductId');
    }
  }, [featuredProductId]);

  useEffect(() => {
    localStorage.setItem('lowStockThreshold', JSON.stringify(lowStockThreshold));
  }, [lowStockThreshold]);

  useEffect(() => {
    localStorage.setItem('applicationFee', JSON.stringify(applicationFee));
  }, [applicationFee]);

  useEffect(() => {
    localStorage.setItem('aboutPageContent', JSON.stringify(aboutPageContent));
  }, [aboutPageContent]);

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

  const setLogoUrl = (url: string) => {
    _setLogoUrl(url);
  };

  const setFeaturedProductId = (id: number | null) => {
    _setFeaturedProductId(id);
  };

  const setLowStockThreshold = (threshold: number) => {
    _setLowStockThreshold(threshold);
  };

  const setApplicationFee = (fee: number) => {
    _setApplicationFee(fee);
  };
  
  const setAboutPageContent = (content: AboutPageContent) => {
    _setAboutPageContent(content);
  };

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