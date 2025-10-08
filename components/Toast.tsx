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
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-liver text-seasalt font-bold py-3 px-6 text-base text-center max-w-[90vw] rounded-xl z-50 toast-animation border-2 border-seasalt shadow-[4px_4px_0px_#FAF9F7]">
      {message}
    </div>
  );
};

export default Toast;