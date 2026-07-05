// 实时监控页面：每日热点 + 产业链监控 + 当日建议
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RefreshCw, TrendingUp, TrendingDown, Minus,
  Flame, BarChart2, Lightbulb, ChevronDown, ChevronUp,
  ExternalLink, AlertTriangle, ArrowUpRight, ArrowDownRight,
  ChevronRight, BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  calcSKDJ, detectLiangSignals, detectSKDJSignal,
  SIGNAL_CONFIG, type CandleBar, type SKDJSignal, type LiangSignal,
} from '@/lib/stockIndicators';
import StockDetailPanel from '@/components/stock/StockDetailPanel';
import type { Stock } from '@/data/industryChain';
import { flattenNodes, industryChain } from '@/data/industryChain';

// ─── 产业链全量Stock查找表（按名称/代码） ─────────────────
const ALL_STOCKS: Stock[] = flattenNodes(industryChain).flatMap(n => n.stocks ?? []);
function findStockByName(name: string): Stock | undefined {
  return ALL_STOCKS.find(s => s.name === name || name.includes(s.name) || s.name.includes(name));
}
function findStockByCode(code: string): Stock | undefined {
  return ALL_STOCKS.find(s => s.code === code);
}
const MONITOR_STOCKS: { name: string; code: string; sector: string }[] = [
  { name: '绿的谐波', code: '688017.SH', sector: '减速器' },
  { name: '双环传动', code: '002472.SZ', sector: '减速器' },
  { name: '汇川技术', code: '300124.SZ', sector: '伺服' },
  { name: '鸣志电器', code: '603728.SH', sector: '伺服' },
  { name: '三花智控', code: '002050.SZ', sector: '执行器' },
  { name: '拓普集团', code: '601689.SH', sector: '执行器' },
  { name: '金力永磁', code: '300748.SZ', sector: '磁材' },
  { name: '埃斯顿',   code: '002747.SZ', sector: '本体' },
  { name: '中科三环', code: '000970.SZ', sector: '磁材' },
  { name: '禾川科技', code: '688320.SH', sector: '控制器' },
];

// ─── 类型定义 ────────────────────────────────────────────
interface HotspotItem {
  id: string;
  title: string;
  published_at: string;
  platform: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  reason: string;
  affected_sectors: string[];
  related_stocks: string[];
  impact_desc: string;
}

interface DailySuggestion {
  overall: 'positive' | 'negative' | 'neutral';
  summary: string;
  buy_suggestion: string;
  sell_warning: string;
  key_stocks: string[];
  strategy: string;
}

interface StockSignal {
  name: string;
  code: string;
  sector: string;
  lastClose: number;
  changeRate: number;
  skdjK: number;
  skdjD: number;
  skdjSignal: SKDJSignal;
  liangSignals: LiangSignal[];
  allRed: boolean;  // 四量齐红
}

// ─── 颜色常量 ──────────────────────────────────────────
const RISE = '#ef4444';
const FALL = '#22d3ee';

// ─── 工具函数 ──────────────────────────────────────────
function fmt(v: number, d = 2) {
  if (v == null || isNaN(v)) return '--';
  return v.toFixed(d);
}
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}

// ─── 情绪标签 ─────────────────────────────────────────
function SentimentBadge({ s }: { s: 'positive' | 'negative' | 'neutral' }) {
  if (s === 'positive') return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-bold"
      style={{ background: 'rgba(239,68,68,0.15)', color: RISE, border: '1px solid rgba(239,68,68,0.3)' }}>
      <TrendingUp className="h-2.5 w-2.5" />利好
    </span>
  );
  if (s === 'negative') return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-bold"
      style={{ background: 'rgba(34,211,238,0.12)', color: FALL, border: '1px solid rgba(34,211,238,0.3)' }}>
      <TrendingDown className="h-2.5 w-2.5" />利空
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.2)' }}>
      <Minus className="h-2.5 w-2.5" />中性
    </span>
  );
}

// ─── 可点击股票标签（从产业链查找Stock） ─────────────────
function StockTag({
  name, onSelect, sentiment,
}: {
  name: string;
  onSelect: (stock: Stock) => void;
  sentiment?: 'positive' | 'negative' | 'neutral';
}) {
  const stock = findStockByName(name);
  const color = sentiment === 'positive' ? RISE : sentiment === 'negative' ? FALL : '#facc15';
  return stock ? (
    <button
      onClick={() => onSelect(stock)}
      className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
      style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
      title={`点击查看 ${name} 详情`}
    >
      {name}
      <BarChart className="h-2 w-2 opacity-70" />
    </button>
  ) : (
    <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/15 text-white/40">{name}</span>
  );
}

// ─── 每日热点卡片 ─────────────────────────────────────
function HotspotCard({ item, onSelectStock }: { item: HotspotItem; onSelectStock: (s: Stock) => void }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/3 p-3 space-y-2 hover:bg-white/5 transition-colors">
      <div className="flex items-start gap-2">
        <SentimentBadge s={item.sentiment} />
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-[12px] text-white/85 leading-snug hover:text-white line-clamp-2 min-w-0">
          {item.title}
        </a>
        <ExternalLink className="h-3 w-3 text-white/30 shrink-0 mt-0.5" />
      </div>

      {item.reason && (
        <div className="text-[10px] text-white/50">
          <span className="text-white/30">原因：</span>{item.reason}
        </div>
      )}
      {item.impact_desc && (
        <div className="text-[10px]" style={{ color: item.sentiment === 'positive' ? RISE : item.sentiment === 'negative' ? FALL : '#94a3b8' }}>
          {item.impact_desc}
        </div>
      )}

      <div className="flex flex-wrap gap-1 items-center">
        {item.affected_sectors.map(s => (
          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/15 text-white/40">{s}</span>
        ))}
        {item.related_stocks.map(name => (
          <StockTag key={name} name={name} onSelect={onSelectStock} sentiment={item.sentiment} />
        ))}
      </div>

      <div className="text-[9px] text-white/25">{relativeTime(item.published_at)} · {item.platform}</div>
    </div>
  );
}

// ─── 四量小格 ─────────────────────────────────────────
function LiangDot({ sig }: { sig: LiangSignal }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={cn(
        'w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold relative',
        sig.current === 1 ? 'text-white' : 'text-white/60'
      )} style={{ background: sig.current === 1 ? RISE : FALL, opacity: sig.current === 1 ? 1 : 0.6 }}>
        {sig.name[0]}
        {sig.changed && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 border border-[#0f1117]" />
        )}
      </div>
      <span className="text-[7px] text-white/30">{sig.name}</span>
    </div>
  );
}

// ─── 产业链股票信号行（可点击展开详情） ─────────────────
function StockSignalRow({
  s, isAlert, isSelected, onSelect,
}: {
  s: StockSignal; isAlert: boolean; isSelected: boolean;
  onSelect: (stock: Stock | null) => void;
}) {
  const sigCfg = SIGNAL_CONFIG[s.skdjSignal];
  const hasChangedLiang = s.liangSignals.some(l => l.changed);
  const stock = findStockByCode(s.code);

  const handleClick = () => {
    if (!stock) return;
    onSelect(isSelected ? null : stock);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!stock}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left',
        isSelected
          ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/30'
          : isAlert
          ? 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10'
          : 'border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15',
        stock && 'cursor-pointer'
      )}
    >
      {/* 股票名 + 板块 */}
      <div className="w-16 shrink-0">
        <div className={cn(
          'text-[11px] font-medium truncate flex items-center gap-0.5',
          isSelected ? 'text-primary' : 'text-white/85'
        )}>
          {s.name}
          {stock && <ChevronRight className={cn('h-2.5 w-2.5 transition-transform', isSelected && 'rotate-90')} />}
        </div>
        <div className="text-[9px] text-white/35">{s.sector}</div>
      </div>

      {/* 最新价 + 涨跌 */}
      <div className="w-14 shrink-0 text-right">
        <div className="text-[11px] tabular-nums font-medium" style={{ color: s.changeRate >= 0 ? RISE : FALL }}>
          {fmt(s.lastClose)}
        </div>
        <div className="text-[9px] tabular-nums" style={{ color: s.changeRate >= 0 ? RISE : FALL }}>
          {s.changeRate >= 0 ? <ArrowUpRight className="inline h-2.5 w-2.5" /> : <ArrowDownRight className="inline h-2.5 w-2.5" />}
          {Math.abs(s.changeRate).toFixed(2)}%
        </div>
      </div>

      {/* SKDJ K值 + 信号 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[9px] text-white/35">K</span>
          <span className="text-[11px] tabular-nums font-medium text-white/80">{fmt(s.skdjK)}</span>
          {s.skdjSignal !== 'normal' && (
            <span className="text-[9px] px-1 py-0.5 rounded font-bold"
              style={{ background: sigCfg.bg, color: sigCfg.color, border: `1px solid ${sigCfg.color}40` }}>
              {sigCfg.label}
            </span>
          )}
        </div>
        <div className="text-[9px] text-white/30">D:{fmt(s.skdjD)}</div>
      </div>

      {/* 四量格子 */}
      <div className="flex gap-1 shrink-0">
        {s.liangSignals.map(l => <LiangDot key={l.name} sig={l} />)}
      </div>

      {/* 告警图标 */}
      {(isAlert || hasChangedLiang) && (
        <AlertTriangle className="h-3 w-3 shrink-0 text-yellow-400" />
      )}
    </button>
  );
}

// ─── 折叠区块 ────────────────────────────────────────
function Section({
  title, icon, color, badge, children, defaultOpen = true,
}: {
  title: string; icon: React.ReactNode; color: string;
  badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
        style={{ background: `${color}08` }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-[13px] font-bold" style={{ color }}>{title}</span>
          {badge && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

// ─── 主页面（双栏：左监控 + 右K线详情） ─────────────────
export default function MonitorPage() {
  const [hotspots, setHotspots] = useState<HotspotItem[]>([]);
  const [suggestion, setSuggestion] = useState<DailySuggestion | null>(null);
  const [hotLoading, setHotLoading] = useState(true);
  const [hotError, setHotError] = useState<string | null>(null);

  const [stockSignals, setStockSignals] = useState<StockSignal[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 右侧选中的股票（显示K线详情）
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // 选股时自动滚动到详情区（移动端）
  const handleSelectStock = (stock: Stock | null) => {
    setSelectedStock(stock);
    if (stock) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  };

  // ── 拉取热点 + 建议 ────────────────────────────────
  const loadHotspots = useCallback(async () => {
    setHotLoading(true); setHotError(null);
    try {
      const { data, error } = await supabase.functions.invoke('monitor-hotspot');
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setHotspots(data.hotspots ?? []);
      setSuggestion(data.suggestion ?? null);
    } catch (e: unknown) {
      setHotError(e instanceof Error ? e.message : '加载失败');
    } finally { setHotLoading(false); }
  }, []);

  // ── 批量拉取K线并计算信号 ─────────────────────────
  const loadStockSignals = useCallback(async () => {
    setStockLoading(true); setStockError(null);
    try {
      const results = await Promise.allSettled(
        MONITOR_STOCKS.map(async (s) => {
          const { data, error } = await supabase.functions.invoke('stock-kline', {
            body: { code: s.code, period: '101', fuquan: '1', pageSize: '150' },
          });
          if (error) throw error;
          if (data?.code !== 200) throw new Error(data?.msg ?? 'K线API错误');

          const raw = data.data;
          const candles: CandleBar[] = (raw.candle as number[][]).map((row: number[]) => ({
            date: new Date(row[0] * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
            open: row[1], close: row[2], high: row[3], low: row[4],
            volume: row[5], amount: row[6], change: row[7], changeRate: row[8],
          }));

          if (candles.length === 0) return null;

          const skdjAll = calcSKDJ(candles);
          const lastSKDJ = skdjAll[skdjAll.length - 1];
          const skdjSignal: SKDJSignal = detectSKDJSignal(skdjAll);
          const liangSignals = detectLiangSignals(candles);
          const lastCandle = candles[candles.length - 1];
          const allRed = liangSignals.length === 4 && liangSignals.every(l => l.current === 1);

          return {
            name: s.name, code: s.code, sector: s.sector,
            lastClose: lastCandle.close,
            changeRate: lastCandle.changeRate ?? 0,
            skdjK: lastSKDJ.K,
            skdjD: lastSKDJ.D,
            skdjSignal,
            liangSignals,
            allRed,
          } satisfies StockSignal;
        })
      );

      const signals: StockSignal[] = results
        .filter((r): r is PromiseFulfilledResult<StockSignal | null> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter((v): v is StockSignal => v !== null);

      signals.sort((a, b) => SIGNAL_CONFIG[a.skdjSignal].priority - SIGNAL_CONFIG[b.skdjSignal].priority);
      setStockSignals(signals);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setStockError(e instanceof Error ? e.message : '加载失败');
    } finally { setStockLoading(false); }
  }, []);

  useEffect(() => {
    loadHotspots();
    loadStockSignals();
  }, [loadHotspots, loadStockSignals]);

  const handleRefresh = () => { loadHotspots(); loadStockSignals(); };

  const alertCount = stockSignals.filter(s =>
    s.skdjSignal !== 'normal' || s.liangSignals.some(l => l.changed)
  ).length;

  const suggestionOverallColor =
    suggestion?.overall === 'positive' ? RISE :
    suggestion?.overall === 'negative' ? FALL : '#94a3b8';

  // ── 渲染左侧监控内容 ─────────────────────────────
  const leftPane = (
    <div className="flex flex-col h-full">
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0"
        style={{ background: 'rgba(239,68,68,0.04)' }}>
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-red-400" />
          <span className="font-bold text-sm text-white/90">实时监控</span>
          {alertCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-pulse"
              style={{ background: 'rgba(239,68,68,0.2)', color: RISE, border: '1px solid rgba(239,68,68,0.4)' }}>
              {alertCount} 个信号
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {lastUpdated && (
            <span className="text-[9px] text-white/25">
              {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}更新
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={handleRefresh}
            className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
            disabled={hotLoading || stockLoading}>
            <RefreshCw className={cn('h-3.5 w-3.5', (hotLoading || stockLoading) && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* 内容滚动区 */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-3">

        {/* ① 当日建议 */}
        {(hotLoading || suggestion) && (
          <Section title="当日建议" icon={<Lightbulb className="h-4 w-4" />} color="#4ade80"
            badge={suggestion?.overall === 'positive' ? '偏多' : suggestion?.overall === 'negative' ? '偏空' : '中性'}>
            {hotLoading ? (
              <div className="flex items-center gap-2 text-white/40 text-xs py-4 justify-center">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />AI 分析中…
              </div>
            ) : hotError ? (
              <div className="text-red-400 text-xs py-2">{hotError}</div>
            ) : suggestion ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-white/10"
                  style={{ background: `${suggestionOverallColor}08` }}>
                  <span className="text-lg" style={{ color: suggestionOverallColor }}>
                    {suggestion.overall === 'positive' ? '📈' : suggestion.overall === 'negative' ? '📉' : '➡️'}
                  </span>
                  <div className="text-[12px] font-bold" style={{ color: suggestionOverallColor }}>{suggestion.summary}</div>
                </div>
                <div className="text-[11px] text-white/70 leading-relaxed border-l-2 border-green-500/40 pl-2">
                  {suggestion.strategy}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-2 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <div className="text-[9px] text-white/40 mb-1">建议关注</div>
                    <div className="text-[10px]" style={{ color: RISE }}>{suggestion.buy_suggestion}</div>
                  </div>
                  <div className="rounded-lg p-2 border" style={{ background: 'rgba(34,211,238,0.05)', borderColor: 'rgba(34,211,238,0.2)' }}>
                    <div className="text-[9px] text-white/40 mb-1">风险警示</div>
                    <div className="text-[10px]" style={{ color: FALL }}>{suggestion.sell_warning}</div>
                  </div>
                </div>
                {suggestion.key_stocks?.length > 0 && (
                  <div>
                    <div className="text-[9px] text-white/35 mb-1">重点关注（点击查看详情）</div>
                    <div className="flex flex-wrap gap-1">
                      {suggestion.key_stocks.map(name => (
                        <StockTag key={name} name={name} onSelect={handleSelectStock} sentiment="positive" />
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[8px] text-white/20 text-center">以上内容由AI生成，仅供参考，不构成投资建议</p>
              </div>
            ) : null}
          </Section>
        )}

        {/* ② 产业链监控 */}
        <Section title="产业链监控" icon={<BarChart2 className="h-4 w-4" />} color="#f97316"
          badge={alertCount > 0 ? `${alertCount}个信号` : undefined}>
          {stockLoading ? (
            <div className="flex items-center gap-2 text-white/40 text-xs py-4 justify-center">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />批量加载K线中…
            </div>
          ) : stockError ? (
            <div className="text-red-400 text-xs py-2">{stockError}</div>
          ) : (
            <div className="space-y-1.5">
              <div className="text-[9px] text-white/30 px-1 pb-1">
                点击股票行→右侧展开全部图表（K线/MACD/SKDJ/四量图）
              </div>
              {stockSignals.length === 0 ? (
                <div className="text-white/40 text-xs text-center py-4">暂无信号数据</div>
              ) : (
                stockSignals.map(s => (
                  <StockSignalRow
                    key={s.code} s={s}
                    isAlert={s.skdjSignal !== 'normal' || s.liangSignals.some(l => l.changed)}
                    isSelected={selectedStock?.code === s.code}
                    onSelect={handleSelectStock}
                  />
                ))
              )}
              <div className="mt-2 px-2 py-2 rounded-lg border border-white/8 bg-white/2">
                <div className="text-[9px] text-white/35 leading-relaxed">
                  <span style={{ color: SIGNAL_CONFIG.oversold_buy.color }}>超卖买点</span>: K&lt;25 ·
                  <span style={{ color: SIGNAL_CONFIG.golden_cross.color }}> SKDJ金叉</span>: K上穿D ·
                  <span style={{ color: SIGNAL_CONFIG.overbought_sell.color }}> 超买卖点</span>: K&gt;75 · 黄点=四量翻色
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ③ 每日热点 */}
        <Section title="每日热点" icon={<Flame className="h-4 w-4" />} color="#ef4444"
          badge={hotspots.length > 0 ? `${hotspots.length}条` : undefined} defaultOpen={false}>
          {hotLoading ? (
            <div className="flex items-center gap-2 text-white/40 text-xs py-4 justify-center">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />AI 分析热点中…
            </div>
          ) : hotError ? (
            <div className="text-red-400 text-xs py-2">{hotError}</div>
          ) : hotspots.length === 0 ? (
            <div className="text-white/40 text-xs text-center py-4">暂无今日热点数据</div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2 mb-2">
                {(['positive', 'negative', 'neutral'] as const).map(s => {
                  const cfg = { positive: { label: '利好', color: RISE }, negative: { label: '利空', color: FALL }, neutral: { label: '中性', color: '#94a3b8' } }[s];
                  const count = hotspots.filter(h => h.sentiment === s).length;
                  return (
                    <div key={s} className="flex items-center gap-1 px-2 py-1 rounded border border-white/10 bg-white/3">
                      <span className="text-[10px] font-bold tabular-nums" style={{ color: cfg.color }}>{count}</span>
                      <span className="text-[9px] text-white/40">{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
              {hotspots.map(item => (
                <HotspotCard key={item.id} item={item} onSelectStock={handleSelectStock} />
              ))}
            </div>
          )}
        </Section>

        <div className="h-2" />
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-0px)] w-full bg-[#0a0d14] text-white/90 overflow-hidden">
      {/* ── 左栏：监控面板（固定宽度） ── */}
      <div className="w-[380px] shrink-0 border-r border-white/10 flex flex-col h-full md:block hidden">
        {leftPane}
      </div>

      {/* ── 移动端：全宽监控列表（上方） ── */}
      <div className="md:hidden flex flex-col w-full">
        {/* 移动端：有选中时缩进，无选中时全屏 */}
        {!selectedStock && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {leftPane}
          </div>
        )}

        {/* 移动端：选中后显示详情，带返回按钮 */}
        {selectedStock && (
          <div className="flex flex-col h-full" ref={detailRef}>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setSelectedStock(null)}
                className="h-7 text-white/60 hover:text-white hover:bg-white/10 gap-1 text-xs">
                ← 返回监控
              </Button>
              <span className="text-xs text-white/50 truncate">{selectedStock.name} · 全图表</span>
            </div>
            <div className="flex-1 min-h-0">
              <StockDetailPanel stock={selectedStock} onClose={() => setSelectedStock(null)} />
            </div>
          </div>
        )}
      </div>

      {/* ── 右栏（桌面端）：K线详情面板 ── */}
      <div className="flex-1 min-w-0 h-full hidden md:flex flex-col">
        {selectedStock ? (
          <StockDetailPanel stock={selectedStock} onClose={() => setSelectedStock(null)} />
        ) : (
          /* 无选中时的占位提示 */
          <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
              <BarChart2 className="h-8 w-8 text-orange-400/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white/40 text-sm font-medium">选择股票查看全部图表</p>
              <p className="text-white/20 text-xs">点击左侧产业链监控中的任意股票行</p>
              <p className="text-white/20 text-xs">或热点分析中的黄色股票标签</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 bg-white/3">
              <span className="text-[10px] text-white/30">将展示：K线 · 分时 · MACD · SKDJ · 四量图</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
