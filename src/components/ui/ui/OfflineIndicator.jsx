import React, { useState, useEffect } from 'react';
import './OfflineIndicator.css';

/**
 * Hook customizado para detectar status online/offline
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Se estava offline, marca como reconectado
      if (!navigator.onLine || wasOffline) {
        setWasOffline(true);
        // Remove o status de reconectado após 3 segundos
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

/**
 * Componente OfflineIndicator
 * @description Indica o status da conexão de internet
 * @param {Object} props - Propriedades do componente
 * @param {string} props.position - Posição do indicador ('top', 'bottom', 'fixed-top', 'fixed-bottom')
 * @param {boolean} props.showOnline - Se deve mostrar indicador quando online
 * @param {string} props.onlineMessage - Mensagem personalizada quando online
 * @param {string} props.offlineMessage - Mensagem personalizada quando offline
 * @param {string} props.reconnectedMessage - Mensagem quando reconecta
 * @param {Function} props.onStatusChange - Callback executado quando status muda
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.compact - Versão compacta do indicador
 * @param {boolean} props.showIcon - Se deve mostrar ícone
 * @param {number} props.hideDelay - Delay para esconder após reconectar (ms)
 */
const OfflineIndicator = ({
  position = 'fixed-top',
  showOnline = true,
  onlineMessage = 'Você está online',
  offlineMessage = 'Você está offline. Verifique sua conexão.',
  reconnectedMessage = 'Conexão restabelecida!',
  onStatusChange,
  className = '',
  compact = false,
  showIcon = true,
  hideDelay = 3000,
  ...props
}) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Effect para gerenciar visibilidade
  useEffect(() => {
    if (!isOnline) {
      // Sempre mostra quando offline
      setIsVisible(true);
      setShowReconnected(false);
    } else if (wasOffline && isOnline) {
      // Mostra mensagem de reconexão
      setShowReconnected(true);
      setIsVisible(true);
      
      // Esconde após o delay
      const timer = setTimeout(() => {
        setShowReconnected(false);
        if (!showOnline) {
          setIsVisible(false);
        }
      }, hideDelay);

      return () => clearTimeout(timer);
    } else if (showOnline) {
      // Mostra quando online se configurado
      setIsVisible(true);
      setShowReconnected(false);
    } else {
      // Esconde se não deve mostrar quando online
      setIsVisible(false);
      setShowReconnected(false);
    }
  }, [isOnline, wasOffline, showOnline, hideDelay]);

  // Callback para mudança de status
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(isOnline);
    }
  }, [isOnline, onStatusChange]);

  // Se não deve ser visível, não renderiza
  if (!isVisible) return null;

  // Determina o status atual para exibição
  const getCurrentStatus = () => {
    if (showReconnected) {
      return {
        type: 'reconnected',
        message: reconnectedMessage,
        icon: 'reconnected'
      };
    } else if (isOnline) {
      return {
        type: 'online',
        message: onlineMessage,
        icon: 'online'
      };
    } else {
      return {
        type: 'offline',
        message: offlineMessage,
        icon: 'offline'
      };
    }
  };

  const status = getCurrentStatus();

  // Classes CSS dinâmicas
  const indicatorClasses = [
    'offline-indicator',
    `offline-indicator--${position}`,
    `offline-indicator--${status.type}`,
    compact && 'offline-indicator--compact',
    className
  ].filter(Boolean).join(' ');

  // Ícones para cada status
  const getIcon = (iconType) => {
    const icons = {
      online: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="status-icon">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      offline: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="status-icon">
          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9l1.293 1.293a1 1 0 01-1.414 1.414L8 10.414l-1.293 1.293a1 1 0 01-1.414-1.414L6.586 9 5.293 7.707a1 1 0 011.414-1.414L8 7.586l1.293-1.293a1 1 0 011.414 0zm4 0a1 1 0 010 1.414L13.414 9l1.293 1.293a1 1 0 01-1.414 1.414L12 10.414l-1.293 1.293a1 1 0 01-1.414-1.414L10.586 9 9.293 7.707a1 1 0 011.414-1.414L12 7.586l1.293-1.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      reconnected: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="status-icon">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      )
    };
    return icons[iconType] || icons.offline;
  };

  return (
    <div 
      className={indicatorClasses}
      role="status"
      aria-live="polite"
      aria-label={`Status da conexão: ${status.message}`}
      {...props}
    >
      <div className="indicator-content">
        {showIcon && (
          <div className="indicator-icon">
            {getIcon(status.icon)}
          </div>
        )}
        
        <span className="indicator-message">
          {status.message}
        </span>

        {/* Indicador de pulso para offline */}
        {!isOnline && (
          <div className="connection-pulse" aria-hidden="true">
            <div className="pulse-dot"></div>
          </div>
        )}
      </div>

      {/* Barra de progresso para reconexão */}
      {showReconnected && (
        <div className="reconnection-bar" aria-hidden="true">
          <div 
            className="reconnection-progress"
            style={{ animationDuration: `${hideDelay}ms` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Componentes de conveniência
OfflineIndicator.Fixed = (props) => (
  <OfflineIndicator position="fixed-top" {...props} />
);

OfflineIndicator.Banner = (props) => (
  <OfflineIndicator position="top" showOnline={false} {...props} />
);

OfflineIndicator.Compact = (props) => (
  <OfflineIndicator compact showOnline={false} {...props} />
);

OfflineIndicator.FloatingDot = (props) => (
  <OfflineIndicator 
    position="fixed-bottom" 
    compact 
    showIcon={false}
    className="floating-dot"
    {...props} 
  />
);

export default OfflineIndicator;
