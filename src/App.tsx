import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import Proposals from './pages/Proposals';
import Invoices from './pages/Invoices';
import Jobs from './pages/Jobs';
import Labor from './pages/Labor';
import Items from './pages/Items';
import Customers from './pages/Customers';
import Map from './pages/Map';
import Calendar from './pages/Calendar';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import QuoteDetail from './pages/QuoteDetail';
import NewQuote from './pages/NewQuote';
import QuoteApproval from './pages/QuoteApproval';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        navigate('/login', { replace: true });
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 w-full lg:pl-64">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4">
          <div className="container mx-auto max-w-full lg:max-w-7xl px-0 sm:px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/quotes" element={<Quotes />} />
                      <Route path="/proposals" element={<Proposals />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/jobs" element={<Jobs />} />
                      <Route path="/labor" element={<Labor />} />
                      <Route path="/items" element={<Items />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/map" element={<Map />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/quotes/:id" element={<QuoteDetail />} />
                      <Route path="/quotes/new" element={<NewQuote />} />
                      <Route path="/quotes/:id/approve" element={<QuoteApproval />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;