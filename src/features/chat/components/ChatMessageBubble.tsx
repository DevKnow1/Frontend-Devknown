import { AlertTriangle, BookOpen, Bot, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ChatMessage, Source } from '@/types/api';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onInspectSources: (sources: Source[], selectedIndex?: number) => void;
}

export function ChatMessageBubble({
  message,
  onInspectSources,
}: ChatMessageBubbleProps) {
  const isUser = message.role === 'USER';

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  const sources = message.sources ?? [];

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background text-primary shadow-sm">
        <Bot className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-3 max-w-[88%]">
        {message.insufficientEvidence ? (
          <Alert className="border-amber-300 bg-amber-50/70 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-sm font-semibold">
              Evidencia documental insuficiente
            </AlertTitle>
            <AlertDescription className="mt-1 text-xs leading-relaxed">
              {message.content}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3.5 text-sm shadow-sm">
            <MarkdownRenderer
              content={message.content}
              onSelectSource={(index) => onInspectSources(sources, index)}
            />

            {sources.length > 0 && (
              <div className="mt-3 border-t pt-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground mr-1">
                    <BookOpen className="h-3 w-3" />
                    Fuentes:
                  </span>
                  {sources.map((src) => (
                    <button
                      key={`${src.chunkId}-${src.index}`}
                      type="button"
                      onClick={() => onInspectSources(sources, src.index)}
                      className="inline-flex items-center gap-1 rounded-md border bg-muted/60 px-2 py-0.5 text-[11px] text-foreground hover:border-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      <span className="font-mono font-semibold text-primary">
                        [{src.index}]
                      </span>
                      <span className="max-w-[160px] truncate">
                        {src.documentName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}