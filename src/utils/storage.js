// ========== FUNÇÕES DE LOCALSTORAGE ==========

// Função segura para salvar no localStorage
export const saveToStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar ${key} no localStorage:`, error);
    return false;
  }
};

// Função segura para ler do localStorage
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Erro ao ler ${key} do localStorage:`, error);
    return defaultValue;
  }
};

// Função para remover item do localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Erro ao remover ${key} do localStorage:`, error);
    return false;
  }
};

// Função para limpar todo o localStorage
export const clearStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
    return false;
  }
};

// ========== GESTÃO DE VISITAS LOCAIS ==========

export const visitStorage = {
  // Obter contadores de visita locais
  get: () => {
    return getFromStorage('visits', {
      total: 0,
      coverPage: 0,
      lastVisit: null,
      sessions: []
    });
  },

  // Incrementar contador local
  increment: (page = 'total') => {
    const visits = visitStorage.get();
    const now = new Date().toISOString();
    
    if (page === 'total') visits.total += 1;
    if (page === 'cover') visits.coverPage += 1;
    
    visits.lastVisit = now;
    visits.sessions.push({
      page,
      timestamp: now
    });

    // Manter apenas as últimas 100 sessões
    if (visits.sessions.length > 100) {
      visits.sessions = visits.sessions.slice(-100);
    }

    return saveToStorage('visits', visits);
  },

  // Sincronizar com servidor
  sync: async (serverData) => {
    const localData = visitStorage.get();
    const mergedData = {
      ...serverData,
      sessions: localData.sessions // Manter sessões locais
    };
    return saveToStorage('visits', mergedData);
  }
};

// ========== GESTÃO DE PREFERÊNCIAS ==========

export const preferencesStorage = {
  // Obter todas as preferências
  get: () => {
    return getFromStorage('preferences', {
      theme: 'dark',
      notifications: true,
      autoIncrement: true,
      language: 'pt-BR',
      lastPage: '/',
      favoriteNews: [],
      readNews: []
    });
  },

  // Salvar preferência específica
  set: (key, value) => {
    const prefs = preferencesStorage.get();
    prefs[key] = value;
    return saveToStorage('preferences', prefs);
  },

  // Obter preferência específica
  getValue: (key, defaultValue = null) => {
    const prefs = preferencesStorage.get();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  },

  // Marcar notícia como lida
  markNewsAsRead: (newsId) => {
    const prefs = preferencesStorage.get();
    if (!prefs.readNews.includes(newsId)) {
      prefs.readNews.push(newsId);
      return saveToStorage('preferences', prefs);
    }
    return true;
  },

  // Adicionar/remover favorito
  toggleFavorite: (newsId) => {
    const prefs = preferencesStorage.get();
    const index = prefs.favoriteNews.indexOf(newsId);
    
    if (index > -1) {
      prefs.favoriteNews.splice(index, 1);
    } else {
      prefs.favoriteNews.push(newsId);
    }
    
    return saveToStorage('preferences', prefs);
  }
};

// ========== GESTÃO DE COMENTÁRIOS PENDENTES ==========

export const commentsStorage = {
  // Obter comentários pendentes
  getPending: () => {
    return getFromStorage('pendingComments', []);
  },

  // Adicionar comentário pendente
  addPending: (comment) => {
    const pending = commentsStorage.getPending();
    const newComment = {
      ...comment,
      id: `local_${Date.now()}`,
      date: new Date().toISOString(),
      pending: true,
      attempts: 0
    };
    pending.push(newComment);
    return saveToStorage('pendingComments', pending);
  },

  // Remover comentário pendente
  removePending: (commentId) => {
    const pending = commentsStorage.getPending();
    const filtered = pending.filter(c => c.id !== commentId);
    return saveToStorage('pendingComments', filtered);
  },

  // Incrementar tentativas de envio
  incrementAttempts: (commentId) => {
    const pending = commentsStorage.getPending();
    const comment = pending.find(c => c.id === commentId);
    if (comment) {
      comment.attempts = (comment.attempts || 0) + 1;
      comment.lastAttempt = new Date().toISOString();
      return saveToStorage('pendingComments', pending);
    }
    return false;
  }
};

// ========== GESTÃO DE VOTOS LOCAIS ==========

export const votesStorage = {
  // Verificar se usuário já votou
  hasVoted: () => {
    return getFromStorage('hasVoted', false);
  },

  // Registrar voto local
  recordVote: (coverId) => {
    const voteData = {
      coverId,
      timestamp: new Date().toISOString(),
      ip: 'local' // Placeholder para IP local
    };
    saveToStorage('userVote', voteData);
    return saveToStorage('hasVoted', true);
  },

  // Obter voto do usuário
  getUserVote: () => {
    return getFromStorage('userVote', null);
  },

  // Limpar voto (para testes)
  clearVote: () => {
    removeFromStorage('hasVoted');
    removeFromStorage('userVote');
    return true;
  }
};

// ========== GESTÃO DE CACHE ==========

export const cacheStorage = {
  // Salvar dados com TTL (Time To Live)
  set: (key, data, ttlMinutes = 60) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000 // Converter para millisegundos
    };
    return saveToStorage(`cache_${key}`, cacheData);
  },

  // Obter dados do cache se ainda válidos
  get: (key) => {
    const cacheData = getFromStorage(`cache_${key}`, null);
    
    if (!cacheData) return null;
    
    const now = Date.now();
    const isExpired = (now - cacheData.timestamp) > cacheData.ttl;
    
    if (isExpired) {
      removeFromStorage(`cache_${key}`);
      return null;
    }
    
    return cacheData.data;
  },

  // Limpar cache expirado
  cleanup: () => {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    cacheKeys.forEach(key => {
      const cacheData = getFromStorage(key, null);
      if (cacheData) {
        const now = Date.now();
        const isExpired = (now - cacheData.timestamp) > cacheData.ttl;
        if (isExpired) {
          removeFromStorage(key);
        }
      }
    });
  }
};

// ========== FUNÇÕES DE SESSÃO ==========

export const sessionStorage = {
  // Iniciar nova sessão
  start: () => {
    const sessionData = {
      id: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      pages: [],
      actions: []
    };
    return saveToStorage('currentSession', sessionData);
  },

  // Registrar visita à página
  recordPageVisit: (page) => {
    const session = getFromStorage('currentSession', null);
    if (session) {
      session.pages.push({
        page,
        timestamp: new Date().toISOString()
      });
      return saveToStorage('currentSession', session);
    }
    return false;
  },

  // Registrar ação do usuário
  recordAction: (action, data = {}) => {
    const session = getFromStorage('currentSession', null);
    if (session) {
      session.actions.push({
        action,
        data,
        timestamp: new Date().toISOString()
      });
      return saveToStorage('currentSession', session);
    }
    return false;
  },

  // Obter sessão atual
  getCurrent: () => {
    return getFromStorage('currentSession', null);
  },

  // Finalizar sessão
  end: () => {
    const session = getFromStorage('currentSession', null);
    if (session) {
      session.endTime = new Date().toISOString();
      session.duration = new Date(session.endTime) - new Date(session.startTime);
      
      // Salvar no histórico de sessões
      const history = getFromStorage('sessionHistory', []);
      history.push(session);
      
      // Manter apenas as últimas 50 sessões
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      saveToStorage('sessionHistory', history);
      removeFromStorage('currentSession');
      return true;
    }
    return false;
  }
};

// ========== FUNÇÃO DE LIMPEZA GERAL ==========

export const cleanupStorage = () => {
  console.log('🧹 Iniciando limpeza do localStorage...');
  
  // Limpar cache expirado
  cacheStorage.cleanup();
  
  // Limpar sessões antigas (mais de 30 dias)
  const history = getFromStorage('sessionHistory', []);
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentSessions = history.filter(session => {
    const sessionTime = new Date(session.startTime).getTime();
    return sessionTime > thirtyDaysAgo;
  });
  
  if (recentSessions.length !== history.length) {
    saveToStorage('sessionHistory', recentSessions);
    console.log(`🗑️ Removidas ${history.length - recentSessions.length} sessões antigas`);
  }
  
  console.log('✅ Limpeza concluída');
};

// Exportar tudo junto
export default {
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  clearStorage,
  visitStorage,
  preferencesStorage,
  commentsStorage,
  votesStorage,
  cacheStorage,
  sessionStorage,
  cleanupStorage
};
