import { useEffect, useState } from 'react';

const Toast = ({ id, type, title, message, onClose, duration = 3000 }) => {
const [isExiting, setIsExiting] = useState(false);

useEffect(() => {
const timer = setTimeout(() => {
    handleClose();
}, duration);

return () => clearTimeout(timer);
}, [duration]);

const handleClose = () => {
setIsExiting(true);
setTimeout(() => {
    onClose(id);
}, 300);
};

const getIcon = () => {
switch (type) {
    case 'success':
    return '✓';
    case 'error':
    return '✗';
    case 'warning':
    return '⚠';
    case 'info':
    return 'ℹ';
    default:
    return '•';
}
};

const getTitle = () => {
switch (type) {
    case 'success':
    return title || 'Sucesso!';
    case 'error':
    return title || 'Erro!';
    case 'warning':
    return title || 'Atenção!';
    case 'info':
    return title || 'Informação';
    default:
    return title || 'Notificação';
}
};

return (
<div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
    <div className="toast-icon">{getIcon()}</div>
    <div className="toast-content">
    <div className="toast-title">{getTitle()}</div>
    <div className="toast-message">{message}</div>
    </div>
    <button onClick={handleClose} className="toast-close">×</button>
    <div className="toast-progress">
    <div className="toast-progress-bar" style={{ color: type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6' }} />
    </div>
</div>
);
};

export default Toast;