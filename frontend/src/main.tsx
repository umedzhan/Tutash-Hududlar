import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// Eslatma: StrictMode ataylab qo'llanilmagan — u effektlarni dev rejimida
// ikki marta ishga tushiradi, bu esa leaflet-draw kabi DOM bilan bevosita
// ishlaydigan imperativ kutubxonalarning ichki holatini (masalan, poligon
// chizishda necha nuqta bosilganini) buzib qo'yadi.
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
);
