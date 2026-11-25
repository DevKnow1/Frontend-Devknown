import { CheckCircle2, Clock, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentStatsQuery } from '../hooks/useDocumentsAdmin';

export function DocumentStatsCards() {
  const { data: stats, isLoading } = useDocumentStatsQuery();

  const cards = [
    {
      title: 'Total de documentos',
      value: stats?.total ?? 0,
      description: 'Archivos registrados en el sistema',
      icon: FileText,
      iconClass: 'text-slate-600',
    },
    {
      title: 'Disponibles (RAG)',
      value: stats?.available ?? 0,
      description: 'Indexados y listos para consultas',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
    },
    {
      title: 'En procesamiento',
      value: stats?.processing ?? 0,
      description: 'Extrayendo texto y embeddings',
      icon: Clock,
      iconClass: 'text-amber-600',
    },
    {
      title: 'Con error',
      value: stats?.error ?? 0,
      description: 'Requieren revisión o reproceso',
      icon: AlertTriangle,
      iconClass: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${item.iconClass}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{item.value}</div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}