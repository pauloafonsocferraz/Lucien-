import { useState, useEffect, useCallback, useRef } from 'react';
import { hybridAPI } from '../utils/api';
import { commentsStorage, sessionStorage } from '../utils/storage';

// Hook personalizado para gerenciar comentários
export const useComments = (options = {}) => {
  const {
    autoFetch = true,
    enableOffline = true,
    refreshInterval = 60000,
    maxRetries = 3
  } = options;

  // Estados
  const [comments, setComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Refs
  const refreshIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const pendingRetryRef = useRef(false); // Previne múltiplas tentativas simultâneas

  // Função para validar comentário
  const validateComment = useCallback((comment) => {
    const errors = [];

    if (!comment.name || comment.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!comment.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(comment.email)) {
      errors.push('Email inválido');
    }

    if (!comment.message || comment.message.trim().length < 10) {
      errors.push('Mensagem deve ter pelo menos 10 caracteres');
    }

    if (comment.message && comment.message.length > 1000) {
      errors.push('Mensagem deve ter no máximo 1000 caracteres');
    }

    // Verificar palavras proibidas
    const forbiddenWords = ['spam', 'fuck', 'shit'];
    const hasFromiddenWords = forbiddenWords.some(word => 
      comment.message.toLowerCase().includes(word.toLowerCase())
    );

    if (hasFromiddenWords) {
      errors.push('Mensagem contém palavras não permitidas');
    }

    return errors;
  }, []);

  // Função para buscar comentários
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await hybridAPI.getComments();
      setComments(data.comments || []);
      
      sessionStorage.recordAction('comments_fetch', { count: data.comments?.length || 0 });
      
      return data.comments;
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      setError(error.message || 'Erro ao carregar comentários');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para verificar comentário duplicado
  const isDuplicateComment = useCallback((newComment, existingComments) => {
    return existingComments.some(existing => 
      existing.email === newComment.email &&
      existing.message.trim() === newComment.message.trim() &&
      Math.abs(new Date(existing.date) - new Date()) < 5 * 60 * 1000 // 5 minutos
    );
  }, []);

  // Função para tentar reenviar comentários pendentes
  const retryPendingComments = useCallback(async () => {
    // Prevenir execuções simultâneas
    if (pendingRetryRef.current || !isOnline) {
      return { successful: 0, failed: 0 };
    }

    const currentPending = commentsStorage.getPending();
    if (currentPending.length === 0) {
      return { successful: 0, failed: 0 };
    }

    pendingRetryRef.current = true;
    console.log(`🔄 Tentando reenviar ${currentPending.length} comentários pendentes...`);

    const successfulComments = [];
    const failedComments = [];

    for (const comment of currentPending) {
      try {
        if (comment.attempts >= maxRetries) {
          console.warn(`⚠️ Comentário ${comment.id} excedeu tentativas máximas`);
          failedComments.push(comment);
          continue;
        }

        commentsStorage.incrementAttempts(comment.id);

        const result = await hybridAPI.addComment({
          ...comment,
          id: undefined
        });

        commentsStorage.removePending(comment.id);
        successfulComments.push(result.comment);

        console.log(`✅ Comentário ${comment.id} enviado com sucesso`);

      } catch (error) {
        console.error(`❌ Falha ao reenviar comentário ${comment.id}:`, error);
        failedComments.push(comment);
      }
    }

    // Atualizar estados
    if (successfulComments.length > 0) {
      setComments(prev => [...successfulComments.filter(c => c.approved), ...prev]);
    }

    // Atualizar lista de pendentes
    const remainingPending = commentsStorage.getPending();
    setPendingComments(remainingPending);

    // Programar nova tentativa se ainda há falhas
    if (remainingPending.length > 0) {
      retryTimeoutRef.current = setTimeout(() => {
        pendingRetryRef.current = false;
        retryPendingComments();
      }, 5 * 60 * 1000);
    }

    pendingRetryRef.current = false;

    return {
      successful: successfulComments.length,
      failed: failedComments.length
    };
  }, [isOnline, maxRetries]);

  // Função para adicionar comentário
  const addComment = useCallback(async (commentData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validar comentário
      const validationErrors = validateComment(commentData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Verificar duplicação
      if (isDuplicateComment(commentData, comments)) {
        throw new Error('Comentário similar já foi enviado recentemente');
      }

      // Preparar dados do comentário
      const newComment = {
        ...commentData,
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        approved: false,
        ip: 'hidden',
        userAgent: navigator.userAgent,
        attempts: 0
      };

      // Tentar enviar se online
      if (isOnline) {
        try {
          const result = await hybridAPI.addComment(newComment);
          
          if (result.comment && result.comment.approved) {
            setComments(prev => [result.comment, ...prev]);
          }

          sessionStorage.recordAction('comment_add', { 
            success: true,
            approved: result.comment?.approved || false
          });

          return {
            success: true,
            message: result.comment?.approved 
              ? 'Comentário adicionado com sucesso!'
              : 'Comentário enviado e aguarda aprovação.',
            comment: result.comment
          };

        } catch (serverError) {
          // Se falhar e offline habilitado, salvar como pendente
          if (enableOffline) {
            commentsStorage.addPending(newComment);
            setPendingComments(prev => [...prev, newComment]);
            
            return {
              success: true,
              message: 'Comentário salvo. Será enviado quando a conexão for restabelecida.',
              comment: newComment,
              pending: true
            };
          } else {
            throw serverError;
          }
        }
      } else {
        // Offline - salvar como pendente
        if (enableOffline) {
          commentsStorage.addPending(newComment);
          setPendingComments(prev => [...prev, newComment]);
          
          return {
            success: true,
            message: 'Comentário salvo offline. Será enviado quando conectar à internet.',
            comment: newComment,
            pending: true
          };
        } else {
          throw new Error('Sem conexão com a internet');
        }
      }

    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      setError(error.message);
      
      sessionStorage.recordAction('comment_add', { 
        success: false,
        error: error.message
      });

      return {
        success: false,
        message: error.message,
        comment: null
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [isOnline, enableOffline, validateComment, isDuplicateComment, comments]);

  // Função para obter estatísticas
  const getCommentsStats = useCallback(() => {
    const total = comments.length;
    const pending = pendingComments.length;
    const today = new Date().toDateString();
    
    const todayComments = comments.filter(comment => 
      new Date(comment.date).toDateString() === today
    ).length;

    const last7Days = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      last7Days[dateStr] = comments.filter(comment => 
        new Date(comment.date).toDateString() === dateStr
      ).length;
    }

    return {
      total,
      pending,
      today: todayComments,
      last7Days,
      avgPerDay: Math.round(total / 7)
    };
  }, [comments, pendingComments]);

  // Effect para eventos online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Debounce para tentar reenviar após voltar online
      setTimeout(() => {
        if (commentsStorage.getPending().length > 0) {
          retryPendingComments();
        }
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // ✅ Sem dependências - evita re-renders

  // Effect principal - inicialização
  useEffect(() => {
    if (enableOffline) {
      const pending = commentsStorage.getPending();
      setPendingComments(pending);
    }

    if (autoFetch) {
      fetchComments();
    }
  }, []); // ✅ Executar apenas uma vez

  // Effect para refresh automático
  useEffect(() => {
    if (refreshInterval > 0 && isOnline) {
      refreshIntervalRef.current = setInterval(fetchComments, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, isOnline, fetchComments]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      pendingRetryRef.current = false;
    };
  }, []);

  // API do hook
  return {
    // Dados
    comments,
    pendingComments,
    stats: getCommentsStats(),
    
    // Status
    isLoading,
    isSubmitting,
    isOnline,
    error,
    
    // Ações
    addComment,
    fetchComments,
    retryPendingComments,
    validateComment,
    
    // Utilitários
    refresh: fetchComments,
    clearError: () => setError(null),
    getTotalCount: () => comments.length + pendingComments.length
  };
};

// Hook simplificado para apenas exibir comentários
export const useCommentsDisplay = () => {
  const { comments, isLoading } = useComments({ 
    autoFetch: true,
    enableOffline: false 
  });

  return {
    comments,
    isLoading,
    count: comments.length
  };
};

export default useComments;
