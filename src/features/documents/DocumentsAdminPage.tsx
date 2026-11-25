import { Link } from 'react-router-dom';
import { MessageSquareCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DocumentsTable } from './components/DocumentsTable';
import { DocumentStatsCards } from './components/DocumentStatsCards';
import { DocumentUploadDropzone } from './components/DocumentUploadDropzone';

export function DocumentsAdminPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Base de Conocimiento — DevKnow
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra la documentación técnica disponible para el tutor inteligente.
          </p>
        </div>

        <Link to="/chat">
          <Button variant="outline" className="gap-2">
            <MessageSquareCode className="h-4 w-4" />
            Ir al Tutor Inteligente
          </Button>
        </Link>
      </header>

      {/* Tarjetas de estadísticas en tiempo real */}
      <DocumentStatsCards />

      {/* Zona de carga Drag & Drop */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold">Cargar nueva documentación</h2>
        <DocumentUploadDropzone />
      </section>

      <Separator />

      {/* Listado administrativo con polling y acciones CRUD */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Documentos registrados</h2>
        <DocumentsTable />
      </section>
    </div>
  );
}