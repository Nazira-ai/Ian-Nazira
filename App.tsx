
import React, { useEffect, useState } from 'react';
import { useAppContext } from './context/AppContext';
import { Page } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import OrderDetailsPage from './pages/OrderDetailsPage';
import InvoicePage from './pages/InvoicePage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import InstallPrompt from './components/InstallPrompt';
import Toast from './components/Toast';
import LogoutConfirmationModal from './components/LogoutConfirmationModal';
import RegisterSupplierPage from './pages/RegisterSupplierPage';

// Define the event type for better TypeScript support
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const App: React.FC = () => {
  const { currentPage, currentPageId, isCompareModalOpen, isLogoutModalOpen, logoUrl, toast, hideToast } = useAppContext();

  // State for PWA installation prompt
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      
      // Check if the app is already installed. If not, show the prompt.
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
         // Use a session storage item to only show it once per session if dismissed
        if (!sessionStorage.getItem('installPromptDismissed')) {
          setIsInstallPromptVisible(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) {
      return;
    }
    // Show the install prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Hide the custom prompt regardless of the choice
      setIsInstallPromptVisible(false);
      setInstallPromptEvent(null);
    });
  };

  const handleDismissInstallClick = () => {
    setIsInstallPromptVisible(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      // Fix: Corrected typo from HTmplLinkElement to HTMLLinkElement
      (favicon as HTMLLinkElement).href = logoUrl;
    }
  }, [logoUrl]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <HomePage />;
      case Page.PRODUCT_DETAIL:
        return <ProductDetailPage productId={currentPageId as number} />;
      case Page.LOGIN:
        return <LoginPage />;
      case Page.REGISTER:
        return <RegisterPage />;
      case Page.CART:
        return <CartPage />;
      case Page.CHECKOUT:
        return <CheckoutPage />;
      case Page.DASHBOARD:
        return <DashboardPage />;
      case Page.ORDER_DETAIL:
        return <OrderDetailsPage orderId={currentPageId as string} />;
      case Page.INVOICE:
        return <InvoicePage orderId={currentPageId as string} />;
      case Page.ABOUT:
        return <AboutPage />;
      case Page.PROFILE:
        return <ProfilePage />;
      case Page.REGISTER_SUPPLIER:
        return <RegisterSupplierPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderPage()}
      </main>
      <Footer />
      <CompareBar />
      {isCompareModalOpen && <CompareModal />}
      {isLogoutModalOpen && <LogoutConfirmationModal />}
      {isInstallPromptVisible && installPromptEvent && (
        <InstallPrompt
          onInstall={handleInstallClick}
          onDismiss={handleDismissInstallClick}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default App;
