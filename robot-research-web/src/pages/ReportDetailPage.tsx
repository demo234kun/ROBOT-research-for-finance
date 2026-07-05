import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, Lightbulb, TrendingUp, Clock, Network, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ReactECharts from 'echarts-for-react';
import { getReportById } from '@/data/reports';
import { glossary } from '@/data/glossary';
import { flattenNodes } from '@/data/industryChain';
import { useState, useMemo, type ReactNode } from 'react';

// 术语匹配：将文本中的术语替换为可点击的 span
function renderTextWithTerms(text: string, onTermClick: (term: string) => void): ReactNode {
  // 按术语长度降序排列，优先匹配长术语
  const sortedTerms = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliestIdx = -1;
    let earliestTerm = '';

    for (const g of sortedTerms) {
      const idx = remaining.indexOf(g.term);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
        earliestTerm = g.term;
      }
    }

    if (earliestIdx === -1) {
      parts.push(<span key={`t-${key++}`}>{remaining}</span>);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(<span key={`t-${key++}`}>{remaining.slice(0, earliestIdx)}</span>);
    }

    parts.push(
      <span
        key={`term-${key++}`}
        className="term-underline"
        onClick={() => onTermClick(earliestTerm)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onTermClick(earliestTerm);
        }}
        role="button"
        tabIndex={0}
      >
        {earliestTerm}
      </span>,
    );

    remaining = remaining.slice(earliestIdx + earliestTerm.length);
  }

  return <>{parts}</>;
}

// 数字高亮：将文本中的数字用特殊样式包裹
function renderWithNumbers(text: string): ReactNode {
  const parts = text.split(/(\d+[\.\d]*[%万亿台倍年月日秒弧个]?)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={`num-${i}`} className="num-highlight">
            {part}
          </span>
        ) : (
          <span key={`txt-${i}`}>{part}</span>
        ),
      )}
    </>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const report = id ? getReportById(id) : undefined;
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const allNodes = useMemo(() => flattenNodes([]), []);

  const termDef = useMemo(() => {
    if (!selectedTerm) return null;
    return glossary.find((g) => g.term === selectedTerm) || null;
  }, [selectedTerm]);

  if (!report) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <p className="text-sm text-muted-foreground">研报未找到</p>
        <Link to="/reports">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            返回研报列表
          </Button>
        </Link>
      </div>
    );
  }

  // 查找关联节点名称
  const nodeNames = report.relatedNodes
    .map((nid) => allNodes.find((n) => n.id === nid)?.name)
    .filter(Boolean) as string[];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Link to="/reports">
        <Button variant="ghost" size="sm" className="mb-4 text-xs h-7 text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          返回研报列表
        </Button>
      </Link>

      {/* 研报头部 */}
      <div className="terminal-card p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
            {report.institution}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {report.date}
          </span>
        </div>
        <h1 className="text-lg md:text-xl font-bold text-foreground mb-3 text-balance">
          {report.title}
        </h1>

        {/* 一句话导读 */}
        <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/20 mb-3">
          <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-accent font-semibold">为什么重要</span>
            <p className="text-xs text-foreground/90 leading-relaxed mt-0.5">
              {renderTextWithTerms(report.intro, setSelectedTerm)}
            </p>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {report.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] h-5 border-primary/20 text-primary/80">
              {t}
            </Badge>
          ))}
        </div>

        {/* 关联信息 */}
        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          {nodeNames.length > 0 && (
            <span className="flex items-center gap-1">
              <Network className="h-3 w-3" />
              关联板块：
              {nodeNames.map((n, i) => (
                <Link key={n} to="/graph" className="text-primary/80 hover:text-primary">
                  {n}
                  {i < nodeNames.length - 1 ? '、' : ''}
                </Link>
              ))}
            </span>
          )}
          {report.relatedStocks.length > 0 && (
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              关联股票：
              {report.relatedStocks.map((s, i) => (
                <span key={s.code} className="text-primary/80">
                  {s.name}({s.code})
                  {i < report.relatedStocks.length - 1 ? '、' : ''}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* 关键论点 */}
      <div className="mb-5">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="h-1 w-3 bg-primary" />
          关键论点
        </h2>
        <div className="space-y-3">
          {report.arguments.map((arg, i) => (
            <div key={i} className="terminal-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{arg.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {renderTextWithTerms(arg.content, setSelectedTerm)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {arg.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-[10px] px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent font-medium"
                  >
                    {renderWithNumbers(h)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 数据图表与表格 */}
      {report.tables.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="h-1 w-3 bg-primary" />
            数据图表
          </h2>
          <div className="space-y-4">
            {report.tables.map((table, i) => (
              <div key={i} className="terminal-card p-4">
                <h3 className="text-xs font-semibold text-foreground mb-3">{table.title}</h3>
                {table.chartType === 'bar' ? (
                  <div className="w-full min-w-0 overflow-hidden">
                    <ReactECharts
                      option={{
                        tooltip: {
                          trigger: 'axis',
                          backgroundColor: 'hsl(120 18% 6%)',
                          borderColor: 'hsl(120 25% 14%)',
                          textStyle: { color: 'hsl(120 30% 82%)', fontSize: 11 },
                        },
                        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                        xAxis: {
                          type: 'category',
                          data: table.rows.map((r) => r[0]),
                          axisLabel: { color: 'hsl(120 15% 48%)', fontSize: 10 },
                          axisLine: { lineStyle: { color: 'hsl(120 25% 14%)' } },
                        },
                        yAxis: {
                          type: 'value',
                          axisLabel: { color: 'hsl(120 15% 48%)', fontSize: 10 },
                          axisLine: { lineStyle: { color: 'hsl(120 25% 14%)' } },
                          splitLine: { lineStyle: { color: 'hsl(120 25% 14% / 0.5)' } },
                        },
                        series: [
                          {
                            type: 'bar',
                            data: table.rows.map((r) => {
                              const val = parseFloat(r[1].replace(/[^0-9.]/g, ''));
                              return isNaN(val) ? 0 : val;
                            }),
                            itemStyle: {
                              color: {
                                type: 'linear',
                                x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                  { offset: 0, color: 'hsl(145 100% 45%)' },
                                  { offset: 1, color: 'hsl(145 80% 30%)' },
                                ],
                              },
                            },
                            barWidth: '50%',
                          },
                        ],
                      }}
                      style={{ height: 240, width: '100%' }}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-full overflow-x-auto bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          {table.headers.map((h) => (
                            <TableHead key={h} className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.rows.map((row, ri) => (
                          <TableRow key={ri} className="border-border/50">
                            {row.map((cell, ci) => (
                              <TableCell key={ci} className="text-xs whitespace-nowrap">
                                {ci === 0 ? (
                                  <span className="text-foreground font-medium">{cell}</span>
                                ) : (
                                  renderWithNumbers(cell)
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 时间线 */}
      {report.milestones.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="h-1 w-3 bg-primary" />
            发展里程碑
          </h2>
          <div className="terminal-card p-4">
            <div className="relative pl-6 border-l border-primary/20">
              {report.milestones.map((m, i) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <div className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-primary/60 border border-primary" />
                  <span className="text-[10px] text-accent font-mono">{m.date}</span>
                  <p className="text-xs text-foreground/80 leading-relaxed mt-0.5">
                    {renderTextWithTerms(m.event, setSelectedTerm)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 术语弹窗 */}
      <Dialog open={!!selectedTerm} onOpenChange={(open) => !open && setSelectedTerm(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm glow-text">{selectedTerm}</DialogTitle>
          </DialogHeader>
          {termDef && (
            <div className="space-y-2">
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary/80">
                {termDef.category}
              </Badge>
              <p className="text-xs text-foreground/80 leading-relaxed">{termDef.definition}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}