import React from 'react';
import './LoadingSpinner.css';

/**
 * Componente LoadingSpinner
 * @description Indicador de carregamento reutilizável com múltiplas variações
 * @param {Object} props - Propriedades do componente
 * @param {string} props.size - Tamanho do spinner ('small', 'medium', 'large')
 * @param {string} props.variant - Variação visual ('default', 'dots', 'pulse', 'bars')
 * @param {string} props.color - Cor do spinner ('primary', 'secondary', 'white')
 * @param {string} props.message - Mensagem opcional para exibir
 * @param {boolean} props.overlay - Se deve mostrar overlay de fundo
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.fullScreen - Se deve ocupar a tela inteira
 */
const LoadingSpinner = ({
  size = 'medium',
  variant = 'default',
  color = 'primary',
  message = '',
  overlay = false,
  className = '',
  fullScreen = false,
  ...props
}) => {
  // Classes CSS dinâmicas
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${variant}`,
    `loading-spinner--${color}`,
    overlay && 'loading-spinner--overlay',
    fullScreen && 'loading-spinner--fullscreen',
    className
  ].filter(Boolean).join(' ');

  // Renderização do spinner baseado na variante
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="spinner-dots">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
          </div>
        );
      
      case 'pulse':
        return <div className="spinner-pulse"></div>;
      
      case 'bars':
        return (
          <div className="spinner-bars">
            <div className="bar bar-1"></div>
            <div className="bar bar-2"></div>
            <div className="bar bar-3"></div>
            <div className="bar bar-4"></div>
          </div>
        );
      
      default:
        return <div className="spinner-circle"></div>;
    }
  };

  return (
    <div 
      className={spinnerClasses}
      role="status"
      aria-label={message || 'Carregando...'}
      {...props}
    >
      <div className="spinner-container">
        {renderSpinner()}
        
        {message && (
          <div className="spinner-message" aria-live="polite">
            {message}
          </div>
        )}
        
        {/* Screen reader only text */}
        <span className="sr-only">
          {message || 'Carregando conteúdo, aguarde...'}
        </span>
      </div>
    </div>
  );
};

// Componentes de conveniência
LoadingSpinner.Small = (props) => <LoadingSpinner size="small" {...props} />;
LoadingSpinner.Large = (props) => <LoadingSpinner size="large" {...props} />;
LoadingSpinner.Overlay = (props) => <LoadingSpinner overlay {...props} />;
LoadingSpinner.FullScreen = (props) => <LoadingSpinner fullScreen overlay {...props} />;

// Componentes temáticos para comentários
LoadingSpinner.Comments = (props) => (
  <LoadingSpinner 
    message="Carregando comentários..." 
    variant="dots"
    {...props} 
  />
);

LoadingSpinner.Posting = (props) => (
  <LoadingSpinner 
    size="small"
    message="Publicando comentário..." 
    variant="pulse"
    {...props} 
  />
);

export default LoadingSpinner;
