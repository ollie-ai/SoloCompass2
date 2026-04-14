import { useState, useEffect, useCallback, useRef } from 'react';
import api, { createCancelToken, isCancel } from '../lib/api';
import { getErrorMessage, isNetworkError, ERROR_MESSAGES } from '../lib/utils';

export function useApi(fetchFn, dependencies = [], options = {}) {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const cancelSourceRef = useRef(null);

  const execute = useCallback(async (...args) => {
    cancelSourceRef.current = createCancelToken();
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(...args, cancelSourceRef.current.token);
      const result = response.data?.data ?? response.data;
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (isCancel(err)) {
        return null;
      }
      const errorMsg = getErrorMessage(err, ERROR_MESSAGES.DEFAULT);
      setError(errorMsg);
      onError?.(errorMsg, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  const cancel = useCallback(() => {
    if (cancelSourceRef.current) {
      cancelSourceRef.current.cancel('Request cancelled');
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    return () => cancel();
  }, dependencies);

  return { data, loading, error, execute, cancel, setData };
}

export function useFetch(url, options = {}) {
  const { 
    immediate = true, 
    transform = (d) => d,
    ...hookOptions 
  } = options;

  const fetchFn = useCallback(async (token) => {
    const response = await api.get(url, { cancelToken: token });
    return transform(response.data);
  }, [url, transform]);

  return useApi(fetchFn, [url], { immediate, ...hookOptions });
}

export { getErrorMessage, isNetworkError, ERROR_MESSAGES };
