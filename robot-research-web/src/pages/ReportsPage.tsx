import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Building2, Calendar, FlaskConical,
  BookOpen, ExternalLink, Users, Quote, TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reports, getAllTags, getReportsByCategory } from '@/data/reports';
import type { Report, ReportCategory } from '@/data/reports';
import { cn } from '@/lib/utils';

/* ─── Tab 配置 ─────────────────────────── */
const TABS: { key: ReportCategory; label: string; icon: typeof FileText; desc: string }[] = [
  {
    key: 'report',
    label: '研报解读',
    icon: TrendingUp,
    desc: '机构深度研报重制 · 带术语注释、图表与时间线的交互式阅读体验',
  },
  {
    key: 'research',
    label: '科研论文',
    icon: FlaskConical,
    desc: '顶会/期刊精选 · arXiv 实时跟踪机器人前沿学术进展',
  },
];

/* ─── 研报卡片 ──────────────────────────── */
function ReportCard({ report }: { report: Report }) {
  return (
    <div className="terminal-card p-5 flex flex-col gap-3 transition-all duration-200 hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground leading-snug text-balance flex-1 min-w-0">
          {report.title}
        </h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{report.intro}</p>

      <div className="flex flex-wrap gap-1.5">
        {report.tags.map((t) => (
          <Badge key={t} variant="outline" className="text-xs h-5 border-primary/25 text-primary/80">
            {t}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
          <span className="flex items-center gap-1 shrink-0">
            <Building2 className="h-3.5 w-3.5" />
            {report.institution}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            {report.date}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {report.reportUrl && (
            <a
              href={report.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              原文
            </a>
          )}
          <Link
            to={`/reports/${report.id}`}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            解读
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── 科研论文卡片 ─────────────────────── */
function ResearchCard({ report }: { report: Report }) {
  return (
    <div className="terminal-card p-5 flex flex-col gap-3">
      {/* 期刊/会议标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        {report.venue && (
          <span
            className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
            style={{
              color: 'hsl(var(--primary))',
              background: 'hsl(var(--primary)/0.08)',
              borderColor: 'hsl(var(--primary)/0.25)',
            }}
          >
            {report.venue}
          </span>
        )}
        {report.citationCount !== undefined && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Quote className="h-3 w-3" />
            引用 {report.citationCount}
          </span>
        )}
      </div>

      {/* 标题 */}
      <h3 className="text-base font-bold text-foreground leading-snug text-balance">{report.title}</h3>

      {/* 摘要 */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{report.intro}</p>

      {/* 作者 */}
      {report.authors && report.authors.length > 0 && (
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{report.authors.slice(0, 4).join(', ')}{report.authors.length > 4 ? ' 等' : ''}</span>
        </div>
      )}

      {/* 标签行 */}
      <div className="flex flex-wrap gap-1.5">
        {report.tags.map((t) => (
          <Badge key={t} variant="outline" className="text-xs h-5 border-primary/25 text-primary/80">
            {t}
          </Badge>
        ))}
      </div>

      {/* 底部操作 */}
      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          {report.institution}
          <span className="mx-1 text-border">·</span>
          <Calendar className="h-3.5 w-3.5" />
          {report.date}
        </div>
        <div className="flex items-center gap-2">
          {report.paperUrl && (
            <a
              href={report.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              原文
            </a>
          )}
          <Link
            to={`/reports/${report.id}`}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            <BookOpen className="h-3.5 w-3.5" />
            解读
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── 主页面 ───────────────────────────── */
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportCategory>('report');
  const [tag, setTag] = useState('all');

  const currentReports = useMemo(() => getReportsByCategory(activeTab), [activeTab]);
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const r of currentReports) r.tags.forEach((t) => set.add(t));
    return Array.from(set);
  }, [currentReports]);

  const filtered = useMemo(() => {
    if (tag === 'all') return currentReports;
    return currentReports.filter((r) => r.tags.includes(tag));
  }, [currentReports, tag]);

  const activeTabInfo = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="section-eyebrow mb-2">Research Hub</div>
        <h1
          className="text-2xl md:text-3xl font-bold text-foreground"
          style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}
        >
          研报中心
        </h1>
      </div>

      {/* Tab 切换 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setTag('all'); }}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200',
                isActive
                  ? 'border-primary/50 bg-card shadow-md'
                  : 'border-border bg-card/60 hover:border-primary/30 hover:bg-card',
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <tab.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className={cn('text-sm font-bold mb-0.5', isActive ? 'text-primary' : 'text-foreground')}>
                  {tab.label}
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed hidden md:block">{tab.desc}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {getReportsByCategory(tab.key).length} 篇
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="w-[140px] h-9 text-sm bg-muted border-border">
            <SelectValue placeholder="标签筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部标签</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">
          {activeTabInfo.label} · 共 <span className="font-semibold text-foreground">{filtered.length}</span> 篇
        </span>
      </div>

      {/* 内容列表 */}
      {filtered.length === 0 ? (
        <div className="terminal-card p-10 text-center">
          <FileText className="h-9 w-9 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无相关内容</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((report) =>
            report.category === 'research'
              ? <ResearchCard key={report.id} report={report} />
              : <ReportCard key={report.id} report={report} />,
          )}
        </div>
      )}
    </div>
  );
}
