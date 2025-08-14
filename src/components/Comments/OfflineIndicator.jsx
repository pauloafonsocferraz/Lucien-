import React, { useState, useEffect } from 'react';

const OfflineIndicator = ({ 
  onRetry = null,
  showRetryButton = true,
  className = ""
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Monitorar mudanças na conexão
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Conexão restaurada');
      setConnectionAttempts(0);
    };

    const handleOffline = () => {
      console.log('📡 Conexão perdida');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setConnectionAttempts(prev => prev + 1);

    try {
      // Tentar ping simples
      await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });

      // Se chegou aqui, conexão foi restaurada
      if (onRetry) {
        await onRetry();
      }
    } catch (error) {
      console.log('❌ Ainda sem conexão');
    } finally {
      setIsRetrying(false);
    }
  };

  // Auto-retry periódico
  useEffect(() => {
    if (!navigator.onLine && connectionAttempts < 5) {
      const retryInterval = setInterval(() => {
        if (navigator.onLine) {
          clearInterval(retryInterval);
          return;
        }
        
        handleRetry();
      }, 30000); // Tentar a cada 30 segundos

      return () => clearInterval(retryInterval);
    }
  }, [connectionAttempts]);

  return (
    <div className={`offline-indicator ${className}`}>
      <div className="offline-content">
        <span className="offline-icon">
          📡
        </span>
        
        <div className="offline-message">
          <strong>Sem conexão com a internet</strong>
          <p>
            Seus comentários serão salvos localmente e enviados quando a conexão for restaurada.
          </p>
          
          {connectionAttempts > 0 && (
            <small>
              Tentativas de reconexão: {connectionAttempts}
            </small>
          )}
        </div>

        {showRetryButton && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="retry-connection-btn"
            title="Tentar reconectar"
          >
            {isRetrying ? '🔄 Tentando...' : '🔄 Tentar Agora'}
          </button>
        )}
      </div>

      <div className="offline-tips">
        <details>
          <summary>💡 Dicas para modo offline</summary>
          <ul>
            <li>Seus comentários ficam salvos no navegador</li>
            <li>Eles serão enviados automaticamente quando voltar online</li>
            <li>Não feche a aba para não perder os dados</li>
            <li>Verifique sua conexão de internet</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default OfflineIndicator;
