import { BrowserRouter } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { AppRouter } from './shared/router';

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppRouter />
      </AdminProvider>
    </BrowserRouter>
  );
}
