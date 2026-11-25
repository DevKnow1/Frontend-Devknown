import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { FileUp, Loader2, Trash2, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUploadDocumentsMutation } from '../hooks/useDocumentsAdmin';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB (RNF-02)

const ACCEPTED_MIME_TYPES = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt', '.md'],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function DocumentUploadDropzone() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const uploadMutation = useUploadDocumentsMutation();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          const reason = errors
            .map((e) =>
              e.code === 'file-too-large'
                ? 'supera el límite de 10 MB'
                : 'formato no permitido (solo PDF, MD o TXT)'
            )
            .join(', ');
          toast.error(`"${file.name}": ${reason}`);
        });
      }

      if (acceptedFiles.length > 0) {
        setSelectedFiles((prev) => {
          const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
          const uniqueNew = acceptedFiles.filter(
            (f) => !existingNames.has(`${f.name}-${f.size}`)
          );
          return [...prev, ...uniqueNew];
        });
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled: uploadMutation.isPending,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    await uploadMutation.mutateAsync(selectedFiles);
    setSelectedFiles([]);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          } ${uploadMutation.isPending ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Suelta los archivos aquí para agregarlos...'
              : 'Arrastra y suelta documentos aquí, o haz clic para seleccionar'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Formatos soportados: <strong>.pdf</strong>, <strong>.md</strong>,{' '}
            <strong>.txt</strong> (Máximo 10 MB por archivo)
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Archivos listos para subir ({selectedFiles.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles([])}
                disabled={uploadMutation.isPending}
              >
                Limpiar lista
              </Button>
            </div>

            <ul className="divide-y rounded-md border">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ({formatBytes(file.size)})
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(index)}
                    disabled={uploadMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    Cargar e indexar ({selectedFiles.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}