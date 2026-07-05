import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Network, Newspaper, FileText, BookOpen, Menu, X, Bot, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '首页', icon: Bot },
  { path: '/monitor', label: '实时监控', icon: Activity },
  { path: '/graph', label: '产业链图谱', icon: Network },
  { path: '/events', label: '事件流', icon: Newspaper },
  { path: '/reports', label: '研报中心', icon: FileText },
  { path: '/glossary', label: '术语库', icon: BookOpen },
];

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-3">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 px-3 py-3 text-[15px] rounded-lg transition-all duration-150',
              isActive
                ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))] font-semibold border-l-2 border-[hsl(var(--sidebar-primary))]'
                : 'text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-primary))] hover:bg-[hsl(var(--sidebar-accent))]',
            )}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* 桌面端侧边栏 — 深蓝黑 */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0"
        style={{ background: 'hsl(var(--sidebar-background))', borderRight: '1px solid hsl(var(--sidebar-border))' }}
      >
        {/* 品牌 Logo 区 */}
        <div
          className="relative overflow-hidden"
          style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_d1a8b2fc-9723-41c6-8d57-acbe31189854.jpg)` }}
          />
          <div className="relative flex items-center gap-3 px-4 py-5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ background: 'hsl(var(--sidebar-accent))', border: '1px solid hsl(var(--sidebar-primary) / 0.4)' }}
            >
              <Bot className="h-6 w-6" style={{ color: 'hsl(var(--sidebar-primary))' }} />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="text-[17px] font-bold truncate"
                style={{ color: 'hsl(var(--sidebar-primary))', fontFamily: "'Noto Serif SC', Georgia, serif" }}
              >
                RobotResearch
              </span>
              <span className="text-xs truncate" style={{ color: 'hsl(var(--sidebar-foreground) / 0.55)' }}>
                机器人产业链投研平台
              </span>
            </div>
          </div>
        </div>

        <NavContent />

        <div className="mt-auto px-4 py-4" style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--sidebar-foreground) / 0.4)' }}>
            数据仅供参考，不构成投资建议
          </p>
        </div>
      </aside>

      {/* 移动端头部 + Sheet */}
      <div className="flex flex-1 min-w-0 flex-col">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0" style={{ background: 'hsl(var(--sidebar-background))' }}>
              <div
                className="flex items-center gap-3 px-4 py-5"
                style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                  style={{ background: 'hsl(var(--sidebar-accent))' }}
                >
                  <Bot className="h-5 w-5" style={{ color: 'hsl(var(--sidebar-primary))' }} />
                </div>
                <span
                  className="text-base font-bold"
                  style={{ color: 'hsl(var(--sidebar-primary))', fontFamily: "'Noto Serif SC', Georgia, serif" }}
                >
                  RobotResearch
                </span>
              </div>
              <NavContent onItemClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 min-w-0">
            <Bot className="h-5 w-5 text-primary shrink-0" />
            <span
              className="text-base font-bold text-primary truncate"
              style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}
            >
              RobotResearch
            </span>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
