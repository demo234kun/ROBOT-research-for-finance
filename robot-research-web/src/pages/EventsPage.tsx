import { useState, useEffect, useCallback } from 'react';
import { Search, X, RefreshCw, ExternalLink, Clock, Newspaper, LayoutGrid, Sparkles, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { fetchEvents, triggerFetchEvents, analyzeEvent } from '@/lib/api';
import type { Event, Platform, EventAnalysis } from '@/types/types';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

const PAGE_SIZE = 15;

const quickFilters = ['人形机器人', '减速器', '伺服', '特斯拉', 'Optimus', '优必选', '宇树'];

// 平台配置
const PLATFORMS: { key: Platform | 'all'; label: string; color: string; dot: string }[] = [
  { key: 'all',          label: '全部',      color: 'bg-secondary text-secondary-foreground border-border',    dot: 'bg-muted-foreground' },
  { key: 'cls',          label: '财联社',     color: 'bg-red-50 text-red-700 border-red-200',                  dot: 'bg-red-500' },
  { key: 'eastmoney',    label: '东方财富',   color: 'bg-orange-50 text-orange-700 border-orange-200',         dot: 'bg-orange-500' },
  { key: 'ths',          label: '同花顺',     color: 'bg-blue-50 text-blue-700 border-blue-200',               dot: 'bg-blue-500' },
  { key: 'wallstreetcn', label: '华尔街见闻', color: 'bg-purple-50 text-purple-700 border-purple-200',         dot: 'bg-purple-500' },
  { key: 'jin10',        label: '金十数据',   color: 'bg-amber-50 text-amber-700 border-amber-200',            dot: 'bg-amber-500' },
  { key: 'xueqiu',       label: '雪球',       color: 'bg-emerald-50 text-emerald-700 border-emerald-200',      dot: 'bg-emerald-500' },
];

const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map(p => [p.key, p]));

function PlatformTag({ platform }: { platform: string }) {
  const cfg = PLATFORM_MAP[platform] || PLATFORMS[0];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// 性质标签配置
const SENTIMENT_CONFIG = {
  positive: { label: '利好', icon: TrendingUp, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  negative: { label: '利空', icon: TrendingDown, className: 'bg-red-50 text-red-700 border-red-200' },
  neutral:  { label: '中性', icon: Minus,       className: 'bg-slate-50 text-slate-600 border-slate-200' },
};

// AI 分析面板
function AnalysisPanel({
  eventId,
  title,
  analysis,
  onAnalyzed,
}: {
  eventId: string;
  title: string;
  analysis?: EventAnalysis | null;
  onAnalyzed: (id: string, result: EventAnalysis) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await analyzeEvent(eventId, title);
      // 分析结果会由 Realtime 推送更新
    } catch {
      toast.error('AI 分析失败，请重试');
      setLoading(false);
    }
  };

  // 当 analysis 外部更新后解除 loading 状态
  useEffect(() => {
    if (analysis) setLoading(false);
  }, [analysis]);

  if (loading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 min-w-[96px] py-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
        <span className="text-[10px] text-muted-foreground">分析中...</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <button
        type="button"
        onClick={handleAnalyze}
        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-dashed border-primary/30 text-primary/60
          hover:border-primary hover:text-primary hover:bg-primary/5 transition-all shrink-0 self-start mt-0.5"
      >
        <Sparkles className="h-3 w-3" />
        AI 分析
      </button>
    );
  }

  const sentCfg = SENTIMENT_CONFIG[analysis.sentiment] || SENTIMENT_CONFIG.neutral;
  const SentIcon = sentCfg.icon;

  return (
    <div className="flex flex-col gap-1.5 min-w-0 shrink-0 md:w-52 w-full" onClick={(e) => e.preventDefault()}>
      {/* 性质 */}
      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border font-semibold self-start ${sentCfg.className}`}>
        <SentIcon className="h-3 w-3" />
        {sentCfg.label}
      </span>

      {/* 因素 */}
      {analysis.factors.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">因素</span>
          <div className="flex flex-wrap gap-1">
            {analysis.factors.map((f, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 leading-tight">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 结果 */}
      {analysis.outcomes.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">结果</span>
          <div className="flex flex-wrap gap-1">
            {analysis.outcomes.map((o, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 leading-tight">
                {o}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [activePlatform, setActivePlatform] = useState<Platform | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [lastStats, setLastStats] = useState<Record<string, number> | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEvents({ page, pageSize: PAGE_SIZE, keyword, platform: activePlatform });
      setEvents(res.data);
      setTotal(res.total);
    } catch {
      toast.error('加载事件失败');
    } finally {
      setLoading(false);
    }
  }, [page, keyword, activePlatform]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Realtime 订阅：监听 events 表的 analysis 字段更新
  useEffect(() => {
    const channel = supabase
      .channel('events-analysis')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events' },
        (payload) => {
          const updated = payload.new as Event;
          if (!updated?.id || !updated?.analysis) return;
          setEvents((prev) =>
            prev.map((e) => e.id === updated.id ? { ...e, analysis: updated.analysis } : e)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 分析完成回调（手动触发时使用）
  const handleAnalyzed = (id: string, result: EventAnalysis) => {
    setEvents((prev) => prev.map((e) => e.id === id ? { ...e, analysis: result } : e));
  };

  const handleFetch = async () => {
    setFetching(true);
    try {
      const res = await triggerFetchEvents();
      if (res.platform_stats) setLastStats(res.platform_stats);
      toast.success(res.message || '抓取完成，AI 分析将在后台自动进行');
      setPage(1);
      loadEvents();
    } catch {
      toast.error('抓取失败，请稍后重试');
    } finally {
      setFetching(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const grouped = events.reduce<Record<string, Event[]>>((acc, e) => {
    const day = format(new Date(e.published_at), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* 头部 */}
      <div className="flex items-start justify-between mb-5 gap-3">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            事件流
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            聚合财联社、东方财富、同花顺、华尔街见闻、金十五大平台机器人资讯 · AI实时分析因素/结果/利好利空
          </p>
          {lastStats && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(lastStats).map(([k, v]) => {
                const cfg = PLATFORM_MAP[k];
                if (!cfg || !v) return null;
                return (
                  <span key={k} className={`text-[10px] px-2 py-0.5 rounded-full border ${cfg.color}`}>
                    {cfg.label} +{v}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFetch}
          disabled={fetching}
          className="text-xs h-8 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${fetching ? 'animate-spin' : ''}`} />
          {fetching ? '抓取中...' : '立即抓取'}
        </Button>
      </div>

      {/* 平台筛选 */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => { setActivePlatform(p.key); setPage(1); }}
            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition-all font-medium
              ${activePlatform === p.key
                ? `${p.color} shadow-sm`
                : 'bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
            {p.label}
          </button>
        ))}
      </div>

      {/* 搜索 */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="输入关键词筛选事件..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            className="pl-8 pr-8 h-8 text-xs bg-muted border-border"
          />
          {keyword && (
            <button type="button" onClick={() => { setKeyword(''); setPage(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* 快捷筛选 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {quickFilters.map((f) => (
          <Badge
            key={f}
            variant={keyword === f ? 'default' : 'outline'}
            className="cursor-pointer text-[10px] h-6"
            onClick={() => { setKeyword(keyword === f ? '' : f); setPage(1); }}
          >
            {f}
          </Badge>
        ))}
      </div>

      {/* 事件列表 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`skel-${i}`} className="h-20 w-full bg-muted" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="terminal-card p-8 text-center">
          <Newspaper className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无相关事件</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {keyword ? '尝试更换关键词或清空筛选' : '点击「立即抓取」获取最新事件'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([day, dayEvents]) => (
            <div key={day}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-accent font-semibold font-mono">{day}</span>
                <span className="text-[10px] text-muted-foreground">({dayEvents.length} 条)</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="relative pl-4 border-l border-border/50">
                {dayEvents.map((event) => (
                  <div key={event.id} className="relative pb-2.5 last:pb-0">
                    <div className="absolute -left-[18px] top-2 h-2 w-2 rounded-full bg-primary/50 border border-primary/80" />
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terminal-card p-3 block group hover:border-primary/30 transition-all duration-150"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-3">
                        {/* 左侧：标题 + 元信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {format(new Date(event.published_at), 'HH:mm')}
                                </span>
                                <PlatformTag platform={event.platform} />
                                <span className="text-[10px] text-muted-foreground">{event.source}</span>
                              </div>
                            </div>
                            <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-0.5 md:hidden" />
                          </div>
                        </div>

                        {/* 右侧：AI 分析面板 */}
                        <div className="md:border-l md:border-border/40 md:pl-3 shrink-0">
                          <AnalysisPanel
                            eventId={event.id}
                            title={event.title}
                            analysis={event.analysis}
                            onAnalyzed={handleAnalyzed}
                          />
                        </div>

                        <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary shrink-0 mt-0.5 hidden md:block" />
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-muted-foreground">共 {total} 条</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)} className="text-xs h-7">上一页</Button>
                <span className="text-xs text-muted-foreground font-mono">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)} className="text-xs h-7">下一页</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
