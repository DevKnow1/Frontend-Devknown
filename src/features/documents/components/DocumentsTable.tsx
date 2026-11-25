import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileUp,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DocumentItem, DocumentStatus } from '@/types/api';
import {
  useDeleteDocumentMutation,
  useDocumentsListQuery,
  useOpenDocumentFile,
  useReprocessDocumentMutation,
} from '../hooks/useDocumentsAdmin';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { EditDocumentModal } from './EditDocumentModal';
import { ReplaceDocumentModal } from './ReplaceDocumentModal';

type StatusFilter = DocumentStatus | 'ALL';

export function DocumentsTable() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Modales
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [replacingDoc, setReplacingDoc] = useState<DocumentItem | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);

  // Debounce de 400ms para no saturar GET /api/documents al escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useDocumentsListQuery({
    q: debouncedQuery || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    size: pageSize,
  });

  const reprocessMutation = useReprocessDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();
  const openFileMutation = useOpenDocumentFile();

  const documents = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    await deleteMutation.mutateAsync(deletingDoc.id);
    setDeletingDoc(null);
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          {isFetching && !isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Sincronizando estados...
            </span>
          )}

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (value) {
                setStatusFilter(value as StatusFilter);
                setPage(0);
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los estados</SelectItem>
              <SelectItem value="AVAILABLE">Disponibles</SelectItem>
              <SelectItem value="PROCESSING">Procesando</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="ERROR">Con error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de documentos */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[32%]">Documento</TableHead>
              <TableHead className="w-[26%]">Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-32" />
                  </TableCell>
                </TableRow>
              ))
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-28 text-center text-sm text-muted-foreground"
                >
                  No se encontraron documentos con los filtros actuales.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[280px]" title={doc.name}>
                        {doc.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID #{doc.id}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p
                      className="line-clamp-2 max-w-[260px] text-xs text-muted-foreground"
                      title={doc.description ?? ''}
                    >
                      {doc.description || 'Sin descripción'}
                    </p>
                  </TableCell>

                  <TableCell>
                    <DocumentStatusBadge
                      status={doc.status}
                      errorMessage={doc.errorMessage}
                    />
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(doc.updatedAt ?? doc.createdAt).toLocaleString(
                      'es-PE',
                      {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-1">
                      {/* Reprocesar (solo si está en ERROR - HU-21) */}
                      {doc.status === 'ERROR' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700"
                          title="Reintentar procesamiento"
                          disabled={reprocessMutation.isPending}
                          onClick={() => reprocessMutation.mutate(doc.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Ver / Descargar archivo original */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Abrir archivo original"
                        disabled={openFileMutation.isPending}
                        onClick={() =>
                          openFileMutation.mutate({ id: doc.id, name: doc.name })
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      {/* Editar metadatos (HU-27) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar metadatos"
                        onClick={() => setEditingDoc(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Reemplazar archivo y reindexar (HU-28, HU-29) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Reemplazar archivo"
                        disabled={doc.status === 'PROCESSING'}
                        onClick={() => setReplacingDoc(doc)}
                      >
                        <FileUp className="h-4 w-4" />
                      </Button>

                      {/* Eliminar documento y vectores (HU-30) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Eliminar documento"
                        onClick={() => setDeletingDoc(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Mostrando {documents.length} de {totalElements} documentos
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span>
            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= totalPages || isLoading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Modal Edición de Metadatos */}
      <EditDocumentModal
        document={editingDoc}
        onClose={() => setEditingDoc(null)}
      />

      {/* Modal Reemplazo de Archivo */}
      <ReplaceDocumentModal
        document={replacingDoc}
        onClose={() => setReplacingDoc(null)}
      />

      {/* Modal Confirmación de Eliminación */}
      <Dialog
        open={Boolean(deletingDoc)}
        onOpenChange={(open) => !open && setDeletingDoc(null)}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Eliminar documento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar <strong>{deletingDoc?.name}</strong>? Se
              borrará el archivo, sus fragmentos y los embeddings asociados de
              pgvector. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingDoc(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar definitivamente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}