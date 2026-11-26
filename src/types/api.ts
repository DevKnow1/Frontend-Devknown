export type Role = 'USER' | 'ADMIN';

export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'AVAILABLE' | 'ERROR';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface Source {
  index: number;
  documentId: number;
  documentName: string;
  page: number | null;
  section: string | null;
  fragment: string;
  chunkId: number;
  score: number;
}

export interface ChatRequest {
  conversationId?: number;
  question: string;
}

export interface ChatResponse {
  conversationId: number;
  messageId: number;
  insufficientEvidence: boolean;
  answer: string;
  sources: Source[];
}

export interface ConversationSummary {
  id: number;
  title?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  insufficientEvidence?: boolean;
  sources?: Source[];
  createdAt: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: ChatMessage[];
}

export interface DocumentItem {
  id: number;
  name: string;
  description?: string | null;
  status: DocumentStatus;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// POST /api/documents: un resultado por archivo (201 si se aceptó alguno, 400 si ninguno)
export interface UploadResult {
  filename: string;
  accepted: boolean;
  error: string | null;
  document: DocumentItem | null;
}

export interface DocumentStats {
  total: number;
  available: number;
  processing: number;
  error: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
  conversationId?: number;
}