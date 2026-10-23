import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import JobsList from '@/pages/JobsList';
import CreateJob from '@/pages/CreateJob';
import JobDetail from '@/pages/JobDetail';
import CandidateDetail from '@/pages/CandidateDetail';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<JobsList />} />
                      <Route path="/jobs/new" element={<CreateJob />} />
                      <Route path="/jobs/:id" element={<JobDetail />} />
                      <Route path="/jobs/:id/candidates/:candidateId" element={<CandidateDetail />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
