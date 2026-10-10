import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import ManageIssues from './pages/ManageIssues';
import IssueDetails from './pages/IssueDetails';
import Categories from './pages/Categories';

function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues"
            element={
              <ProtectedRoute>
                <AppLayout><ManageIssues /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/new"
            element={
              <ProtectedRoute>
                <AppLayout><ReportIssue /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute>
                <AppLayout><IssueDetails /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AppLayout><Categories /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
