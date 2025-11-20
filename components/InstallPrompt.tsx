import React from 'react';
import { XIcon } from './Icons';
import { useAppContext } from '../context/AppContext';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  const { logoUrl } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-surface rounded-lg shadow-2xl p-6 border animate-fade-in-up">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <img src={logoUrl} alt="App Logo" className="h-12 w-12" />
          <div>
            <h3 className="font-bold text-lg text-primary">Instal Aplikasi Koperasi MASTER</h3>
            <p className="text-sm text-gray-600">Akses lebih cepat dan mudah, bahkan saat offline.</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex justify-end space-x-3">
        <button onClick={onDismiss} className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100">
          Nanti Saja
        </button>
        <button onClick={onInstall} className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover">
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;