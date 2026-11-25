import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApi } from '@/api/chat.api';
import { documentsApi } from '@/api/documents.api';
import type { ApiError, ChatRequest } from '@/types/api';

export const CHAT_KEYS = {
  all: ['conversations'] as const,
  list: ['conversations', 'list'] as const,
  detail: (id: number) => ['conversations', 'detail', id] as const,
};

export function useConversationsQuery() {
  return useQuery({
    queryKey: CHAT_KEYS.list,
    queryFn: chatApi.getConversations,
  });
}

export function useConversationDetailQuery(conversationId?: number) {
  return useQuery({
    queryKey: CHAT_KEYS.detail(conversationId ?? 0),
    queryFn: () => chatApi.getConversationById(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useAskQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChatRequest) => chatApi.askQuestion(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.list });
      queryClient.invalidateQueries({
        queryKey: CHAT_KEYS.detail(response.conversationId),
      });
    },
    onError: (error: ApiError) => {
      // Si el proveedor de IA falló (503/429), la pregunta ya quedó guardada con conversationId
      if (error.conversationId) {
        queryClient.invalidateQueries({ queryKey: CHAT_KEYS.list });
        queryClient.invalidateQueries({
          queryKey: CHAT_KEYS.detail(error.conversationId),
        });
      }
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => chatApi.deleteConversation(id),
    onSuccess: (_data, deletedId) => {
      toast.success('Conversación eliminada.');
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.list });
      queryClient.removeQueries({ queryKey: CHAT_KEYS.detail(deletedId) });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'No se pudo eliminar la conversación.');
    },
  });
}

export function useOpenSourceDocument() {
  return useMutation({
    mutationFn: async ({
      documentId,
      documentName,
    }: {
      documentId: number;
      documentName: string;
    }) => {
      const blob = await documentsApi.getDocumentFile(documentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      if (
        !documentName.toLowerCase().endsWith('.pdf') &&
        !documentName.toLowerCase().endsWith('.txt')
      ) {
        link.download = documentName;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    onError: (error: ApiError) => {
      toast.error(
        error.message || 'El documento no está disponible para visualización.'
      );
    },
  });
}