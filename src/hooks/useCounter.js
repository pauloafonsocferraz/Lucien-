import { useState, useEffect, useCallback, useRef } from 'react';
import { hybridAPI } from '../utils/api';
import { visitStorage, sessionStorage } from '../utils/storage';

// Hook personalizado para gerenciar contador de visitas
export const useCounter = (options = {}) => {
  const {
    autoIncrement = true, // Incrementar automaticamente na montagem
    page = 'total', // Página para contar ('total', 'cover', etc.)
    enableLocalFallback = true, // Usar localStorage como fallback
    syncInterval = 30000, // Intervalo de sincronização (30s)
  } = options;

  // Estados
  const [visits, setVisits] = useState({
    total: 0,
    coverPage: 0,
    daily: {},
    lastUpdate: null,
    loading: true,
    error: null
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastIncrement, setLastIncrement] = useState(null);
  
  // Refs para evitar múltiplos incrementos
  const hasIncremented = useRef(false);
  const syncIntervalRef = useRef(null);

  // Função para verificar se está online
  const checkOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Função para buscar visitas do servidor
  const fetchVisits = useCallback(async () => {
    try {
      setVisits(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await hybridAPI.getVisits();
      
      setVisits(prev => ({
        ...prev,
        ...data,
        loading: false,
        error: null
      }));

      // Sincronizar com storage local
      if (enableLocalFallback) {
        visitStorage.sync(data);
      }

      return data;
    } catch (error) {
      console.warn('Erro ao buscar visitas:', error);
      
      // Tentar usar dados locais como fallback
      if (enableLocalFallback) {
        const localVisits = visitStorage.get();
        setVisits(prev => ({
          ...prev,
          ...localVisits,
          loading: false,
          error: 'Usando dados locais (offline)'
        }));
      } else {
        setVisits(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao carregar visitas'
        }));
      }
    }
  }, [enableLocalFallback]);

  // Função para incrementar contador
  const incrementVisit = useCallback(async (targetPage = page) => {
    // Evitar múltiplos incrementos
    if (hasIncremented.current) {
      console.log('⚠️ Incremento já realizado, ignorando...');
      return;
    }

    try {
      setLastIncrement(new Date().toISOString());
      hasIncremented.current = true;

      // Incrementar localmente primeiro para UX imediata
      setVisits(prev => ({
        ...prev,
        [targetPage === 'total' ? 'total' : 'coverPage']: prev[targetPage === 'total' ? 'total' : 'coverPage'] + 1
      }));

      // Tentar incrementar no servidor
      const result = await hybridAPI.incrementVisit(targetPage);
      
      // Registrar na sessão
      sessionStorage.recordAction('visit_increment', { page: targetPage });

      // Atualizar com dados do servidor
      if (result && result.visits) {
        setVisits(prev => ({
          ...prev,
          ...result.visits,
          error: null
        }));
      }

      console.log(`✅ Visita incrementada para página: ${targetPage}`);
      return result;

    } catch (error) {
      console.error('Erro ao incrementar visita:', error);
      
      // Se falhou no servidor, pelo menos manter incremento local
      if (enableLocalFallback) {
        visitStorage.increment(targetPage);
        setVisits(prev => ({
          ...prev,
          error: 'Incremento salvo localmente (offline)'
        }));
      }
      
      throw error;
    }
  }, [page, enableLocalFallback]);

  // Função para resetar flag de incremento (útil para testes)
  const resetIncrementFlag = useCallback(() => {
    hasIncremented.current = false;
  }, []);

  // Função para forçar sincronização
  const forceSync = useCallback(async () => {
    console.log('🔄 Forçando sincronização...');
    await fetchVisits();
  }, [fetchVisits]);

  // Função para obter estatísticas
  const getStats = useCallback(() => {
    const { total, coverPage, daily } = visits;
    
    // Calcular crescimento diário
    const dailyValues = Object.values(daily || {});
    const avgDaily = dailyValues.length > 0 
      ? Math.round(dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length)
      : 0;

    // Calcular porcentagem de visitas na página de capas
    const coverPercentage = total > 0 ? Math.round((coverPage / total) * 100) : 0;

    return {
      total,
      coverPage,
      avgDaily,
      coverPercentage,
      dailyData: daily,
      lastUpdate: visits.lastUpdate
    };
  }, [visits]);

  // Effect para eventos de online/offline
  useEffect(() => {
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [checkOnlineStatus]);

  // Effect principal - carregar dados iniciais
  useEffect(() => {
    let isMounted = true;

    const initializeCounter = async () => {
      // Carregar dados iniciais
      await fetchVisits();

      // Auto-incrementar se habilitado
      if (autoIncrement && isMounted && !hasIncremented.current) {
        setTimeout(() => {
          if (isMounted && !hasIncremented.current) {
            incrementVisit();
          }
        }, 1000); // Delay de 1s para evitar múltiplos incrementos
      }
    };

    initializeCounter();

    return () => {
      isMounted = false;
    };
  }, [autoIncrement, fetchVisits, incrementVisit]);

  // Effect para sincronização automática
  useEffect(() => {
    if (syncInterval > 0 && isOnline) {
      syncIntervalRef.current = setInterval(() => {
        fetchVisits();
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, isOnline, fetchVisits]);

  // Effect para registrar visita na sessão
  useEffect(() => {
    sessionStorage.recordPageVisit(page);
  }, [page]);

  // Retornar API do hook
  return {
    // Dados
    visits,
    stats: getStats(),
    
    // Status
    isLoading: visits.loading,
    isOnline,
    error: visits.error,
    lastIncrement,
    hasIncremented: hasIncremented.current,
    
    // Ações
    incrementVisit,
    fetchVisits,
    forceSync,
    resetIncrementFlag,
    
    // Utilitários
    refresh: fetchVisits,
    reload: () => {
      hasIncremented.current = false;
      fetchVisits();
    }
  };
};

// Hook simplificado apenas para exibir contador
export const useVisitDisplay = (page = 'total') => {
  const { visits, isLoading } = useCounter({ 
    autoIncrement: false, 
    page 
  });

  return {
    count: page === 'total' ? visits.total : visits.coverPage,
    isLoading,
    formattedCount: (page === 'total' ? visits.total : visits.coverPage).toLocaleString('pt-BR')
  };
};

// Hook para estatísticas avançadas
export const useVisitStats = () => {
  const { visits, stats, isLoading } = useCounter({ 
    autoIncrement: false 
  });

  const [trends, setTrends] = useState({
    direction: 'stable', // 'up', 'down', 'stable'
    percentage: 0,
    period: 'daily'
  });

  useEffect(() => {
    if (visits.daily && Object.keys(visits.daily).length >= 2) {
      const dailyValues = Object.values(visits.daily);
      const recent = dailyValues.slice(-3); // Últimos 3 dias
      const previous = dailyValues.slice(-6, -3); // 3 dias anteriores

      if (recent.length > 0 && previous.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
        
        const change = ((recentAvg - previousAvg) / previousAvg) * 100;
        
        setTrends({
          direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
          percentage: Math.abs(Math.round(change)),
          period: 'daily'
        });
      }
    }
  }, [visits.daily]);

  return {
    stats,
    trends,
    isLoading,
    dailyData: visits.daily,
    chartData: Object.entries(visits.daily || {}).map(([date, count]) => ({
      date,
      count,
      formatted: new Date(date).toLocaleDateString('pt-BR')
    }))
  };
};

export default useCounter;
