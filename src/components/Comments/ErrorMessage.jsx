import React, { useEffect, useState } from 'react';

const ErrorMessage = ({ 
  message, 
  type = 'error', 
  onDismiss = null,
  autoDismiss = 10000,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      setTimeout(onDismiss, 300); // Aguarda animação
    }
  };

  if (!isVisible || !message) {
    return null;
  }

  const typeIcons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅'
  };

  return (
    <div className={`error-message ${type} ${className}`}>
      <div className="error-content">
        <span className="error-icon">
          {typeIcons[type] || typeIcons.error}
        </span>
        
        <div className="error-text">
          {typeof message === 'string' ? (
            <p>{message}</p>
          ) : (
            message
          )}
        </div>

        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="error-dismiss"
            title="Fechar"
          >
            ✕
          </button>
        )}
      </div>

      {autoDismiss > 0 && (
        <div 
          className="error-progress"
          style={{ 
            animationDuration: `${autoDismiss}ms`
          }}
        />
      )}
    </div>
  );
};

export default ErrorMessage;
