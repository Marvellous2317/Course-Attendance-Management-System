import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { AppRouter } from './shared/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminProvider>
          <AppRouter />
        </AdminProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
