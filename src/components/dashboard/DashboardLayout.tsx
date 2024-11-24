import { ReactNode } from 'react';
import NetworkStatus from './NetworkStatus';
import ActivityFeed from './ActivityFeed';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        {/* Main Content */}
        <div className="main-content">
          {children}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Network Status */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Network Status
            </h3>
            <NetworkStatus />
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4 dark:text-white">
              Recent Activity
            </h3>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}