import { useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  // so um toast por vez, o novo substitui o anterior em vez de empilhar
  const addToast = (type, message, title = null) => {
    const id = Date.now();
    setToasts([{ id, type, message, title }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}
