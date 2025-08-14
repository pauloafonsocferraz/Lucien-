// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Função auxiliar para fazer requisições
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// ========== FUNÇÕES DE VISITAS ==========

export const visitCounterAPI = {
  // Incrementar contador de visitas
  increment: async (page = 'total') => {
    return await apiRequest('/visits/increment', {
      method: 'POST',
      body: JSON.stringify({ page }),
    });
  },

  // Obter contadores atuais
  get: async () => {
    return await apiRequest('/visits');
  },
};

// ========== FUNÇÕES DE NOTÍCIAS ==========

export const newsAPI = {
  // Obter todas as notícias
  getAll: async () => {
    return await apiRequest('/news');
  },

  // Adicionar nova notícia
  add: async (newsData) => {
    return await apiRequest('/news', {
      method: 'POST',
      body: JSON.stringify(newsData),
    });
  },

  // Obter notícias em destaque
  getFeatured: async () => {
    const allNews = await apiRequest('/news');
    return allNews.filter(news => news.featured);
  },
};

// ========== FUNÇÕES DE COMENTÁRIOS ==========

export const commentsAPI = {
  // Obter todos os comentários
  getAll: async () => {
    return await apiRequest('/comments');
  },

  // Obter comentários de uma página específica
  getByPage: async (page) => {
    const allComments = await apiRequest('/comments');
    return allComments.filter(comment => comment.page === page);
  },

  // Adicionar novo comentário
  add: async (commentData) => {
    return await apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },
};

// ========== FUNÇÕES DE VOTOS ==========

export const votesAPI = {
  // Obter votos atuais
  get: async () => {
    return await apiRequest('/votes');
  },

  // Votar em uma capa
  vote: async (coverId) => {
    return await apiRequest('/votes', {
      method: 'POST',
      body: JSON.stringify({ coverId }),
    });
  },

  // Calcular estatísticas dos votos
  getStats: async () => {
    const votes = await apiRequest('/votes');
    const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
    
    return {
      votes,
      total,
      percentages: {
        cover1: total > 0 ? Math.round((votes.cover1 / total) * 100) : 0,
        cover2: total > 0 ? Math.round((votes.cover2 / total) * 100) : 0,
        cover3: total > 0 ? Math.round((votes.cover3 / total) * 100) : 0,
      },
    };
  },
};

// ========== FUNÇÕES UTILITÁRIAS ==========

export const utilsAPI = {
  // Testar conexão com o backend
  test: async () => {
    return await apiRequest('/test');
  },

  // Verificar se o backend está online
  isOnline: async () => {
    try {
      await apiRequest('/test');
      return true;
    } catch (error) {
      return false;
    }
  },
};

// ========== FUNÇÕES COM FALLBACK LOCAL ==========

// Função que tenta usar API, mas volta para localStorage se falhar
export const hybridAPI = {
  // Incrementar visitas (com fallback)
  incrementVisit: async (page = 'total') => {
    try {
      const result = await visitCounterAPI.increment(page);
      // Salvar também no localStorage como backup
      const localVisits = JSON.parse(localStorage.getItem('visits') || '{"total": 0, "coverPage": 0}');
      if (page === 'total') localVisits.total += 1;
      if (page === 'cover') localVisits.coverPage += 1;
      localStorage.setItem('visits', JSON.stringify(localVisits));
      return result;
    } catch (error) {
      console.warn('API offline, usando localStorage:', error);
      // Fallback para localStorage
      const localVisits = JSON.parse(localStorage.getItem('visits') || '{"total": 0, "coverPage": 0}');
      if (page === 'total') localVisits.total += 1;
      if (page === 'cover') localVisits.coverPage += 1;
      localStorage.setItem('visits', JSON.stringify(localVisits));
      return { success: true, visits: localVisits };
    }
  },

  // Obter visitas (com fallback)
  getVisits: async () => {
    try {
      return await visitCounterAPI.get();
    } catch (error) {
      console.warn('API offline, usando localStorage:', error);
      const localVisits = JSON.parse(localStorage.getItem('visits') || '{"total": 0, "coverPage": 0}');
      return localVisits;
    }
  },

  // Adicionar comentário (com fallback)
  addComment: async (commentData) => {
    try {
      return await commentsAPI.add(commentData);
    } catch (error) {
      console.warn('API offline, salvando no localStorage:', error);
      // Salvar no localStorage para sincronizar depois
      const localComments = JSON.parse(localStorage.getItem('pendingComments') || '[]');
      const newComment = {
        ...commentData,
        id: Date.now(),
        date: new Date().toISOString(),
        pending: true,
      };
      localComments.push(newComment);
      localStorage.setItem('pendingComments', JSON.stringify(localComments));
      return { success: true, comment: newComment };
    }
  },
};

// Exportar tudo como default também
export default {
  visitCounterAPI,
  newsAPI,
  commentsAPI,
  votesAPI,
  utilsAPI,
  hybridAPI,
};
