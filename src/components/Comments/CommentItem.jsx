import React, { useState } from 'react';

const CommentItem = ({ 
  comment, 
  isPending = false, 
  showActions = true,
  className = ""
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Formatação de data
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'Agora mesmo';
      if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h atrás`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d atrás`;
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Truncar mensagem longa
  const shouldTruncate = comment.message && comment.message.length > 300;
  const displayMessage = shouldTruncate && !showFullContent 
    ? comment.message.substring(0, 300) + '...'
    : comment.message;

  // Copiar link do comentário
  const copyCommentLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`;
      await navigator.clipboard.writeText(url);
      
      // Feedback visual temporário
      const button = document.querySelector(`#comment-${comment.id} .copy-link-btn`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copiado!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      // Fallback para browsers sem clipboard API
      const url = `${window.location.origin}${window.location.pathname}#comment-${comment.id}`;
      prompt('Copie o link do comentário:', url);
    }
  };

  // Reportar comentário
  const reportComment = () => {
    if (confirm('Deseja reportar este comentário como inadequado?')) {
      // Aqui você implementaria a lógica de report
      console.log('Comentário reportado:', comment.id);
      alert('Comentário reportado. Obrigado pelo feedback!');
    }
  };

  return (
    <article 
      id={`comment-${comment.id}`}
      className={`comment-item ${isPending ? 'pending' : 'approved'} ${className}`}
      data-comment-id={comment.id}
    >
      {/* Header do comentário */}
      <header className="comment-header">
        <div className="comment-author">
          <div className="author-avatar">
            {comment.name ? comment.name.charAt(0).toUpperCase() : '?'}
          </div>
          
          <div className="author-info">
            <h4 className="author-name">
              {comment.name || 'Anônimo'}
              {isPending && <span className="pending-badge">Pendente</span>}
            </h4>
            
            <time className="comment-date" dateTime={comment.created_at}>
              {formatDate(comment.created_at)}
              {isPending && ' • Aguardando envio'}
            </time>
          </div>
        </div>

        {/* Status indicators */}
        <div className="comment-status">
          {isPending && (
            <span className="status-icon pending" title="Aguardando envio">
              ⏳
            </span>
          )}
          
          {!isPending && !comment.approved && (
            <span className="status-icon moderation" title="Em moderação">
              🔍
            </span>
          )}
          
          {comment.approved && (
            <span className="status-icon approved" title="Aprovado">
              ✅
            </span>
          )}
        </div>
      </header>

      {/* Conteúdo do comentário */}
      <div className="comment-content">
        <div className="comment-message">
          <p>{displayMessage}</p>
          
          {shouldTruncate && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="toggle-content-btn"
              type="button"
            >
              {showFullContent ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>

        {/* Metadados adicionais */}
        {comment.metadata && (
          <div className="comment-metadata">
            {comment.metadata.user_agent && (
              <small className="user-agent">
                📱 {comment.metadata.user_agent}
              </small>
            )}
            
            {comment.metadata.ip && process.env.NODE_ENV === 'development' && (
              <small className="ip-address">
                🌐 {comment.metadata.ip}
              </small>
            )}
          </div>
        )}
      </div>

      {/* Ações do comentário */}
      {showActions && !isPending && (
        <footer className="comment-actions">
          <button
            onClick={copyCommentLink}
            className="action-btn copy-link-btn"
            title="Copiar link do comentário"
          >
            🔗 Link
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="action-btn details-btn"
            title="Ver detalhes"
          >
            {isExpanded ? '📋 Menos' : '📋 Detalhes'}
          </button>

          <button
            onClick={reportComment}
            className="action-btn report-btn"
            title="Reportar comentário"
          >
            🚨 Reportar
          </button>
        </footer>
      )}

      {/* Detalhes expandidos */}
      {isExpanded && !isPending && (
        <div className="comment-details">
          <div className="details-grid">
            <div className="detail-item">
              <strong>ID:</strong> {comment.id}
            </div>
            
            <div className="detail-item">
              <strong>Data completa:</strong> {new Date(comment.created_at).toLocaleString('pt-BR')}
            </div>
            
            {comment.email && (
              <div className="detail-item">
                <strong>Email:</strong> {comment.email.replace(/(.{2}).*(@.*)/, '$1***$2')}
              </div>
            )}
            
            <div className="detail-item">
              <strong>Status:</strong> 
              {comment.approved ? ' Aprovado' : ' Em moderação'}
            </div>
            
            {comment.metadata?.location && (
              <div className="detail-item">
                <strong>Localização:</strong> {comment.metadata.location}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicador de erro para pendentes */}
      {isPending && comment.error && (
        <div className="comment-error">
          <span>❌</span>
          <span>Erro no envio: {comment.error}</span>
        </div>
      )}
    </article>
  );
};

export default CommentItem;
