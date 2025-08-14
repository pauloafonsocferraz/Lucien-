import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook para debounce de valores
 * @description Atrasa a atualização de um valor até que pare de mudar por um tempo específico
 * @param {*} value - Valor para fazer debounce
 * @param {number} delay - Delay em millisegundos (padrão: 300)
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.leading - Executa na primeira chamada (padrão: false)
 * @param {boolean} options.trailing - Executa na última chamada (padrão: true)
 * @param {number} options.maxWait - Tempo máximo de espera
 * @returns {*} Valor com debounce aplicado
 */
export const useDebounce = (
  value, 
  delay = 300, 
  { leading = false, trailing = true, maxWait } = {}
) => {
  // ===== STATE =====
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  // ===== REFS =====
  const timeoutRef = useRef();
  const maxTimeoutRef = useRef();
  const previousValueRef = useRef(value);
  const hasInvokedRef = useRef(false);

  // ===== EFFECT =====
  useEffect(() => {
    // Se o valor não mudou, não faz nada
    if (previousValueRef.current === value) {
      return;
    }

    // Limpa timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Leading edge - executa imediatamente na primeira chamada
    if (leading && !hasInvokedRef.current) {
      setDebouncedValue(value);
      hasInvokedRef.current = true;
    }

    // Configura o timeout principal
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        hasInvokedRef.current = false;
        
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }
      }, delay);
    }

    // Configura maxWait se especificado
    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        hasInvokedRef.current = false;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }, maxWait);
    }

    // Atualiza valor anterior
    previousValueRef.current = value;

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing, maxWait]);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  return debouncedValue;
};

/**
 * Hook para debounce de funções
 * @description Cria uma versão com debounce de uma função
 * @param {Function} func - Função para fazer debounce
 * @param {number} delay - Delay em millisegundos (padrão: 300)
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.leading - Executa na primeira chamada
 * @param {boolean} options.trailing - Executa na última chamada
 * @param {number} options.maxWait - Tempo máximo de espera
 * @returns {[Function, Function, Function]} [debouncedFunction, cancel, flush]
 */
export const useDebouncedCallback = (
  func,
  delay = 300,
  { leading = false, trailing = true, maxWait } = {}
) => {
  // ===== REFS =====
  const timeoutRef = useRef();
  const maxTimeoutRef = useRef();
  const funcRef = useRef(func);
  const argsRef = useRef();
  const thisRef = useRef();
  const hasInvokedRef = useRef(false);

  // Atualiza referência da função
  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  // ===== DEBOUNCED FUNCTION =====
  const debouncedFunction = useCallback(function(...args) {
    argsRef.current = args;
    thisRef.current = this;

    // Limpa timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Leading edge
    if (leading && !hasInvokedRef.current) {
      const result = funcRef.current.apply(thisRef.current, argsRef.current);
      hasInvokedRef.current = true;
      return result;
    }

    // Trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        funcRef.current.apply(thisRef.current, argsRef.current);
        hasInvokedRef.current = false;
        
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }
      }, delay);
    }

    // Max wait
    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        funcRef.current.apply(thisRef.current, argsRef.current);
        hasInvokedRef.current = false;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }, maxWait);
    }
  }, [delay, leading, trailing, maxWait]);

  // ===== CANCEL FUNCTION =====
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    hasInvokedRef.current = false;
  }, []);

  // ===== FLUSH FUNCTION =====
  const flush = useCallback(() => {
    if (timeoutRef.current || maxTimeoutRef.current) {
      if (argsRef.current && funcRef.current) {
        const result = funcRef.current.apply(thisRef.current, argsRef.current);
        cancel();
        return result;
      }
    }
    cancel();
  }, [cancel]);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedFunction, cancel, flush];
};

/**
 * Hook para debounce de efeitos
 * @description Executa um efeito apenas após um valor parar de mudar
 * @param {Function} effect - Função de efeito para executar
 * @param {Array} deps - Dependências para o efeito
 * @param {number} delay - Delay em millisegundos
 * @param {Object} options - Opções de configuração
 */
export const useDebouncedEffect = (
  effect,
  deps,
  delay = 300,
  { leading = false, trailing = true, maxWait } = {}
) => {
  // ===== REFS =====
  const timeoutRef = useRef();
  const maxTimeoutRef = useRef();
  const effectRef = useRef(effect);
  const hasInvokedRef = useRef(false);
  const previousDepsRef = useRef();

  // Atualiza referência do efeito
  useEffect(() => {
    effectRef.current = effect;
  });

  // ===== MAIN EFFECT =====
  useEffect(() => {
    // Verifica se as dependências mudaram
    const depsChanged = !previousDepsRef.current || 
      previousDepsRef.current.length !== deps.length ||
      previousDepsRef.current.some((dep, index) => dep !== deps[index]);

    if (!depsChanged) {
      return;
    }

    // Limpa timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Leading edge
    if (leading && !hasInvokedRef.current) {
      effectRef.current();
      hasInvokedRef.current = true;
    }

    // Trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        effectRef.current();
        hasInvokedRef.current = false;
        
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = null;
        }
      }, delay);
    }

    // Max wait
    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        effectRef.current();
        hasInvokedRef.current = false;
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }, maxWait);
    }

    // Atualiza dependências anteriores
    previousDepsRef.current = deps;

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [deps, delay, leading, trailing, maxWait]);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);
};

/**
 * Hook para debounce de estado com controle manual
 * @description Combina useState com debounce e funções de controle
 * @param {*} initialValue - Valor inicial
 * @param {number} delay - Delay em millisegundos
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e funções de controle
 */
export const useDebouncedState = (
  initialValue,
  delay = 300,
  options = {}
) => {
  // ===== STATE =====
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay, options);
  
  // ===== REFS =====
  const timeoutRef = useRef();
  
  // ===== HANDLERS =====
  const [debouncedCallback, cancel, flush] = useDebouncedCallback(
    (value) => setImmediateValue(value),
    delay,
    options
  );

  // ===== SET VALUE =====
  const setValue = useCallback((value) => {
    const nextValue = typeof value === 'function' 
      ? value(immediateValue) 
      : value;
    
    setImmediateValue(nextValue);
  }, [immediateValue]);

  // ===== SET DEBOUNCED VALUE =====
  const setDebouncedValue = useCallback((value) => {
    const nextValue = typeof value === 'function' 
      ? value(immediateValue) 
      : value;
    
    debouncedCallback(nextValue);
  }, [immediateValue, debouncedCallback]);

  // ===== IS PENDING =====
  const isPending = immediateValue !== debouncedValue;

  return {
    // Valores
    value: immediateValue,
    debouncedValue,
    
    // Estados
    isPending,
    
    // Setters
    setValue,
    setDebouncedValue,
    
    // Controles
    cancel,
    flush
  };
};

/**
 * Hook para debounce de busca/pesquisa
 * @description Hook especializado para funcionalidades de busca
 * @param {string} initialQuery - Query inicial
 * @param {Function} searchFunction - Função de busca
 * @param {number} delay - Delay em millisegundos
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e funções de busca
 */
export const useDebouncedSearch = (
  initialQuery = '',
  searchFunction,
  delay = 300,
  { minLength = 1, ...debounceOptions } = {}
) => {
  // ===== STATE =====
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedQuery = useDebounce(query, delay, debounceOptions);
  
  // ===== REFS =====
  const searchFunctionRef = useRef(searchFunction);
  const abortControllerRef = useRef();

  // Atualiza referência da função de busca
  useEffect(() => {
    searchFunctionRef.current = searchFunction;
  }, [searchFunction]);

  // ===== SEARCH EFFECT =====
  useEffect(() => {
    // Cancela busca anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpa resultados se query for muito pequena
    if (debouncedQuery.length < minLength) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Inicia nova busca
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      
      // Cria novo AbortController
      abortControllerRef.current = new AbortController();
      
      try {
        const searchResults = await searchFunctionRef.current(
          debouncedQuery, 
          { signal: abortControllerRef.current.signal }
        );
        
        // Verifica se não foi cancelado
        if (!abortControllerRef.current.signal.aborted) {
          setResults(searchResults || []);
        }
      } catch (err) {
        // Ignora erros de cancelamento
        if (err.name !== 'AbortError' && !abortControllerRef.current.signal.aborted) {
          setError(err);
          setResults([]);
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, minLength]);

  // ===== CLEAR FUNCTION =====
  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // ===== RETRY FUNCTION =====
  const retry = useCallback(() => {
    if (debouncedQuery.length >= minLength) {
      setQuery(prev => prev + ' '); // Força re-execução
      setTimeout(() => setQuery(prev => prev.trim()), 0);
    }
  }, [debouncedQuery, minLength]);

  return {
    // Estado da busca
    query,
    debouncedQuery,
    results,
    isLoading,
    error,
    
    // Flags
    hasQuery: debouncedQuery.length >= minLength,
    hasResults: results.length > 0,
    isEmpty: results.length === 0 && !isLoading && !error && debouncedQuery.length >= minLength,
    
    // Ações
    setQuery,
    clear,
    retry
  };
};

/**
 * Utilitário para criar função debounced fora de componentes
 * @param {Function} func - Função para debounce
 * @param {number} delay - Delay em millisegundos
 * @param {Object} options - Opções de configuração
 * @returns {Function} Função com debounce
 */
export const createDebouncedFunction = (
  func,
  delay = 300,
  { leading = false, trailing = true, maxWait } = {}
) => {
  let timeoutId;
  let maxTimeoutId;
  let hasInvoked = false;
  let lastArgs;
  let lastThis;

  const debouncedFunction = function(...args) {
    lastArgs = args;
    lastThis = this;

    // Limpa timeouts anteriores
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
    }

    // Leading edge
    if (leading && !hasInvoked) {
      const result = func.apply(lastThis, lastArgs);
      hasInvoked = true;
      return result;
    }

    // Trailing edge
    if (trailing) {
      timeoutId = setTimeout(() => {
        func.apply(lastThis, lastArgs);
        hasInvoked = false;
        
        if (maxTimeoutId) {
          clearTimeout(maxTimeoutId);
          maxTimeoutId = null;
        }
      }, delay);
    }

    // Max wait
    if (maxWait && !maxTimeoutId) {
      maxTimeoutId = setTimeout(() => {
        func.apply(lastThis, lastArgs);
        hasInvoked = false;
        
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }, maxWait);
    }
  };

  // Adiciona métodos de controle
  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
    hasInvoked = false;
  };

  debouncedFunction.flush = () => {
    if (timeoutId || maxTimeoutId) {
      if (lastArgs) {
        const result = func.apply(lastThis, lastArgs);
        debouncedFunction.cancel();
        return result;
      }
    }
    debouncedFunction.cancel();
  };

  return debouncedFunction;
};

export default useDebounce;
