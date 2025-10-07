import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Disappear after 3 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-bold py-2 px-4 text-sm sm:py-3 sm:px-6 sm:text-base text-center max-w-[90vw] rounded-full shadow-lg z-50 animate-fadeIn">
      {message}
    </div>
  );
};

export default Toast;