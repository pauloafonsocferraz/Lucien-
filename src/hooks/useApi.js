import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook principal para gerenciamento de requisições API
 * @description Hook completo para requisições com loading, error, cache, retry
 * @param {string|Function} url - URL da API ou função que retorna URL
 * @param {Object} options - Opções de configuração
 * @param {Object} options.fetchOptions - Opções do fetch (method, headers, body, etc.)
 * @param {boolean} options.immediate - Executa imediatamente (padrão: true)
 * @param {boolean} options.cache - Habilita cache (padrão: false)
 * @param {number} options.cacheTime - Tempo de cache em ms (padrão: 5 minutos)
 * @param {number} options.retry - Número de tentativas (padrão: 0)
 * @param {number} options.retryDelay - Delay entre tentativas em ms (padrão: 1000)
 * @param {Function} options.retryCondition - Condição para retry
 * @param {Function} options.onSuccess - Callback de sucesso
 * @param {Function} options.onError - Callback de erro
 * @param {Function} options.transform - Função para transformar dados
 * @param {Array} options.deps - Dependências para re-executar
 * @returns {Object} Estado e funções da API
 */
export const useApi = (
  url,
  {
    fetchOptions = {},
    immediate = true,
    cache = false,
    cacheTime = 5 * 60 * 1000, // 5 minutos
    retry = 0,
    retryDelay = 1000,
    retryCondition = (error, attempt) => attempt < retry && error.status >= 500,
    onSuccess,
    onError,
    transform,
    deps = []
  } = {}
) => {
  // ===== STATE =====
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // ===== REFS =====
  const abortControllerRef = useRef();
  const retryTimeoutRef = useRef();
  const cacheRef = useRef(new Map());
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const transformRef = useRef(transform);

  // Atualiza refs
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    transformRef.current = transform;
  });

  // ===== CACHE FUNCTIONS =====
  const getCacheKey = useCallback((url, options) => {
    return JSON.stringify({ url, options });
  }, []);

  const getCachedData = useCallback((cacheKey) => {
    if (!cache) return null;
    
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cacheTime;
    if (isExpired) {
      cacheRef.current.delete(cacheKey);
      return null;
    }
    
    return cached.data;
  }, [cache, cacheTime]);

  const setCachedData = useCallback((cacheKey, data) => {
    if (!cache) return;
    
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }, [cache]);

  // ===== FETCH FUNCTION =====
  const fetchData = useCallback(async (customUrl, customOptions = {}, attempt = 0) => {
    // Resolve URL
    const resolvedUrl = typeof url === 'function' ? url() : (customUrl || url);
    if (!resolvedUrl) return;

    // Mescla opções
    const mergedOptions = { ...fetchOptions, ...customOptions };
    
    // Cache key
    const cacheKey = getCacheKey(resolvedUrl, mergedOptions);
    
    // Verifica cache primeiro
    if (attempt === 0) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        setLastFetch(Date.now());
        return cachedData;
      }
    }

    try {
      // Cancela requisição anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Novo AbortController
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      if (attempt === 0) {
        setError(null);
      }

      // Faz a requisição
      const response = await fetch(resolvedUrl, {
        ...mergedOptions,
        signal: abortControllerRef.current.signal
      });

      // Verifica se foi cancelada
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse da resposta
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      // Aplica transformação se fornecida
      if (transformRef.current) {
        responseData = transformRef.current(responseData);
      }

      // Salva no cache
      setCachedData(cacheKey, responseData);

      // Atualiza estado
      setData(responseData);
      setError(null);
      setLastFetch(Date.now());

      // Callback de sucesso
      if (onSuccessRef.current) {
        onSuccessRef.current(responseData);
      }

      return responseData;

    } catch (err) {
      // Ignora erros de cancelamento
      if (err.name === 'AbortError') {
        return;
      }

      // Adiciona informações do erro
      const enhancedError = {
        ...err,
        url: resolvedUrl,
        options: mergedOptions,
        attempt: attempt + 1,
        timestamp: Date.now()
      };

      // Verifica se deve tentar novamente
      if (retryCondition(enhancedError, attempt)) {
        // Retry com delay
        retryTimeoutRef.current = setTimeout(() => {
          fetchData(customUrl, customOptions, attempt + 1);
        }, retryDelay * Math.pow(2, attempt)); // Exponential backoff
        
        return;
      }

      // Atualiza estado com erro
      setError(enhancedError);
      setData(null);

      // Callback de erro
      if (onErrorRef.current) {
        onErrorRef.current(enhancedError);
      }

      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [url, fetchOptions, getCacheKey, getCachedData, setCachedData, retryCondition, retryDelay]);

  // ===== MANUAL EXECUTE =====
  const execute = useCallback((customUrl, customOptions) => {
    return fetchData(customUrl, customOptions);
  }, [fetchData]);

  // ===== REFRESH =====
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // ===== CANCEL =====
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setLoading(false);
  }, []);

  // ===== CLEAR CACHE =====
  const clearCache = useCallback((specificUrl) => {
    if (specificUrl) {
      const cacheKey = getCacheKey(specificUrl, fetchOptions);
      cacheRef.current.delete(cacheKey);
    } else {
      cacheRef.current.clear();
    }
  }, [getCacheKey, fetchOptions]);

  // ===== AUTO FETCH ON MOUNT/DEPS CHANGE =====
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [immediate, ...deps]);

  // ===== CLEANUP ON UNMOUNT =====
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  // ===== COMPUTED VALUES =====
  const isIdle = !loading && !data && !error;
  const isSuccess = !loading && data && !error;
  const isError = !loading && error;
  const hasData = !!data;

  return {
    // Estado
    data,
    loading,
    error,
    lastFetch,
    
    // Status flags
    isIdle,
    isSuccess,
    isError,
    hasData,
    
    // Ações
    execute,
    refresh,
    cancel,
    clearCache,
    
    // Utilitários
    setData,
    setError
  };
};

/**
 * Hook para múltiplas requisições API
 * @description Gerencia múltiplas requisições simultaneamente
 * @param {Array} requests - Array de configurações de requisições
 * @param {Object} options - Opções globais
 * @returns {Object} Estado consolidado das requisições
 */
export const useMultipleApi = (requests = [], options = {}) => {
  // ===== STATE =====
  const [results, setResults] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  // ===== REFS =====
  const requestsRef = useRef({});

  // ===== CREATE API HOOKS =====
  const apiHooks = useMemo(() => {
    return requests.reduce((acc, request, index) => {
      const key = request.key || `request_${index}`;
      
      acc[key] = useApi(request.url, {
        immediate: false,
        ...options,
        ...request.options,
        onSuccess: (data) => {
          setResults(prev => ({ ...prev, [key]: { data, error: null } }));
          if (request.options?.onSuccess) {
            request.options.onSuccess(data);
          }
        },
        onError: (error) => {
          setResults(prev => ({ ...prev, [key]: { data: null, error } }));
          if (request.options?.onError) {
            request.options.onError(error);
          }
        }
      });
      
      return acc;
    }, {});
  }, [requests, options]);

  // ===== EXECUTE ALL =====
  const executeAll = useCallback(() => {
    setGlobalLoading(true);
    setGlobalError(null);
    
    const promises = Object.values(apiHooks).map(hook => hook.execute());
    
    return Promise.allSettled(promises)
      .then(results => {
        const errors = results
          .filter(result => result.status === 'rejected')
          .map(result => result.reason);
        
        if (errors.length > 0) {
          setGlobalError(errors);
        }
        
        setGlobalLoading(false);
        return results;
      })
      .catch(error => {
        setGlobalError(error);
        setGlobalLoading(false);
        throw error;
      });
  }, [apiHooks]);

  // ===== EXECUTE BY KEY =====
  const executeByKey = useCallback((key) => {
    const hook = apiHooks[key];
    if (hook) {
      return hook.execute();
    }
    throw new Error(`Request with key "${key}" not found`);
  }, [apiHooks]);

  // ===== CANCEL ALL =====
  const cancelAll = useCallback(() => {
    Object.values(apiHooks).forEach(hook => hook.cancel());
    setGlobalLoading(false);
  }, [apiHooks]);

  // ===== COMPUTED VALUES =====
  const allLoading = Object.values(apiHooks).every(hook => hook.loading);
  const someLoading = Object.values(apiHooks).some(hook => hook.loading);
  const allSuccess = Object.values(apiHooks).every(hook => hook.isSuccess);
  const someError = Object.values(apiHooks).some(hook => hook.isError);

  return {
    // Estado individual
    ...apiHooks,
    
    // Estado consolidado
    results,
    globalLoading: globalLoading || someLoading,
    globalError,
    
    // Status flags
    allLoading,
    someLoading,
    allSuccess,
    someError,
    
    // Ações
    executeAll,
    executeByKey,
    cancelAll
  };
};

/**
 * Hook para paginação com API
 * @description Gerencia paginação de dados da API
 * @param {string} url - URL base da API
 * @param {Object} options - Opções de configuração
 * @param {number} options.initialPage - Página inicial (padrão: 1)
 * @param {number} options.pageSize - Tamanho da página (padrão: 10)
 * @param {string} options.pageParam - Nome do parâmetro de página (padrão: 'page')
 * @param {string} options.sizeParam - Nome do parâmetro de tamanho (padrão: 'limit')
 * @param {Function} options.getNextPageParam - Função para obter próxima página
 * @param {Function} options.getPreviousPageParam - Função para obter página anterior
 * @returns {Object} Estado e funções de paginação
 */
export const usePaginatedApi = (
  url,
  {
    initialPage = 1,
    pageSize = 10,
    pageParam = 'page',
    sizeParam = 'limit',
    getNextPageParam,
    getPreviousPageParam,
    ...apiOptions
  } = {}
) => {
  // ===== STATE =====
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [allData, setAllData] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ===== API HOOK =====
  const {
    data,
    loading,
    error,
    execute,
    refresh,
    cancel
  } = useApi(
    () => {
      if (!url) return null;
      
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set(pageParam, currentPage.toString());
      urlObj.searchParams.set(sizeParam, pageSize.toString());
      
      return urlObj.toString();
    },
    {
      immediate: false,
      ...apiOptions,
      deps: [currentPage, pageSize],
      onSuccess: (data) => {
        // Atualiza dados paginados
        if (data && data.items) {
          setAllData(prev => currentPage === 1 ? data.items : [...prev, ...data.items]);
          setTotalCount(data.total || 0);
          setTotalPages(Math.ceil((data.total || 0) / pageSize));
          
          // Determina se há próxima/anterior página
          if (getNextPageParam) {
            setHasNextPage(!!getNextPageParam(data));
          } else {
            setHasNextPage(currentPage < Math.ceil((data.total || 0) / pageSize));
          }
          
          if (getPreviousPageParam) {
            setHasPreviousPage(!!getPreviousPageParam(data));
          } else {
            setHasPreviousPage(currentPage > 1);
          }
        }
        
        if (apiOptions.onSuccess) {
          apiOptions.onSuccess(data);
        }
      }
    }
  );

  // ===== LOAD INITIAL DATA =====
  useEffect(() => {
    if (url) {
      execute();
    }
  }, [url, execute]);

  // ===== PAGE NAVIGATION =====
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  // ===== LOAD MORE =====
  const loadMore = useCallback(() => {
    if (hasNextPage && !loading) {
      nextPage();
    }
  }, [hasNextPage, loading, nextPage]);

  // ===== RESET =====
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setAllData([]);
    setHasNextPage(true);
    setHasPreviousPage(false);
    setTotalCount(0);
    setTotalPages(0);
  }, [initialPage]);

  return {
    // Dados
    data,
    allData,
    loading,
    error,
    
    // Paginação
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    
    // Navegação
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    loadMore,
    
    // Ações
    refresh,
    reset,
    cancel
  };
};

/**
 * Hook para upload de arquivos
 * @description Gerencia upload de arquivos com progresso
 * @param {string} url - URL para upload
 * @param {Object} options - Opções de configuração
 * @returns {Object} Estado e funções de upload
 */
export const useFileUpload = (
  url,
  {
    multiple = false,
    accept = '',
    maxSize = 10 * 1024 * 1024, // 10MB
    onProgress,
    onSuccess,
    onError,
    ...apiOptions
  } = {}
) => {
  // ===== STATE =====
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // ===== REFS =====
  const abortControllerRef = useRef();

  // ===== FILE VALIDATION =====
  const validateFile = useCallback((file) => {
    // Verifica tamanho
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`;
    }
    
    // Verifica tipo se accept foi especificado
    if (accept && !accept.split(',').some(type => {
      const cleanType = type.trim();
      if (cleanType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(cleanType.toLowerCase());
      }
      return file.type.match(new RegExp(cleanType));
    })) {
      return `Tipo de arquivo não aceito. Aceitos: ${accept}`;
    }
    
    return null;
  }, [maxSize, accept]);

  // ===== ADD FILES =====
  const addFiles = useCallback((newFiles) => {
    const fileList = Array.from(newFiles);
    const validatedFiles = fileList.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      error: validateFile(file),
      uploaded: false
    }));

    setFiles(prev => multiple ? [...prev, ...validatedFiles] : validatedFiles);
    setUploadError(null);
  }, [multiple, validateFile]);

  // ===== REMOVE FILE =====
  const removeFile = useCallback((fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // ===== UPLOAD FILES =====
  const upload = useCallback(async () => {
    const validFiles = files.filter(f => !f.error && !f.uploaded);
    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setProgress(0);

    // Cancela upload anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      
      if (multiple) {
        validFiles.forEach((fileObj, index) => {
          formData.append(`files[${index}]`, fileObj.file);
        });
      } else {
        formData.append('file', validFiles[0].file);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
        ...apiOptions.fetchOptions
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Marca arquivos como enviados
      setFiles(prev => prev.map(f => 
        validFiles.find(vf => vf.id === f.id) 
          ? { ...f, uploaded: true }
          : f
      ));
      
      setUploadedFiles(prev => [...prev, ...result]);
      setProgress(100);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      if (error.name !== 'AbortError') {
        setUploadError(error);
        if (onError) {
          onError(error);
        }
      }
      throw error;
    } finally {
      setUploading(false);
    }
  }, [files, url, multiple, onSuccess, onError, apiOptions.fetchOptions]);

  // ===== CANCEL UPLOAD =====
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploading(false);
    setProgress(0);
  }, []);

  // ===== CLEAR =====
  const clear = useCallback(() => {
    setFiles([]);
    setUploadedFiles([]);
    setProgress(0);
    setUploadError(null);
  }, []);

  // ===== COMPUTED VALUES =====
  const hasValidFiles = files.some(f => !f.error && !f.uploaded);
  const hasErrors = files.some(f => f.error);
  const allUploaded = files.length > 0 && files.every(f => f.uploaded || f.error);

  return {
    // Estado
    files,
    uploading,
    progress,
    uploadError,
    uploadedFiles,
    
    // Status
    hasValidFiles,
    hasErrors,
    allUploaded,
    
    // Ações
    addFiles,
    removeFile,
    upload,
    cancelUpload,
    clear
  };
};

export default useApi;
