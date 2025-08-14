import React from 'react';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import CommentsStats from './CommentsStats';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import OfflineIndicator from '../UI/OfflineIndicator';
import './Comments.css';

const CommentsList = ({ 
  showForm = true, 
  showStats = true,
  enableOffline = true,
  refreshInterval = 60000,
  className = "",
  maxComments = null
}) => {
  const {
    comments,
    pendingComments,
    stats,
    isLoading,
    isSubmitting,
    isOnline,
    error,
    addComment,
    refresh,
    clearError,
    retryPendingComments
  } = useComments({
    autoFetch: true,
    enableOffline,
    refreshInterval
  });

  // Filtrar comentários para exibição
  const displayComments = maxComments 
    ? comments.slice(0, maxComments)
    : comments;

  const handleCommentSubmit = async (commentData) => {
    const result = await addComment(commentData);
    
    if (result.success) {
      // Scroll para o comentário adicionado se aprovado
      if (result.comment && result.comment.approved) {
        setTimeout(() => {
          const commentElement = document.getElementById(`comment-${result.comment.id}`);
          if (commentElement) {
            commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
    
    return result;
  };

  const handleRetryPending = async () => {
    try {
      const result = await retryPendingComments();
      console.log(`✅ Reenvio: ${result.successful} sucessos, ${result.failed} falhas`);
    } catch (error) {
      console.error('Erro ao tentar reenviar comentários:', error);
    }
  };

  return (
    <div className={`comments-container ${className}`}>
      {/* Indicador de Status */}
      <div className="comments-status">
        {!isOnline && <OfflineIndicator onRetry={handleRetryPending} />}
        
        {pendingComments.length > 0 && (
          <div className="pending-indicator">
            <span className="pending-count">{pendingComments.length}</span>
            <span className="pending-text">
              comentário{pendingComments.length > 1 ? 's' : ''} aguardando envio
            </span>
            {isOnline && (
              <button 
                onClick={handleRetryPending}
                className="retry-btn"
                disabled={isSubmitting}
              >
                Tentar Agora
              </button>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      {showStats && <CommentsStats stats={stats} />}

      {/* Formulário */}
      {showForm && (
        <CommentForm 
          onSubmit={handleCommentSubmit}
          isSubmitting={isSubmitting}
          isOnline={isOnline}
        />
      )}

      {/* Erro Global */}
      {error && (
        <ErrorMessage 
          message={error}
          onDismiss={clearError}
          type="error"
        />
      )}

      {/* Lista de Comentários */}
      <div className="comments-section">
        <div className="comments-header">
          <h3>
            Comentários ({stats.total})
            {isLoading && <LoadingSpinner size="small" />}
          </h3>
          
          <button 
            onClick={refresh}
            className="refresh-btn"
            disabled={isLoading}
            title="Atualizar comentários"
          >
            🔄
          </button>
        </div>

        {/* Loading inicial */}
        {isLoading && comments.length === 0 && (
          <div className="comments-loading">
            <LoadingSpinner />
            <p>Carregando comentários...</p>
          </div>
        )}

        {/* Lista vazia */}
        {!isLoading && comments.length === 0 && pendingComments.length === 0 && (
          <div className="comments-empty">
            <p>Ainda não há comentários.</p>
            <p>Seja o primeiro a comentar! 👆</p>
          </div>
        )}

        {/* Comentários Pendentes */}
        {pendingComments.length > 0 && (
          <div className="pending-comments">
            <h4>📤 Comentários Pendentes</h4>
            {pendingComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isPending={true}
                showActions={false}
              />
            ))}
          </div>
        )}

        {/* Comentários Aprovados */}
        {displayComments.length > 0 && (
          <div className="approved-comments">
            {displayComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isPending={false}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Botão "Ver Mais" */}
        {maxComments && comments.length > maxComments && (
          <div className="comments-load-more">
            <button 
              onClick={() => window.location.reload()} 
              className="load-more-btn"
            >
              Ver todos os {comments.length} comentários
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsList;
