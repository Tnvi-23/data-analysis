import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from '../components/AppSidebar';
import AppHeader from '../components/AppHeader';
import FloatingChatbot from '../components/FloatingChatbot';
import './MainLayout.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Analytics Overview', subtitle: 'Real-time performance and dataset metrics' },
  '/datasets': { title: 'My Datasets', subtitle: 'Manage, profile, clean, and explore your imported files' },
  '/datasets/upload': { title: 'Upload Dataset', subtitle: 'Import CSV or Excel files or load 1-click sample datasets' },
  '/datasets/intelligence': { title: 'Dataset Intelligence & Profiling', subtitle: 'Quality scoring, completeness index, and actionable recommendations' },
  '/datasets/cleaning': { title: 'Data Cleaning Studio', subtitle: 'Interactive transformation, deduplication, imputation & filter engine' },
  '/analysis': { title: 'Statistical Analysis', subtitle: 'Descriptive summaries, distributions, IQR outlier detection & Pearson matrix' },
  '/visualizations': { title: 'Visualization Studio', subtitle: 'Interactive charts, custom axes, aggregations and high-res export' },
  '/insights': { title: 'Discover Insights', subtitle: 'Automated anomaly detection, correlation findings & Gemini AI insights' },
  '/compare': { title: 'Compare Datasets', subtitle: 'Side-by-side structural schema comparison, missingness & value variance' },
  '/ai-chat': { title: 'Insight AI Copilot', subtitle: 'Dataset-grounded conversational analytics powered by Google Gemini' },
  '/ai-conversations': { title: 'AI Conversation History', subtitle: 'Review, continue, or manage your historical analytical chats' },
  '/reports/builder': { title: 'Report Builder', subtitle: 'Compile custom analytical sections and generate publication-ready PDFs' },
  '/reports': { title: 'Report History', subtitle: 'Executive analytical summaries, stored PDFs and exports' },
  '/settings': { title: 'Account & Settings', subtitle: 'Manage your profile and platform configurations' }
};

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Match title by exact path or dynamic prefixes
  let pageInfo = PAGE_TITLES[location.pathname];
  if (!pageInfo) {
    if (location.pathname.includes('/intelligence')) {
      pageInfo = { title: 'Dataset Intelligence & Profiling', subtitle: 'Deep column profiling, quality scoring, and actionable data health recommendations' };
    } else if (location.pathname.includes('/cleaning')) {
      pageInfo = { title: 'Data Cleaning Studio', subtitle: 'Execute live transformations, missing value imputations, deduplication and filters' };
    } else if (location.pathname.includes('/analysis')) {
      pageInfo = { title: 'Statistical Analysis', subtitle: 'Descriptive distributions, variance, IQR anomalies, and correlations' };
    } else if (location.pathname.startsWith('/datasets/')) {
      pageInfo = { title: 'Dataset Inspector', subtitle: 'Inspect raw records, attribute distributions, and dataset metadata' };
    } else {
      pageInfo = { title: 'SmartData Insight', subtitle: 'AI-Powered Decision Intelligence Workspace' };
    }
  }

  // Hide floating chatbot on the dedicated /ai-chat page to avoid duplicate interface
  const isDedicatedAiChat = location.pathname === '/ai-chat';

  return (
    <div className="main-wrapper">
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="content-container">
        <AppHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Floating Insight AI Copilot (visible across all pages except full-page chat) */}
      {!isDedicatedAiChat && <FloatingChatbot />}
    </div>
  );
};

export default MainLayout;
