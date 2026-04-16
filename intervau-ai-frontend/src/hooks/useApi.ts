import { useState, useCallback, useRef } from "react";
import * as apiService from "@/services/api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for making API calls with loading and error states
 */
export const useApi = <T>(
  apiCall: () => Promise<T>,
  options?: UseApiOptions
) => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      options?.onSuccess?.();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      options?.onError?.(error);
      throw error;
    }
  }, [apiCall, options]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

interface UseFormErrors {
  [key: string]: string[];
}

interface UseFormValues {
  [key: string]: any;
}

interface UseFormOptions {
  onSubmit: (values: UseFormValues) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseFormMethods {
  values: UseFormValues;
  errors: UseFormErrors;
  touched: { [key: string]: boolean };
  loading: boolean;
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  resetForm: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Custom hook for form state management with validation
 */
export const useForm = (
  initialValues: UseFormValues,
  options: UseFormOptions
): UseFormMethods => {
  const [values, setValues] = useState<UseFormValues>(initialValues);
  const [errors, setErrors] = useState<UseFormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      setLoading(true);
      setErrors({});

      try {
        await options.onSubmit(values);
        options.onSuccess?.();
        resetForm();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setErrors((prev) => ({
          ...prev,
          submit: [error.message],
        }));
        options.onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [values, options, resetForm]
  );

  return {
    values,
    errors,
    touched,
    loading,
    setFieldValue,
    setFieldTouched,
    resetForm,
    handleSubmit,
  };
};

/**
 * Custom hook for fetching data on component mount
 */
export const useFetch = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  React.useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for paginated data fetching
 */
interface UsePaginationOptions {
  pageSize?: number;
}

export const usePagination = <T>(
  apiCall: (
    page: number,
    pageSize: number
  ) => Promise<{ items: T[]; total: number }>,
  options: UsePaginationOptions = {}
) => {
  const pageSize = options.pageSize || 10;
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(pageNum, pageSize);
        setData(result.items);
        setTotal(result.total);
        setPage(pageNum);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [apiCall, pageSize]
  );

  React.useEffect(() => {
    fetchPage(1);
  }, [apiCall, pageSize]);

  return {
    data,
    total,
    page,
    pageSize,
    loading,
    error,
    goToPage: fetchPage,
    nextPage: () => fetchPage(page + 1),
    prevPage: () => fetchPage(Math.max(1, page - 1)),
  };
};
