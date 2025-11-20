import React, { useEffect, useState } from 'react';
import { XIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const TOAST_DURATION = 5000; // 5 seconds

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, TOAST_DURATION);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setIsFadingOut(true);
    // Allow fade-out animation to complete before calling onClose
    setTimeout(() => {
        onClose();
    }, 500);
  };

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircleIcon : AlertTriangleIcon;
  const animationClass = isFadingOut ? 'animate-fade-out' : 'animate-slide-in-down';

  return (
    <div
      className={`fixed top-24 right-4 z-[100] w-full max-w-sm text-white rounded-lg shadow-2xl ${bgColor} ${animationClass}`}
      role="alert"
    >
      <div className="flex items-center p-4">
        <div className="flex-shrink-0">
            <Icon className="h-6 w-6"/>
        </div>
        <div className="ml-3 flex-1 font-medium">
          {message}
        </div>
        <button
          onClick={handleClose}
          className="ml-4 -mr-1 -mt-1 p-1 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span className="sr-only">Tutup</span>
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;