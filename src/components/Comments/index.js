/**
 * Sistema de Comentários - Exportações Centralizadas
 * @version 1.0.1
 */

// Importações para re-export
import CommentsList from './CommentsList';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import CommentsStats from './CommentsStats';

// Componentes principais
export { 
  CommentsList, 
  CommentForm, 
  CommentItem, 
  CommentsStats 
};

// Componentes UI
export { default as LoadingSpinner } from '../UI/LoadingSpinner';
export { default as ErrorMessage } from '../UI/ErrorMessage';
export { default as OfflineIndicator } from '../UI/OfflineIndicator';

// Hooks e utilitários
export { useComments } from '../../hooks/useComments';

// Export default principal
export default CommentsList;

// Objeto de conveniência
export const Comments = {
  List: CommentsList,
  Form: CommentForm,
  Item: CommentItem,
  Stats: CommentsStats,
  
  // Método de conveniência para renderizar sistema completo
  System: ({ postId, showStats = true, ...props }) => (
    <div className="comments-system" {...props}>
      {showStats && <CommentsStats />}
      <CommentForm postId={postId} />
      <CommentsList postId={postId} />
    </div>
  ),
  
  // Versão compacta
  Compact: ({ postId, maxComments = 5 }) => (
    <div className="comments-compact">
      <CommentsList postId={postId} limit={maxComments} compact />
    </div>
  )
};

// Constantes úteis
export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const COMMENT_ERRORS = {
  REQUIRED_FIELD: 'Campo obrigatório',
  INVALID_EMAIL: 'Email inválido',
  TOO_SHORT: 'Comentário muito curto',
  TOO_LONG: 'Comentário muito longo'
};
