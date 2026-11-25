import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { ApiError, ChatMessage, Source } from '@/types/api';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { ConversationSidebar } from './components/ConversationSidebar';
import { SourceInspectorPanel } from './components/SourceInspectorPanel';
import {
  useAskQuestionMutation,
  useConversationDetailQuery,
} from './hooks/useChat';

const SAMPLE_PROMPTS = [
  '¿Cómo está estructurada la autenticación JWT en el proyecto?',
  '¿Cuáles son las convenciones de manejo de errores en la API?',
  '¿Qué pasos debo seguir para configurar el entorno local?',
];

export function ChatPage() {
  const { conversationId: paramId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const activeConversationId = paramId ? Number(paramId) : undefined;

  const [questionInput, setQuestionInput] = useState('');
  const [optimisticQuestion, setOptimisticQuestion] = useState<string | null>(
    null
  );
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(
    null
  );
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Estado del panel inspector de fuentes
  const [inspectedSources, setInspectedSources] = useState<Source[]>([]);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: conversationDetail, isLoading: isLoadingHistory } =
    useConversationDetailQuery(activeConversationId);

  const askMutation = useAskQuestionMutation();

  const messages: ChatMessage[] = conversationDetail?.messages ?? [];

  // Desplaza el scroll automáticamente al recibir mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, optimisticQuestion, serviceError]);

  // Limpia estado transitorio al cambiar de conversación
  const handleStartNewChat = () => {
    setQuestionInput('');
    setOptimisticQuestion(null);
    setLastFailedQuestion(null);
    setServiceError(null);
    setInspectedSources([]);
    setActiveSourceIndex(null);
    navigate('/chat');
  };

  const handleInspectSources = (sources: Source[], selectedIndex?: number) => {
    setInspectedSources(sources);
    setActiveSourceIndex(selectedIndex ?? sources[0]?.index ?? null);
  };

  const submitQuestion = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || askMutation.isPending) return;

    setQuestionInput('');
    setServiceError(null);
    setLastFailedQuestion(null);
    setOptimisticQuestion(trimmed);

    try {
      const response = await askMutation.mutateAsync({
        conversationId: activeConversationId,
        question: trimmed,
      });

      setOptimisticQuestion(null);

      // Si había fuentes en la respuesta y el panel ya estaba abierto, las actualiza
      if (response.sources.length > 0 && inspectedSources.length > 0) {
        setInspectedSources(response.sources);
        setActiveSourceIndex(response.sources[0].index);
      }

      if (!activeConversationId) {
        navigate(`/chat/${response.conversationId}`, { replace: true });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setOptimisticQuestion(null);
      setLastFailedQuestion(trimmed);
      setServiceError(
        apiError.message ||
          'El servicio de IA no pudo completar la consulta en este momento.'
      );

      // Si el backend alcanzó a guardar la pregunta y devolvió conversationId, navegamos a ella
      if (!activeConversationId && apiError.conversationId) {
        navigate(`/chat/${apiError.conversationId}`, { replace: true });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuestion(questionInput);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Barra lateral de conversaciones */}
      <ConversationSidebar
        activeConversationId={activeConversationId}
        onNewChat={handleStartNewChat}
      />

      {/* Área principal del Tutor Inteligente */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">
              {conversationDetail?.title ||
                (activeConversationId
                  ? `Conversación #${activeConversationId}`
                  : 'Nueva consulta técnica')}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Respuestas fundamentadas exclusivamente en la documentación indexada
            </p>
          </div>
        </header>

        {/* Historial de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            {isLoadingHistory ? (
              <div className="space-y-4">
                <Skeleton className="ml-auto h-14 w-2/3 rounded-2xl" />
                <Skeleton className="h-32 w-4/5 rounded-2xl" />
              </div>
            ) : messages.length === 0 && !optimisticQuestion ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">
                  ¿Qué necesitas consultar hoy?
                </h2>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Formula preguntas en lenguaje natural sobre guías internas,
                  arquitectura o estándares del equipo. Cada afirmación incluirá
                  su fuente documental.
                </p>

                <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-1">
                  {SAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitQuestion(prompt)}
                      className="rounded-lg border bg-card px-4 py-2.5 text-left text-xs text-muted-foreground hover:border-primary/50 hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    onInspectSources={handleInspectSources}
                  />
                ))}

                {/* Burbuja optimista mientras responde el LLM */}
                {optimisticQuestion && (
                  <>
                    <ChatMessageBubble
                      message={{
                        id: -1,
                        role: 'USER',
                        content: optimisticQuestion,
                        createdAt: new Date().toISOString(),
                      }}
                      onInspectSources={handleInspectSources}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>
                        Buscando fragmentos relevantes y redactando respuesta...
                      </span>
                    </div>
                  </>
                )}

                {/* Banner de error controlado (HU-09) */}
                {serviceError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs font-semibold">
                      Error en el servicio de consultas
                    </AlertTitle>
                    <AlertDescription className="mt-1 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                      <span>{serviceError}</span>
                      {lastFailedQuestion && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1.5 bg-background text-foreground shrink-0"
                          onClick={() => submitQuestion(lastFailedQuestion)}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reintentar
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Caja de entrada de preguntas */}
        <div className="shrink-0 border-t bg-background px-4 py-3 sm:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuestion(questionInput);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <Textarea
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta técnica... (Enter para enviar, Shift+Enter para salto de línea)"
              rows={2}
              disabled={askMutation.isPending}
              className="min-h-[52px] max-h-40 resize-none text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="h-[52px] w-[52px] shrink-0"
              disabled={!questionInput.trim() || askMutation.isPending}
              title="Enviar pregunta"
            >
              {askMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </main>

      {/* Panel derecho para inspeccionar citas documentales (HU-07) */}
      {inspectedSources.length > 0 && (
        <SourceInspectorPanel
          sources={inspectedSources}
          activeSourceIndex={activeSourceIndex}
          onSelectIndex={setActiveSourceIndex}
          onClose={() => {
            setInspectedSources([]);
            setActiveSourceIndex(null);
          }}
        />
      )}
    </div>
  );
}