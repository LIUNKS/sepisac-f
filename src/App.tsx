import { AppProvider } from '@/app/providers/AppProvider';
import { AppRoutes } from '@/routes';

export function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;