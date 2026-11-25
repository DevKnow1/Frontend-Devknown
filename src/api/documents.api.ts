import { apiClient } from './client';
import type {
  DocumentItem,
  DocumentStats,
  PageResponse,
} from '../types/api';

export interface DocumentFilters {
  q?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UpdateDocumentMetadataRequest {
  name?: string;
  description?: string;
}

export const documentsApi = {
  // HU-07 (RF-20): Descarga/abre el archivo original (usuarios: solo AVAILABLE)
  getDocumentFile: async (id: number): Promise<Blob> => {
    const { data } = await apiClient.get<Blob>(`/documents/${id}/file`, {
      responseType: 'blob',
    });
    return data;
  },

  // HU-14, HU-15, HU-20 (RF-06, RF-07, RF-12): Carga múltiple multipart
  uploadDocuments: async (files: File[]): Promise<DocumentItem[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const { data } = await apiClient.post<DocumentItem[]>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // HU-25 (RF-25): Listado paginado con búsqueda y filtro por estado
  getDocuments: async (params: DocumentFilters): Promise<PageResponse<DocumentItem>> => {
    const { data } = await apiClient.get<PageResponse<DocumentItem>>('/documents', {
      params,
    });
    return data;
  },

  // HU-25 (RF-25): Tarjetas de resumen (total, disponibles, procesando, errores)
  getStats: async (): Promise<DocumentStats> => {
    const { data } = await apiClient.get<DocumentStats>('/documents/stats');
    return data;
  },

  // HU-20 (RF-12): Pantalla de documentos pendientes y en procesamiento
  getProcessing: async (): Promise<DocumentItem[]> => {
    const { data } = await apiClient.get<DocumentItem[]>('/documents/processing');
    return data;
  },

  // HU-26 (RF-26): Consulta metadatos de un documento
  getById: async (id: number): Promise<DocumentItem> => {
    const { data } = await apiClient.get<DocumentItem>(`/documents/${id}`);
    return data;
  },

  // HU-27 (RF-27): Edita nombre y descripción
  updateMetadata: async (
    id: number,
    payload: UpdateDocumentMetadataRequest
  ): Promise<DocumentItem> => {
    const { data } = await apiClient.patch<DocumentItem>(`/documents/${id}`, payload);
    return data;
  },

  // HU-28, HU-29 (RF-28, RF-29): Reemplaza el archivo y reindexa atómicamente
  replaceFile: async (id: number, file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.put<DocumentItem>(
      `/documents/${id}/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  // HU-21 (RF-13): Reintenta el procesamiento tras un estado ERROR
  reprocess: async (id: number): Promise<DocumentItem> => {
    const { data } = await apiClient.post<DocumentItem>(`/documents/${id}/reprocess`);
    return data;
  },

  // HU-30 (RF-30): Elimina documento, chunks y embeddings
  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};