import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para gerenciar localStorage com sincronização entre abas
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial se não existir no localStorage
 * @param {Object} options - Opções adicionais
 * @returns {Array} [value, setValue, removeValue, isLoading]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true,
    onError = null
  } = options;

  // Refs para evitar dependências desnecessárias
  const serializeRef = useRef(serialize);
  const deserializeRef = useRef(deserialize);
  const onErrorRef = useRef(onError);

  // Atualiza refs quando funções mudam
  useEffect(() => {
    serializeRef.current = serialize;
    deserializeRef.current = deserialize;
    onErrorRef.current = onError;
  }, [serialize, deserialize, onError]);

  // Estado de loading para SSR
  const [isLoading, setIsLoading] = useState(true);

  // Função para ler valor do localStorage com tratamento de erros
  const readValue = useCallback(() => {
    // SSR compatibility
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (item === null) {
        return initialValue;
      }

      // Tenta deserializar
      try {
        return deserializeRef.current(item);
      } catch (deserializeError) {
        console.warn(`useLocalStorage: Erro ao deserializar valor para chave "${key}":`, deserializeError);
        
        // Se falhou ao deserializar, tenta retornar como string
        if (typeof item === 'string') {
          return item;
        }
        
        return initialValue;
      }
    } catch (error) {
      console.warn(`useLocalStorage: Erro ao ler localStorage para chave "${key}":`, error);
      
      if (onErrorRef.current) {
        onErrorRef.current(error, 'read', key);
      }
      
      return initialValue;
    }
  }, [key, initialValue]);

  // Estado principal
  const [storedValue, setStoredValue] = useState(() => {
    // Durante SSR, sempre retorna initialValue
    if (typeof window === 'undefined') {
      return initialValue;
    }
    return readValue();
  });

  // Effect para sincronizar com localStorage na inicialização (apenas client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const value = readValue();
      setStoredValue(value);
      setIsLoading(false);
    }
  }, [readValue]);

  // Função para escrever no localStorage
  const setValue = useCallback((value) => {
    // SSR compatibility
    if (typeof window === 'undefined') {
      console.warn('useLocalStorage: localStorage não disponível no servidor');
      return;
    }

    try {
      // Permite function como no useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Serializa o valor
      const serializedValue = serializeRef.current(valueToStore);
      
      // Salva no localStorage
      window.localStorage.setItem(key, serializedValue);
      
      // Atualiza o estado
      setStoredValue(valueToStore);
      
      // Dispara evento customizado para sincronização
      if (syncAcrossTabs) {
        window.dispatchEvent(new StorageEvent('local-storage', {
          key,
          newValue: serializedValue,
          oldValue: window.localStorage.getItem(key)
        }));
      }
      
    } catch (error) {
      console.warn(`useLocalStorage: Erro ao salvar no localStorage para chave "${key}":`, error);
      
      if (onErrorRef.current) {
        onErrorRef.current(error, 'write', key, value);
      }
    }
  }, [key, storedValue, syncAcrossTabs]);

  // Função para remover do localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      console.warn('useLocalStorage: localStorage não disponível no servidor');
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      
      // Dispara evento para sincronização
      if (syncAcrossTabs) {
        window.dispatchEvent(new StorageEvent('local-storage', {
          key,
          newValue: null,
          oldValue: window.localStorage.getItem(key)
        }));
      }
      
    } catch (error) {
      console.warn(`useLocalStorage: Erro ao remover do localStorage para chave "${key}":`, error);
      
      if (onErrorRef.current) {
        onErrorRef.current(error, 'remove', key);
      }
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Sincronização entre abas/janelas
  useEffect(() => {
    if (typeof window === 'undefined' || !syncAcrossTabs) {
      return;
    }

    const handleStorageChange = (e) => {
      // Eventos nativos do storage
      if ((e.key === key || e.key === null) && e.storageArea === window.localStorage) {
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          try {
            const newValue = deserializeRef.current(e.newValue);
            setStoredValue(newValue);
          } catch (error) {
            console.warn(`useLocalStorage: Erro ao processar mudança de storage:`, error);
          }
        }
      }
    };

    const handleCustomStorageChange = (e) => {
      // Eventos customizados (para mudanças na mesma aba)
      if (e.key === key) {
        if (e.newValue === null) {
          setStoredValue(initialValue);
        } else {
          try {
            const newValue = deserializeRef.current(e.newValue);
            setStoredValue(newValue);
          } catch (error) {
            console.warn(`useLocalStorage: Erro ao processar mudança customizada:`, error);
          }
        }
      }
    };

    // Adiciona listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomStorageChange);
    };
  }, [key, initialValue, syncAcrossTabs]);

  return [storedValue, setValue, removeValue, isLoading];
};

/**
 * Hook para gerenciar múltiplas chaves do localStorage
 * @param {Object} keys - Objeto com chaves e valores iniciais
 * @param {Object} options - Opções globais
 * @returns {Object} Objeto com valores e setters
 */
export const useMultipleLocalStorage = (keys = {}, options = {}) => {
  const results = {};
  
  Object.entries(keys).forEach(([key, initialValue]) => {
    const [value, setValue, removeValue, isLoading] = useLocalStorage(key, initialValue, options);
    
    results[key] = {
      value,
      setValue,
      removeValue,
      isLoading
    };
  });

  return results;
};

/**
 * Hook para localStorage com debounce (útil para formulários)
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial
 * @param {number} delay - Delay do debounce em ms
 * @param {Object} options - Opções adicionais
 * @returns {Array} [value, setValue, removeValue, isLoading, isPending]
 */
export const useDebouncedLocalStorage = (key, initialValue, delay = 500, options = {}) => {
  const [value, setValue, removeValue, isLoading] = useLocalStorage(key, initialValue, options);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef(null);

  const debouncedSetValue = useCallback((newValue) => {
    setIsPending(true);
    
    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Define novo timeout
    timeoutRef.current = setTimeout(() => {
      setValue(newValue);
      setIsPending(false);
    }, delay);
  }, [setValue, delay]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, debouncedSetValue, removeValue, isLoading, isPending];
};

/**
 * Utilitários para localStorage
 */
export const localStorageUtils = {
  /**
   * Verifica se localStorage está disponível
   */
  isAvailable: () => {
    try {
      if (typeof window === 'undefined') return false;
      
      const test = '__localStorage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Obtém todas as chaves do localStorage
   */
  getAllKeys: () => {
    if (typeof window === 'undefined') return [];
    return Object.keys(window.localStorage);
  },

  /**
   * Limpa todo o localStorage
   */
  clear: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  },

  /**
   * Remove múltiplas chaves
   */
  removeMultiple: (keys) => {
    if (typeof window === 'undefined') return;
    
    keys.forEach(key => {
      window.localStorage.removeItem(key);
    });
  },

  /**
   * Obtém informações sobre uso do localStorage
   */
  getUsageInfo: () => {
    if (typeof window === 'undefined') {
      return { used: 0, total: 0, available: 0, percentage: 0 };
    }

    try {
      const used = JSON.stringify(window.localStorage).length;
      const total = 5 * 1024 * 1024; // 5MB padrão
      const available = total - used;
      const percentage = (used / total) * 100;

      return { used, total, available, percentage: Math.round(percentage * 100) / 100 };
    } catch {
      return { used: 0, total: 0, available: 0, percentage: 0 };
    }
  },

  /**
   * Exporta dados do localStorage
   */
  exportData: (keys = null) => {
    if (typeof window === 'undefined') return {};
    
    const keysToExport = keys || localStorageUtils.getAllKeys();
    const data = {};
    
    keysToExport.forEach(key => {
      try {
        data[key] = window.localStorage.getItem(key);
      } catch (error) {
        console.warn(`Erro ao exportar chave "${key}":`, error);
      }
    });
    
    return data;
  },

  /**
   * Importa dados para o localStorage
   */
  importData: (data, overwrite = false) => {
    if (typeof window === 'undefined') return;
    
    Object.entries(data).forEach(([key, value]) => {
      try {
        if (!overwrite && window.localStorage.getItem(key) !== null) {
          return; // Pula se já existe e não é para sobrescrever
        }
        
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.warn(`Erro ao importar chave "${key}":`, error);
      }
    });
  }
};

export default useLocalStorage;
