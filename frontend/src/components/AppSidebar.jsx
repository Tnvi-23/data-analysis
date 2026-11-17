import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  UploadCloud,
  Cpu,
  Sliders,
  BarChart3,
  PieChart,
  Lightbulb,
  SplitSquareVertical,
  Bot,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const AppSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
        { label: 'My Datasets', to: '/datasets', icon: Database },
        { label: 'Upload Dataset', to: '/datasets/upload', icon: UploadCloud },
        { label: 'Dataset Intelligence', to: '/datasets/intelligence', icon: Cpu },
        { label: 'Data Cleaning', to: '/datasets/cleaning', icon: Sliders },
        { label: 'Statistical Analysis', to: '/analysis', icon: BarChart3 },
        { label: 'Visualization Studio', to: '/visualizations', icon: PieChart },
        { label: 'Discover Insights', to: '/insights', icon: Lightbulb },
        { label: 'Compare Datasets', to: '/compare', icon: SplitSquareVertical }
      ]
    },
    {
      title: 'AI TOOLS',
      items: [
        { label: 'Insight AI', to: '/ai-chat', icon: Bot, isAccent: true },
        { label: 'AI Conversations', to: '/ai-conversations', icon: MessageSquare }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { label: 'Report Builder', to: '/reports/builder', icon: FileSpreadsheet },
        { label: 'Report History', to: '/reports', icon: FileText }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Profile & Settings', to: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 40,
            backdropFilter: 'blur(3px)'
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-main)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          borderRight: '1px solid var(--color-border)',
          transition: 'transform 0.25s ease',
          transform: isOpen ? 'translateX(0)' : undefined
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <img src="/logo.svg" alt="SmartData Insight" style={{ width: '34px', height: '34px' }} />
          <div>
            <h1
              style={{
                fontSize: '1.0625rem',
                color: 'var(--color-text-main)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}
            >
              SmartData Insight
            </h1>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600
              }}
            >
              Analytics Platform
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            padding: '1.25rem 0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto'
          }}
        >
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0 0.75rem 0.35rem'
                }}
              >
                {sec.title}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive
                        ? 'var(--color-text-main)'
                        : 'var(--color-text-secondary)',
                      backgroundColor: isActive
                        ? 'var(--color-surface)'
                        : 'transparent',
                      borderLeft: isActive
                        ? '3px solid var(--color-primary)'
                        : '3px solid transparent',
                      transition: 'all 0.15s ease'
                    })}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: item.isAccent ? 'var(--color-primary)' : 'var(--color-secondary)',
                        flexShrink: 0
                      }}
                    />
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                    {item.isAccent && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          backgroundColor: 'rgba(182, 255, 74, 0.15)',
                          color: 'var(--color-primary)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        AI
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Sign Out */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '0.75rem'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                flexShrink: 0
              }}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-text-main)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {user?.name || 'User'}
              </p>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {user?.email || 'Logged in'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--color-error)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid rgba(230, 108, 108, 0.2)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
