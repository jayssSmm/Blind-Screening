import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Internships from '@/pages/Internships';
import JobDetail from '@/pages/JobDetail';
import Apply from '@/pages/Apply';
import Applications from '@/pages/Applications';
import ApplicationDetail from '@/pages/ApplicationDetail';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Internships />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/jobs/:id/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
                    <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
                    <Route path="/applications/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
