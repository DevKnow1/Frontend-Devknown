import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ApiError, DocumentItem } from '@/types/api';
import { useUpdateDocumentMutation } from '../hooks/useDocumentsAdmin';

const editMetadataSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre del documento es obligatorio')
    .max(255, 'El nombre no puede superar los 255 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede superar los 1000 caracteres')
    .optional(),
});

type EditMetadataFormValues = z.infer<typeof editMetadataSchema>;

interface EditDocumentModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export function EditDocumentModal({ document, onClose }: EditDocumentModalProps) {
  const updateMutation = useUpdateDocumentMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditMetadataFormValues>({
    resolver: zodResolver(editMetadataSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (document) {
      reset({
        name: document.name,
        description: document.description ?? '',
      });
    }
  }, [document, reset]);

  const onSubmit = async (values: EditMetadataFormValues) => {
    if (!document) return;

    try {
      await updateMutation.mutateAsync({
        id: document.id,
        payload: {
          name: values.name,
          description: values.description?.trim() || '',
        },
      });
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          if (field === 'name' || field === 'description') {
            setError(field, { type: 'server', message });
          }
        });
      }
    }
  };

  return (
    <Dialog open={Boolean(document)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar metadatos del documento</DialogTitle>
          <DialogDescription>
            Actualiza el nombre visible y la descripción informativa sin alterar los
            fragmentos indexados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Nombre del documento</Label>
            <Input
              id="doc-name"
              placeholder="Ej. Guía de arquitectura Spring Boot.pdf"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-description">Descripción (opcional)</Label>
            <Textarea
              id="doc-description"
              rows={4}
              placeholder="Resumen del contenido técnico, versión o alcance del documento..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}