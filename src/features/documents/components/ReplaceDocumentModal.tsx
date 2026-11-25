import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileCheck2, Loader2, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DocumentItem } from '@/types/api';
import { useReplaceDocumentMutation } from '../hooks/useDocumentsAdmin';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface ReplaceDocumentModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export function ReplaceDocumentModal({
  document,
  onClose,
}: ReplaceDocumentModalProps) {
  const [newFile, setNewFile] = useState<File | null>(null);
  const replaceMutation = useReplaceDocumentMutation();

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setNewFile(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept: {
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt', '.md'],
    },
    onDropRejected: () => {
      toast.error('Archivo inválido. Usa PDF, MD o TXT de hasta 10 MB.');
    },
  });

  const handleClose = () => {
    if (replaceMutation.isPending) return;
    setNewFile(null);
    onClose();
  };

  const handleReplace = async () => {
    if (!document || !newFile) return;
    await replaceMutation.mutateAsync({ id: document.id, file: newFile });
    setNewFile(null);
    onClose();
  };

  return (
    <Dialog open={Boolean(document)} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reemplazar archivo y reindexar</DialogTitle>
          <DialogDescription>
            Estás reemplazando: <strong>{document?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription className="text-xs">
              Al reemplazar el archivo, el documento pasará a estado{' '}
              <strong>PROCESSING</strong> y no estará disponible para consultas
              hasta que sus nuevos fragmentos y embeddings terminen de generarse.
            </AlertDescription>
          </Alert>

          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {newFile ? (
              <div className="flex flex-col items-center gap-1">
                <FileCheck2 className="h-8 w-8 text-emerald-600" />
                <p className="text-sm font-medium">{newFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Haz clic o arrastra otro archivo si deseas cambiarlo
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Selecciona la nueva versión del documento
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, MD o TXT (máx. 10 MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={replaceMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleReplace}
            disabled={!newFile || replaceMutation.isPending}
            className="gap-2"
          >
            {replaceMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reemplazando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Confirmar reemplazo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}