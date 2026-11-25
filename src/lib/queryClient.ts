import { QueryClient, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { ApiError, DocumentItem, PageResponse } from '../types/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const apiErr = error as unknown as ApiError;
        if (apiErr?.status === 401 || apiErr?.status === 403 || apiErr?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Ejemplo de hook para el listado administrativo (HU-20, HU-25) con polling automático
export function useDocumentsQuery(params: {
  q?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PageResponse<DocumentItem>>('/documents', {
        params,
      });
      return data;
    },
    // Consulta cada 3s solo mientras haya documentos en cola o procesándose
    refetchInterval: (query) => {
      const docs = query.state.data?.content ?? [];
      const hasActiveProcessing = docs.some(
        (doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING'
      );
      return hasActiveProcessing ? 3000 : false;
    },
  });
}