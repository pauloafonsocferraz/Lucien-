import React from 'react';
import './ErrorMessage.css';

/**
 * Componente ErrorMessage
 * @description Exibe mensagens de erro com diferentes níveis de severidade
 * @param {Object} props - Propriedades do componente
 * @param {string|Error} props.error - Mensagem de erro ou objeto Error
 * @param {string} props.type - Tipo do erro ('error', 'warning', 'info')
 * @param {string} props.size - Tamanho ('small', 'medium', 'large')
 * @param {boolean} props.dismissible - Se pode ser fechado pelo usuário
 * @param {Function} props.onDismiss - Callback executado ao fechar
 * @param {boolean} props.showIcon - Se deve mostrar ícone
 * @param {string} props.title - Título opcional
 * @param {React.ReactNode} props.children - Conteúdo adicional
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.inline - Se deve ser exibido inline
 * @param {Function} props.onRetry - Callback para tentar novamente
 */
const ErrorMessage = ({
  error,
  type = 'error',
  size = 'medium',
  dismissible = false,
  onDismiss,
  showIcon = true,
  title,
  children,
  className = '',
  inline = false,
  onRetry,
  ...props
}) => {
  // Se não há erro, não renderiza nada
  if (!error && !children) return null;

  // Extrai mensagem do erro
  const getMessage = () => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error?.message) return error.message;
    return 'Ocorreu um erro inesperado';
  };

  // Classes CSS dinâmicas
  const errorClasses = [
    'error-message',
    `error-message--${type}`,
    `error-message--${size}`,
    inline && 'error-message--inline',
    dismissible && 'error-message--dismissible',
    className
  ].filter(Boolean).join(' ');

  // Ícones para cada tipo
  const getIcon = () => {
    const icons = {
      error: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="error-icon">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      warning: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="error-icon">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      info: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="error-icon">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    };
    return icons[type] || icons.error;
  };

  // Handler para fechar
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // Handler para retry
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div 
      className={errorClasses}
      role="alert"
      aria-live="polite"
      {...props}
    >
      <div className="error-content">
        {showIcon && (
          <div className="error-icon-container">
            {getIcon()}
          </div>
        )}
        
        <div className="error-text">
          {title && (
            <div className="error-title">
              {title}
            </div>
          )}
          
          <div className="error-description">
            {error && getMessage()}
            {children}
          </div>
        </div>

        <div className="error-actions">
          {onRetry && (
            <button
              type="button"
              className="error-retry-btn"
              onClick={handleRetry}
              aria-label="Tentar novamente"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="retry-icon">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Retry
            </button>
          )}

          {dismissible && (
            <button
              type="button"
              className="error-dismiss-btn"
              onClick={handleDismiss}
              aria-label="Fechar mensagem de erro"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="dismiss-icon">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componentes de conveniência
ErrorMessage.Error = (props) => <ErrorMessage type="error" {...props} />;
ErrorMessage.Warning = (props) => <ErrorMessage type="warning" {...props} />;
ErrorMessage.Info = (props) => <ErrorMessage type="info" {...props} />;

// Componentes específicos para comentários
ErrorMessage.CommentLoad = ({ onRetry, ...props }) => (
  <ErrorMessage 
    type="error"
    title="Erro ao carregar comentários"
    error="Não foi possível carregar os comentários. Verifique sua conexão."
    onRetry={onRetry}
    showIcon
    {...props}
  />
);

ErrorMessage.CommentPost = ({ onRetry, onDismiss, ...props }) => (
  <ErrorMessage 
    type="error"
    title="Erro ao publicar comentário"
    error="Não foi possível publicar seu comentário. Tente novamente."
    onRetry={onRetry}
    onDismiss={onDismiss}
    dismissible
    showIcon
    {...props}
  />
);

ErrorMessage.Validation = ({ field, ...props }) => (
  <ErrorMessage 
    type="warning"
    size="small"
    inline
    showIcon={false}
    {...props}
  />
);

ErrorMessage.Network = ({ onRetry, ...props }) => (
  <ErrorMessage 
    type="error"
    title="Problema de conexão"
    error="Verifique sua conexão com a internet e tente novamente."
    onRetry={onRetry}
    showIcon
    {...props}
  />
);

export default ErrorMessage;
