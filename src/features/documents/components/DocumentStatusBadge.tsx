import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DocumentStatus } from '@/types/api';

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  errorMessage?: string | null;
}

export function DocumentStatusBadge({
  status,
  errorMessage,
}: DocumentStatusBadgeProps) {
  switch (status) {
    case 'AVAILABLE':
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1.5"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Disponible
        </Badge>
      );

    case 'PROCESSING':
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700 gap-1.5"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Procesando
        </Badge>
      );

    case 'PENDING':
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700 gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" />
          Pendiente
        </Badge>
      );

    case 'ERROR':
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="destructive" className="gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Error
          </Badge>
          {errorMessage && (
            <span
              className="max-w-[240px] truncate text-xs text-red-600"
              title={errorMessage}
            >
              {errorMessage}
            </span>
          )}
        </div>
      );
  }
}