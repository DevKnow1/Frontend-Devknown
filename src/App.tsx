import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { AppRouter } from '@/routes/AppRouter';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;