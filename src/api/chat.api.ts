import { apiClient } from './client';
import type {
  ChatRequest,
  ChatResponse,
  ConversationDetail,
  ConversationSummary,
} from '../types/api';

export const chatApi = {
  // HU-02 a HU-09, HU-24 (RF-18..21, RF-23): Envía consulta nueva o de seguimiento
  askQuestion: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/chat', payload);
    return data;
  },

  // HU-22, HU-23 (RF-22): Lista "Mis conversaciones"
  getConversations: async (): Promise<ConversationSummary[]> => {
    const { data } = await apiClient.get<ConversationSummary[]>('/conversations');
    return data;
  },

  // HU-23 (RF-22): Recupera mensajes y fuentes de una conversación
  getConversationById: async (id: number): Promise<ConversationDetail> => {
    const { data } = await apiClient.get<ConversationDetail>(`/conversations/${id}`);
    return data;
  },

  // RNF-09: Elimina una conversación propia
  deleteConversation: async (id: number): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },
};