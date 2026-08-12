// src/hooks/useToasts.js
import { useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, title = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}
