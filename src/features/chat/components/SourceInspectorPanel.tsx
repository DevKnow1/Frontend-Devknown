import { BookOpen, ExternalLink, FileText, Hash, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Source } from '@/types/api';
import { useOpenSourceDocument } from '../hooks/useChat';

interface SourceInspectorPanelProps {
  sources: Source[];
  activeSourceIndex: number | null;
  onSelectIndex: (index: number) => void;
  onClose: () => void;
}

export function SourceInspectorPanel({
  sources,
  activeSourceIndex,
  onSelectIndex,
  onClose,
}: SourceInspectorPanelProps) {
  const openFileMutation = useOpenSourceDocument();

  if (sources.length === 0) return null;

  return (
    <aside className="flex h-full w-full flex-col border-l bg-muted/20 lg:w-[380px] shrink-0">
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">
            Fuentes documentales ({sources.length})
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          title="Cerrar panel de fuentes"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {sources.map((source) => {
            const isSelected = activeSourceIndex === source.index;
            const similarityPercent = Math.round(source.score * 100);

            return (
              <div
                key={`${source.chunkId}-${source.index}`}
                onClick={() => onSelectIndex(source.index)}
                className={`rounded-lg border bg-card p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                    : 'hover:border-muted-foreground/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant={isSelected ? 'default' : 'secondary'}
                      className="font-mono shrink-0"
                    >
                      [{source.index}]
                    </Badge>
                    <div className="min-w-0">
                      <p
                        className="truncate text-xs font-semibold"
                        title={source.documentName}
                      >
                        {source.documentName}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {source.page !== null && (
                          <span className="inline-flex items-center gap-0.5">
                            <FileText className="h-3 w-3" />
                            Pág. {source.page}
                          </span>
                        )}
                        {source.section && (
                          <span className="inline-flex items-center gap-0.5 truncate max-w-[180px]">
                            <Hash className="h-3 w-3 shrink-0" />
                            {source.section}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] font-mono"
                    title="Puntuación de similitud semántica"
                  >
                    {similarityPercent}% match
                  </Badge>
                </div>

                <blockquote className="mt-3 rounded border-l-2 border-primary/50 bg-muted/50 px-3 py-2 text-xs text-muted-foreground italic leading-relaxed">
                  “{source.fragment}”
                </blockquote>

                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    disabled={openFileMutation.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileMutation.mutate({
                        documentId: source.documentId,
                        documentName: source.documentName,
                      });
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Abrir documento
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}