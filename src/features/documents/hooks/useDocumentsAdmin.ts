import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  documentsApi,
  type DocumentFilters,
  type UpdateDocumentMetadataRequest,
} from '@/api/documents.api';
import type { ApiError } from '@/types/api';

export const DOCUMENTS_KEYS = {
  all: ['documents'] as const,
  list: (filters: DocumentFilters) => ['documents', 'list', filters] as const,
  stats: ['documents', 'stats'] as const,
};

export function useDocumentStatsQuery() {
  return useQuery({
    queryKey: DOCUMENTS_KEYS.stats,
    queryFn: documentsApi.getStats,
    refetchInterval: (query) => {
      const processingCount = query.state.data?.processing ?? 0;
      return processingCount > 0 ? 3000 : false;
    },
  });
}

export function useDocumentsListQuery(filters: DocumentFilters) {
  return useQuery({
    queryKey: DOCUMENTS_KEYS.list(filters),
    queryFn: () => documentsApi.getDocuments(filters),
    refetchInterval: (query) => {
      const docs = query.state.data?.content ?? [];
      const hasActive = docs.some(
        (doc) => doc.status === 'PENDING' || doc.status === 'PROCESSING'
      );
      return hasActive ? 3000 : false;
    },
  });
}

export function useUploadDocumentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => documentsApi.uploadDocuments(files),
    onSuccess: (uploaded) => {
      toast.success(
        uploaded.length === 1
          ? `Documento "${uploaded[0].name}" enviado a procesamiento.`
          : `${uploaded.length} documentos enviados a procesamiento.`
      );
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al subir los documentos.');
    },
  });
}

export function useUpdateDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateDocumentMetadataRequest;
    }) => documentsApi.updateMetadata(id, payload),
    onSuccess: () => {
      toast.success('Metadatos actualizados correctamente.');
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
    },
    onError: (error: ApiError) => {
      if (!error.fieldErrors) {
        toast.error(error.message || 'No se pudieron actualizar los metadatos.');
      }
    },
  });
}

export function useReplaceDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      documentsApi.replaceFile(id, file),
    onSuccess: (updated) => {
      toast.success(
        `"${updated.name}" reemplazado. Reindexando fragmentos en segundo plano.`
      );
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al reemplazar el archivo.');
    },
  });
}

export function useReprocessDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentsApi.reprocess(id),
    onSuccess: (doc) => {
      toast.info(`Reintentando procesamiento de "${doc.name}"...`);
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'No se pudo reprocesar el documento.');
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      toast.success('Documento y sus vectores eliminados de la base de conocimiento.');
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEYS.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Error al eliminar el documento.');
    },
  });
}

export function useOpenDocumentFile() {
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const blob = await documentsApi.getDocumentFile(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // Si es PDF o TXT el navegador lo abre en pestaña; si no, lo descarga con su nombre
      if (!name.toLowerCase().endsWith('.pdf') && !name.toLowerCase().endsWith('.txt')) {
        link.download = name;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'No se pudo abrir el archivo.');
    },
  });
}