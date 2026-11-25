import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  LogOut,
  MessageSquare,
  MessageSquarePlus,
  Trash2,
} from 'lucide-react';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useConversationsQuery,
  useDeleteConversationMutation,
} from '../hooks/useChat';

interface ConversationSidebarProps {
  activeConversationId?: number;
  onNewChat: () => void;
}

export function ConversationSidebar({
  activeConversationId,
  onNewChat,
}: ConversationSidebarProps) {
  const navigate = useNavigate();
  const { user, clearSession } = useAuthStore();
  const { data: conversations, isLoading } = useConversationsQuery();
  const deleteMutation = useDeleteConversationMutation();

  const handleDelete = async (
    e: React.MouseEvent,
    conversationId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteMutation.mutateAsync(conversationId);
    if (activeConversationId === conversationId) {
      navigate('/chat');
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/20">
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between px-1">
          <span className="text-base font-bold tracking-tight">DevKnow</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
            RAG Tutor
          </span>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Nueva consulta
        </Button>
      </div>

      <Separator />

      <div className="px-3 pt-3 pb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mis conversaciones
        </span>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-full rounded-md" />
            ))
          ) : !conversations || conversations.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Aún no tienes conversaciones guardadas.
            </p>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`group flex items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                    isActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {conv.title || `Conversación #${conv.id}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deleteMutation.isPending}
                    title="Eliminar conversación"
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-2 p-3">
        {user?.role === 'ADMIN' && (
          <Link to="/admin/documents" className="block">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
            >
              <FolderKanban className="h-3.5 w-3.5" />
              Gestionar documentos
            </Button>
          </Link>
        )}

        <div className="flex items-center justify-between rounded-md border bg-background px-2.5 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{user?.fullName}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user?.role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}