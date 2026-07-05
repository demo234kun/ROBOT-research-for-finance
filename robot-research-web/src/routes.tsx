import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import GraphPage from './pages/GraphPage';
import EventsPage from './pages/EventsPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import GlossaryPage from './pages/GlossaryPage';
import MonitorPage from './pages/MonitorPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: '首页', path: '/', element: <HomePage />, public: true },
  { name: '实时监控', path: '/monitor', element: <MonitorPage />, public: true },
  { name: '产业链图谱', path: '/graph', element: <GraphPage />, public: true },
  { name: '事件流', path: '/events', element: <EventsPage />, public: true },
  { name: '研报中心', path: '/reports', element: <ReportsPage />, public: true },
  { name: '研报详情', path: '/reports/:id', element: <ReportDetailPage />, public: true },
  { name: '术语库', path: '/glossary', element: <GlossaryPage />, public: true },
];
