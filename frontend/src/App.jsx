import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Workspace Pages
import DashboardPage from './pages/DashboardPage';
import MyDatasetsPage from './pages/MyDatasetsPage';
import UploadPage from './pages/UploadPage';
import DatasetDetailsPage from './pages/DatasetDetailsPage';
import DatasetIntelligencePage from './pages/DatasetIntelligencePage';
import DataCleaningPage from './pages/DataCleaningPage';
import DataAnalysisPage from './pages/DataAnalysisPage';
import VisualizationStudioPage from './pages/VisualizationStudioPage';
import DiscoverInsightsPage from './pages/DiscoverInsightsPage';
import CompareDatasetsPage from './pages/CompareDatasetsPage';

// AI Tools Pages
import InsightAIPage from './pages/InsightAIPage';
import AIConversationsPage from './pages/AIConversationsPage';

// Reports & Account Pages
import ReportBuilderPage from './pages/ReportBuilderPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected SaaS Application Workspace */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Workspace Navigation */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/datasets" element={<MyDatasetsPage />} />
              <Route path="/datasets/upload" element={<UploadPage />} />
              <Route path="/datasets/intelligence" element={<DatasetIntelligencePage />} />
              <Route path="/datasets/:id/intelligence" element={<DatasetIntelligencePage />} />
              <Route path="/datasets/cleaning" element={<DataCleaningPage />} />
              <Route path="/datasets/:id/cleaning" element={<DataCleaningPage />} />
              <Route path="/datasets/:id" element={<DatasetDetailsPage />} />
              <Route path="/datasets/:id/analysis" element={<DataAnalysisPage />} />
              <Route path="/analysis" element={<DataAnalysisPage />} />
              <Route path="/visualizations" element={<VisualizationStudioPage />} />
              <Route path="/insights" element={<DiscoverInsightsPage />} />
              <Route path="/compare" element={<CompareDatasetsPage />} />

              {/* AI Tools */}
              <Route path="/ai-chat" element={<InsightAIPage />} />
              <Route path="/ai-conversations" element={<AIConversationsPage />} />

              {/* Reports */}
              <Route path="/reports/builder" element={<ReportBuilderPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              {/* Account Settings */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
