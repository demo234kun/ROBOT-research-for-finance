// 产业链图谱页：四维横向布局
import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { industryChain, flattenNodes } from '@/data/industryChain';
import type { Stock, ChainNode } from '@/data/industryChain';
import StockDetailPanel from '@/components/stock/StockDetailPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// ─── 颜色配置 ──────────────────────────────────────────────
const TIER_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  material:   { bg: 'bg-orange-500/8',  border: 'border-orange-500/30',  text: 'text-orange-600 dark:text-orange-400',  accent: '#f97316' },
  components: { bg: 'bg-primary/8',     border: 'border-primary/30',     text: 'text-primary',                           accent: 'hsl(var(--primary))' },
  midstream:  { bg: 'bg-violet-500/8',  border: 'border-violet-500/30',  text: 'text-violet-600 dark:text-violet-400',  accent: '#8b5cf6' },
  downstream: { bg: 'bg-teal-500/8',    border: 'border-teal-500/30',    text: 'text-teal-600 dark:text-teal-400',      accent: '#14b8a6' },
};

const strengthStyle: Record<Stock['strength'], string> = {
  核心: 'bg-primary/15 text-primary border-primary/30',
  一般: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  概念: 'bg-muted text-muted-foreground border-border',
};

// ─── 子分类折叠卡 ─────────────────────────────────────────
function SubCard({
  node, color, onSelectStock, selectedKey, searchQ,
}: {
  node: ChainNode;
  color: typeof TIER_COLORS[string];
  onSelectStock: (s: Stock) => void;
  selectedKey: string | null;
  searchQ: string;
}) {
  const [open, setOpen] = useState(true);
  const stocks = node.stocks ?? [];
  const filtered = searchQ
    ? stocks.filter((s) => s.name.includes(searchQ) || s.code.toLowerCase().includes(searchQ.toLowerCase()))
    : stocks;

  return (
    <div className={cn('rounded-lg border mb-2', color.border, color.bg)}>
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={cn('text-xs font-semibold', color.text)}>{node.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{filtered.length}家</span>
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-2 space-y-0.5">
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground px-1 py-1">无匹配股票</p>
              )}
              {filtered.map((s) => (
                <button
                  key={s.code + s.name}
                  onClick={() => onSelectStock(s)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-colors',
                    'hover:bg-background/70',
                    selectedKey === s.code + s.name && 'bg-background/90 ring-1 ring-primary/40',
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-medium truncate">{s.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 hidden md:block">
                      {s.code}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-1 py-0 shrink-0 ml-1', strengthStyle[s.strength])}
                  >
                    {s.strength}
                  </Badge>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 主维度列 ─────────────────────────────────────────────
function DimensionColumn({
  node, onSelectStock, selectedKey, searchQ,
}: {
  node: ChainNode;
  onSelectStock: (s: Stock) => void;
  selectedKey: string | null;
  searchQ: string;
}) {
  const color = TIER_COLORS[node.id] ?? TIER_COLORS.components;
  const allStocks = flattenNodes(node.children ?? []).flatMap((n) => n.stocks ?? []);
  const uniqueCount = new Set(allStocks.map((s) => s.code + s.name)).size;

  return (
    <div className="flex flex-col min-w-0 flex-1 min-h-0">
      {/* 列标题 */}
      <div className={cn('rounded-t-xl px-4 py-3 border', color.border, 'bg-card border-b-0')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-3 w-1 rounded-full shrink-0"
              style={{ backgroundColor: color.accent }}
            />
            <h3 className={cn('font-bold text-sm truncate', color.text)}>{node.name}</h3>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">{uniqueCount}家</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
      </div>

      {/* 子分类列表 */}
      <ScrollArea className={cn('flex-1 rounded-b-xl border', color.border, 'border-t-0 bg-card/50')}>
        <div className="p-2">
          {(node.children ?? []).map((child) => (
            <SubCard
              key={child.id}
              node={child}
              color={color}
              onSelectStock={onSelectStock}
              selectedKey={selectedKey}
              searchQ={searchQ}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── 主页面 ──────────────────────────────────────────────
export default function GraphPage() {
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const handleSelectStock = (s: Stock) => {
    const key = s.code + s.name;
    if (selectedKey === key) {
      setSelectedStock(null);
      setSelectedKey(null);
    } else {
      setSelectedStock(s);
      setSelectedKey(key);
    }
  };

  const hitCount = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    return flattenNodes(industryChain)
      .flatMap((n) => n.stocks ?? [])
      .filter((s) => s.name.includes(q) || s.code.toLowerCase().includes(q)).length;
  }, [search]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 顶部搜索栏 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索股票名称 / 代码…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        {search && hitCount !== null && (
          <span className="text-xs text-muted-foreground shrink-0">命中 {hitCount} 家</span>
        )}
        {selectedStock && (
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span className="text-xs text-muted-foreground">已选：</span>
            <Badge variant="outline" className="text-xs">{selectedStock.name}</Badge>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setSelectedStock(null); setSelectedKey(null); }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 min-h-0 gap-3 p-3 overflow-hidden">
        {/* 四列产业链 */}
        <div className="grid gap-3 flex-1 min-w-0 min-h-0" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
          {industryChain.map((tier) => (
            <DimensionColumn
              key={tier.id}
              node={tier}
              onSelectStock={handleSelectStock}
              selectedKey={selectedKey}
              searchQ={search}
            />
          ))}
        </div>

        {/* 右侧详情面板 */}
        <AnimatePresence>
          {selectedStock && (
            <motion.div
              key="detail"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="shrink-0 rounded-xl border border-border overflow-hidden"
              style={{ minWidth: 0 }}
            >
              <StockDetailPanel
                stock={selectedStock}
                onClose={() => { setSelectedStock(null); setSelectedKey(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
