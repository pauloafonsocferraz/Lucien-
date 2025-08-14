import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useDebounce } from './useDebounce';

/**
 * Hook principal para gerenciar comentários
 * @description Gerencia carregamento, criação, edição e exclusão de comentários
 * @param {Object} options - Opções de configuração
 * @param {string} options.postId - ID do post (obrigatório)
 * @param {number} options.pageSize - Número de comentários por página
 * @param {string} options.sortBy - Ordenação ('newest', 'oldest', 'popular')
 * @param {boolean} options.enableRealtime - Habilita atualizações em tempo real
 * @param {Function} options.onError - Callback para erros
 * @param {Function} options.onSuccess - Callback para sucessos
 * @returns {Object} Estado e funções dos comentários
 */
export const useComments = ({
  postId,
  pageSize = 10,
  sortBy = 'newest',
  enableRealtime = false,
  onError,
  onSuccess
} = {}) => {
  // ===== STATES =====
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ===== LOCAL STORAGE =====
  const [localComments, setLocalComments] = useLocalStorage(
    `comments_${postId}`,
    []
  );

  const [draftComments, setDraftComments] = useLocalStorage(
    `draft_comments_${postId}`,
    {}
  );

  // ===== DEBOUNCED SEARCH =====
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ===== API SIMULATION =====
  // Simula uma API - substitua pela sua implementação real
  const api = useMemo(() => ({
    // Buscar comentários
    async fetchComments(pageNum = 1, search = '') {
      const delay = Math.random() * 500 + 200; // 200-700ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simula erro ocasional
      if (Math.random() < 0.1) {
        throw new Error('Erro de conexão com o servidor');
      }

      // Dados mockados
      const allComments = [
        {
          id: 1,
          author: 'João Silva',
          content: 'Excelente post! Muito esclarecedor.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          likes: 12,
          replies: 3,
          isLiked: false
        },
        {
          id: 2,
          author: 'Maria Santos',
          content: 'Concordo totalmente. Seria interessante ver mais conteúdo sobre esse tema.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          likes: 8,
          replies: 1,
          isLiked: true
        },
        {
          id: 3,
          author: 'Pedro Costa',
          content: 'Muito bem explicado! Salvei para consultar depois.',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          likes: 15,
          replies: 0,
          isLiked: false
        },
        // Adicione mais comentários conforme necessário
        ...Array.from({ length: 20 }, (_, i) => ({
          id: i + 4,
          author: `Usuário ${i + 4}`,
          content: `Comentário de exemplo número ${i + 4}. Lorem ipsum dolor sit amet.`,
          timestamp: new Date(Date.now() - (i + 4) * 3600000).toISOString(),
          likes: Math.floor(Math.random() * 20),
          replies: Math.floor(Math.random() * 5),
          isLiked: Math.random() < 0.3
        }))
      ];

      // Aplicar filtro de busca
      let filteredComments = search 
        ? allComments.filter(comment => 
            comment.content.toLowerCase().includes(search.toLowerCase()) ||
            comment.author.toLowerCase().includes(search.toLowerCase())
          )
        : allComments;

      // Aplicar ordenação
      switch (sortBy) {
        case 'oldest':
          filteredComments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          break;
        case 'popular':
          filteredComments.sort((a, b) => b.likes - a.likes);
          break;
        case 'newest':
        default:
          filteredComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      // Paginação
      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const paginatedComments = filteredComments.slice(start, end);

      return {
        comments: paginatedComments,
        hasMore: end < filteredComments.length,
        total: filteredComments.length
      };
    },

    // Criar comentário
    async createComment(content) {
      const delay = Math.random() * 1000 + 500; // 500-1500ms
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Simula erro ocasional
      if (Math.random() < 0.15) {
        throw new Error('Falha ao enviar comentário. Tente novamente.');
      }

      return {
        id: Date.now(),
        author: 'Você', // Em uma app real, viria do contexto do usuário
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: 0,
        isLiked: false
      };
    },

    // Editar comentário
    async updateComment(id, content) {
      const delay = Math.random() * 800 + 300;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (Math.random() < 0.1) {
        throw new Error('Falha ao editar comentário.');
      }

      return { id, content, editedAt: new Date().toISOString() };
    },

    // Deletar comentário
    async deleteComment(id) {
      const delay = Math.random() * 600 + 200;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (Math.random() < 0.1) {
        throw new Error('Falha ao excluir comentário.');
      }

      return { success: true };
    },

    // Curtir/descurtir
    async toggleLike(id) {
      const delay = Math.random() * 400 + 100;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (Math.random() < 0.05) {
        throw new Error('Falha ao curtir comentário.');
      }

      return { success: true };
    }
  }), [pageSize, sortBy]);

  // ===== HANDLERS =====
  const handleError = useCallback((err) => {
    const errorMessage = err.message || 'Ocorreu um erro inesperado';
    setError(errorMessage);
    if (onError) onError(errorMessage);
  }, [onError]);

  const handleSuccess = useCallback((message) => {
    if (onSuccess) onSuccess(message);
  }, [onSuccess]);

  // ===== LOAD COMMENTS =====
  const loadComments = useCallback(async (pageNum = 1, resetComments = false) => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.fetchComments(pageNum, debouncedSearch);
      
      setComments(prevComments => {
        if (resetComments || pageNum === 1) {
          return result.comments;
        }
        // Remove duplicados ao adicionar nova página
        const existingIds = new Set(prevComments.map(c => c.id));
        const newComments = result.comments.filter(c => !existingIds.has(c.id));
        return [...prevComments, ...newComments];
      });

      setHasMore(result.hasMore);
      setPage(pageNum);
      
      // Salva no localStorage
      if (pageNum === 1) {
        setLocalComments(result.comments);
      }

    } catch (err) {
      handleError(err);
      
      // Em caso de erro, carrega do localStorage
      if (pageNum === 1 && localComments.length > 0) {
        setComments(localComments);
        handleSuccess('Comentários carregados do cache local');
      }
    } finally {
      setLoading(false);
    }
  }, [postId, api, debouncedSearch, localComments, setLocalComments, handleError, handleSuccess]);

  // ===== LOAD MORE =====
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadComments(page + 1, false);
    }
  }, [loading, hasMore, page, loadComments]);

  // ===== CREATE COMMENT =====
  const createComment = useCallback(async (content) => {
    if (!content?.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const newComment = await api.createComment(content.trim());
      
      // Adiciona o comentário no início da lista
      setComments(prevComments => [newComment, ...prevComments]);
      
      // Remove do rascunho
      const newDrafts = { ...draftComments };
      delete newDrafts.new;
      setDraftComments(newDrafts);
      
      handleSuccess('Comentário publicado com sucesso!');
      return newComment;

    } catch (err) {
      // Salva como rascunho em caso de erro
      setDraftComments(prev => ({ ...prev, new: content }));
      handleError(err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [api, draftComments, setDraftComments, handleError, handleSuccess]);

  // ===== UPDATE COMMENT =====
  const updateComment = useCallback(async (id, content) => {
    if (!content?.trim()) return;

    setEditingId(id);
    setError(null);

    try {
      await api.updateComment(id, content.trim());
      
      // Atualiza o comentário na lista
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === id 
            ? { ...comment, content: content.trim(), editedAt: new Date().toISOString() }
            : comment
        )
      );
      
      // Remove do rascunho
      const newDrafts = { ...draftComments };
      delete newDrafts[id];
      setDraftComments(newDrafts);
      
      handleSuccess('Comentário editado com sucesso!');

    } catch (err) {
      // Salva como rascunho em caso de erro
      setDraftComments(prev => ({ ...prev, [id]: content }));
      handleError(err);
      throw err;
    } finally {
      setEditingId(null);
    }
  }, [api, draftComments, setDraftComments, handleError, handleSuccess]);

  // ===== DELETE COMMENT =====
  const deleteComment = useCallback(async (id) => {
    setDeletingId(id);
    setError(null);

    try {
      await api.deleteComment(id);
      
      // Remove o comentário da lista
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== id)
      );
      
      // Remove do rascunho se existir
      const newDrafts = { ...draftComments };
      delete newDrafts[id];
      setDraftComments(newDrafts);
      
      handleSuccess('Comentário excluído com sucesso!');

    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setDeletingId(null);
    }
  }, [api, draftComments, setDraftComments, handleError, handleSuccess]);

  // ===== TOGGLE LIKE =====
  const toggleLike = useCallback(async (id) => {
    try {
      await api.toggleLike(id);
      
      // Atualiza o like otimisticamente
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === id 
            ? { 
                ...comment, 
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              }
            : comment
        )
      );

    } catch (err) {
      // Reverte em caso de erro
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === id 
            ? { 
                ...comment, 
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes + 1 : comment.likes - 1
              }
            : comment
        )
      );
      handleError(err);
    }
  }, [api, handleError]);

  // ===== SEARCH =====
  const searchComments = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  // ===== REFRESH =====
  const refreshComments = useCallback(() => {
    setPage(1);
    loadComments(1, true);
  }, [loadComments]);

  // ===== DRAFT MANAGEMENT =====
  const saveDraft = useCallback((id, content) => {
    setDraftComments(prev => ({ ...prev, [id]: content }));
  }, [setDraftComments]);

  const getDraft = useCallback((id) => {
    return draftComments[id] || '';
  }, [draftComments]);

  const clearDraft = useCallback((id) => {
    const newDrafts = { ...draftComments };
    delete newDrafts[id];
    setDraftComments(newDrafts);
  }, [draftComments, setDraftComments]);

  // ===== EFFECTS =====
  // Carrega comentários iniciais
  useEffect(() => {
    if (postId) {
      loadComments(1, true);
    }
  }, [postId, sortBy]); // Não incluir loadComments para evitar loop

  // Recarrega quando a busca muda
  useEffect(() => {
    if (postId && debouncedSearch !== undefined) {
      loadComments(1, true);
    }
  }, [debouncedSearch]); // Não incluir loadComments

  // Atualizações em tempo real (opcional)
  useEffect(() => {
    if (!enableRealtime || !postId) return;

    const interval = setInterval(() => {
      // Simula verificação de novos comentários
      // Em uma app real, isso seria WebSocket ou Server-Sent Events
      if (Math.random() < 0.1) { // 10% chance a cada 30 segundos
        loadComments(1, true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [enableRealtime, postId, loadComments]);

  // ===== MEMOIZED VALUES =====
  const commentsStats = useMemo(() => ({
    total: comments.length,
    totalLikes: comments.reduce((sum, comment) => sum + comment.likes, 0),
    averageLikes: comments.length > 0 
      ? Math.round(comments.reduce((sum, comment) => sum + comment.likes, 0) / comments.length)
      : 0
  }), [comments]);

  const hasUnsavedDrafts = useMemo(() => {
    return Object.keys(draftComments).length > 0;
  }, [draftComments]);

  // ===== RETURN =====
  return {
    // State
    comments,
    loading,
    error,
    hasMore,
    submitting,
    editingId,
    deletingId,
    searchTerm,
    
    // Actions
    loadComments: refreshComments,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    searchComments,
    refreshComments,
    
    // Draft management
    saveDraft,
    getDraft,
    clearDraft,
    hasUnsavedDrafts,
    
    // Utils
    clearError: () => setError(null),
    commentsStats,
    
    // Status helpers
    isLoading: loading,
    isSubmitting: submitting,
    isEditing: (id) => editingId === id,
    isDeleting: (id) => deletingId === id,
    isEmpty: comments.length === 0 && !loading,
    hasComments: comments.length > 0
  };
};

export default useComments;
