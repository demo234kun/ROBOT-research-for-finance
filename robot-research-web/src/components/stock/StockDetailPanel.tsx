// 股票详情面板：标准K线（蜡烛+均线+成交量）+ MACD/SKDJ并排 + 四量图
import { useEffect, useState, useRef, useCallback } from 'react';
import { X, TrendingUp, TrendingDown, Minus, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Stock } from '@/data/industryChain';
import { cn } from '@/lib/utils';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend, ReferenceLine,
} from 'recharts';

// ─── 类型 ──────────────────────────────────────────────────
interface StockInfo {
  prod_code: string; prod_name: string;
  last_px: number; px_change: number; px_change_rate: number;
  open_px: number; high_px: number; low_px: number; preclose_px: number;
  turnover_volume: number; turnover_value: number;
  market_value: number; circulation_value: number;
  pe_rate: number; pb_rate: number; turnover_ratio: number; amplitude: number;
}

interface Candle {
  date: string;
  open: number; close: number; high: number; low: number;
  volume: number; amount: number; change: number; changeRate: number;
}

// ─── 指标计算 ──────────────────────────────────────────────
function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { ema.push(data[0]); continue; }
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}
function calcMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    return +(data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period).toFixed(3);
  });
}
function calcMACD(closes: number[]) {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const dif = ema12.map((v, i) => v - ema26[i]);
  const dea = calcEMA(dif, 9);
  const macd = dif.map((v, i) => (v - dea[i]) * 2);
  return { dif, dea, macd };
}
function calcSKDJ(candles: Candle[], nPeriod = 9, mPeriod = 3) {
  const result: { K: number; D: number; J: number }[] = [];
  let prevK = 50, prevD = 50;
  for (let i = 0; i < candles.length; i++) {
    const start = Math.max(0, i - nPeriod + 1);
    const slice = candles.slice(start, i + 1);
    const lowest = Math.min(...slice.map((c) => c.low));
    const highest = Math.max(...slice.map((c) => c.high));
    const rsv = highest === lowest ? 50 : ((candles[i].close - lowest) / (highest - lowest)) * 100;
    const K = (prevK * (mPeriod - 1) + rsv) / mPeriod;
    const D = (prevD * (mPeriod - 1) + K) / mPeriod;
    const J = 3 * K - 2 * D;
    result.push({ K, D, J });
    prevK = K; prevD = D;
  }
  return result;
}
// ─── 四量图算法（通达信公式移植）──────────────────────────
// 辅助：简单移动均线（不足期返回 null）
function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    return data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
  });
}

// 1. 散户量能：牛线/马线
//    MID = (3*C + L + O + H) / 6
//    牛线 = 加权MA(MID, 权重20..1，共20期) / 210
//    马线 = MA(牛线, 6)
//    红：C > 牛线；绿：C <= 牛线（含马线区间）
function calcSanhu(candles: Candle[]): (1 | -1)[] {
  const mids = candles.map(c => (3 * c.close + c.low + c.open + c.high) / 6);
  const bulls: (number | null)[] = mids.map((_, i) => {
    if (i < 19) return null; // 至少需要20个点(index 0..19)
    let sum = 0;
    for (let k = 0; k < 20; k++) sum += (20 - k) * mids[i - k]; // 权重20,19,...,1 共210
    return sum / 210;
  });
  const bullArr = bulls.map(v => v ?? 0);
  const horses = sma(bullArr, 6);
  return candles.map((c, i) => {
    const bull = bulls[i];
    const horse = horses[i];
    if (bull == null || horse == null) return -1;
    if (c.close > bull) return 1;
    return -1;
  });
}

// 2. 游资量能：MAX/MIN(MA60, MA120)
function calcYouzi(candles: Candle[]): (1 | -1)[] {
  const closes = candles.map(c => c.close);
  const ma60 = sma(closes, 60);
  const ma120 = sma(closes, 120);
  return candles.map((c, i) => {
    const a = ma60[i], b = ma120[i];
    if (a == null || b == null) return -1;
    const A = Math.max(a, b);
    return c.close >= A ? 1 : -1;
  });
}

// 3. 机构量能：MAX/MIN(MA45, MA90)
function calcJigou(candles: Candle[]): (1 | -1)[] {
  const closes = candles.map(c => c.close);
  const ma45 = sma(closes, 45);
  const ma90 = sma(closes, 90);
  return candles.map((c, i) => {
    const a = ma45[i], b = ma90[i];
    if (a == null || b == null) return -1;
    const E = Math.max(a, b);
    return c.close > E ? 1 : -1;
  });
}

// 4. 主力量能：MAX/MIN(MA30, MA60)
function calcZhuli(candles: Candle[]): (1 | -1)[] {
  const closes = candles.map(c => c.close);
  const ma30 = sma(closes, 30);
  const ma60 = sma(closes, 60);
  return candles.map((c, i) => {
    const a = ma30[i], b = ma60[i];
    if (a == null || b == null) return -1;
    const J = Math.max(a, b);
    return c.close > J ? 1 : -1;
  });
}

// 强弱钝化线：斐波那契MA [5,13,21,34,55,89,144,233]，score=sum-3.8
const FIB_PERIODS = [5, 13, 21, 34, 55, 89, 144, 233];
function calcQiangRuo(candles: Candle[]): (number | null)[] {
  const closes = candles.map(c => c.close);
  const fibMAs = FIB_PERIODS.map(p => sma(closes, p));
  return candles.map((c, i) => {
    // 只要最短MA有值才计算
    if (fibMAs[0][i] == null) return null;
    let score = 0;
    for (let k = 0; k < FIB_PERIODS.length; k++) {
      const ma = fibMAs[k][i];
      if (ma != null && c.close > ma) score++;
    }
    return +(score - 3.8).toFixed(2);
  });
}

interface LiangRow {
  date: string;
  val: 1;        // 柱高始终为1
  isRed: boolean;
  qiangRuo: number | null;
}
interface LiangData {
  sanhu: LiangRow[];
  youzi: LiangRow[];
  jigou: LiangRow[];
  zhuli: LiangRow[];
}

function calc4Liang(candles: Candle[]): LiangData {
  const sh = calcSanhu(candles);
  const yz = calcYouzi(candles);
  const jg = calcJigou(candles);
  const zl = calcZhuli(candles);
  const qr = calcQiangRuo(candles);
  return {
    sanhu: candles.map((c, i) => ({ date: c.date, val: 1, isRed: sh[i] === 1, qiangRuo: qr[i] })),
    youzi: candles.map((c, i) => ({ date: c.date, val: 1, isRed: yz[i] === 1, qiangRuo: qr[i] })),
    jigou: candles.map((c, i) => ({ date: c.date, val: 1, isRed: jg[i] === 1, qiangRuo: qr[i] })),
    zhuli: candles.map((c, i) => ({ date: c.date, val: 1, isRed: zl[i] === 1, qiangRuo: qr[i] })),
  };
}

// ─── 格式化 ──────────────────────────────────────────────
function fmt(v: number | undefined, d = 2) {
  if (v == null || isNaN(v)) return '--';
  return v.toFixed(d);
}
function fmtWan(v: number | undefined) {
  if (v == null || isNaN(v)) return '--';
  if (v >= 1e8) return (v / 1e8).toFixed(2) + '亿';
  if (v >= 1e4) return (v / 1e4).toFixed(2) + '万';
  return v.toString();
}

const RISE = '#ef4444';  // 红-阳线
const FALL = '#22d3ee';  // 青-阴线
const WICK = '#94a3b8';  // 影线灰

// MA线颜色：白/黄/绿/紫/青
const MA_COLORS = ['#ffffff', '#facc15', '#4ade80', '#c084fc', '#22d3ee'];
const MA_PERIODS = [5, 10, 20, 30, 60];

// ─── 蜡烛图自定义Shape（堆叠Bar上层的实体+影线）──────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandleBody(props: any) {
  // props来自recharts Bar shape，包含 x, y, width, height, payload
  const { x, y, width, height, payload } = props;
  if (!payload || width <= 0) return null;
  const { open, close } = payload as Candle;
  const isUp = close >= open;
  const color = isUp ? RISE : FALL;
  const barWidth = Math.max(width - 2, 2);
  const barX = x + (width - barWidth) / 2;
  return (
    <rect x={barX} y={y} width={barWidth} height={Math.max(height, 1)} fill={color} />
  );
}

// 影线：从 high 到 low，细线居中
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandleWick(props: any) {
  const { x, y, width, height, payload } = props;
  if (!payload || width <= 0) return null;
  const cx = x + width / 2;
  const isUp = (payload as Candle).close >= (payload as Candle).open;
  const color = isUp ? RISE : FALL;
  return (
    <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1.5} />
  );
}

// ─── K线主图（蜡烛+均线+成交量子图）──────────────────────────
function KlineChart({ data, height = 260 }: { data: ReturnType<typeof buildChartData>; height?: number }) {
  const tickInterval = Math.floor(data.length / 5);

  // Y轴范围：价格域
  const allPrices = data.flatMap(d => [d.high, d.low]).filter(Boolean);
  const minP = Math.min(...allPrices) * 0.995;
  const maxP = Math.max(...allPrices) * 1.005;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={tickInterval} />
          <YAxis
            domain={[minP, maxP]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            width={48}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as typeof data[0];
              return (
                <div className="bg-[#1a1f2e] border border-white/10 rounded p-2 text-[10px] space-y-0.5 shadow-xl">
                  <div className="font-medium text-white/80">{d.date}</div>
                  <div className="grid grid-cols-2 gap-x-3">
                    <span className="text-white/50">开</span><span className="tabular-nums">{fmt(d.open)}</span>
                    <span className="text-white/50">高</span><span className="tabular-nums" style={{ color: RISE }}>{fmt(d.high)}</span>
                    <span className="text-white/50">低</span><span className="tabular-nums" style={{ color: FALL }}>{fmt(d.low)}</span>
                    <span className="text-white/50">收</span><span className="tabular-nums font-bold" style={{ color: d.isUp ? RISE : FALL }}>{fmt(d.close)}</span>
                    <span className="text-white/50">涨幅</span>
                    <span className="tabular-nums" style={{ color: d.changeRate >= 0 ? RISE : FALL }}>
                      {d.changeRate >= 0 ? '+' : ''}{fmt(d.changeRate)}%
                    </span>
                  </div>
                  {MA_PERIODS.map((p, i) => d[`ma${p}` as keyof typeof d] != null && (
                    <div key={p} className="flex justify-between gap-2">
                      <span style={{ color: MA_COLORS[i] }}>MA{p}</span>
                      <span className="tabular-nums" style={{ color: MA_COLORS[i] }}>{fmt(d[`ma${p}` as keyof typeof d] as number)}</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          {/* 影线 Bar（full H-L range，分4段堆叠） */}
          {/* s1: transparent base (to low), s2: lower wick, s3: body, s4: upper wick */}
          <Bar dataKey="s1" stackId="k" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="s2" stackId="k" shape={<CandleWick />} isAnimationActive={false}>
            {data.map((_, i) => <Cell key={i} fill={WICK} />)}
          </Bar>
          <Bar dataKey="s3" stackId="k" shape={<CandleBody />} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.isUp ? RISE : FALL} />)}
          </Bar>
          <Bar dataKey="s4" stackId="k" shape={<CandleWick />} isAnimationActive={false}>
            {data.map((_, i) => <Cell key={i} fill={WICK} />)}
          </Bar>
          {/* 均线 */}
          {MA_PERIODS.map((p, i) => (
            <Line
              key={p}
              type="monotone"
              dataKey={`ma${p}`}
              stroke={MA_COLORS[i]}
              dot={false}
              strokeWidth={1}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 成交量子图 ──────────────────────────────────────────
function VolumeChart({ data, height = 70 }: { data: ReturnType<typeof buildChartData>; height?: number }) {
  const tickInterval = Math.floor(data.length / 5);
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={tickInterval} />
          <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} width={48} tickFormatter={fmtWan} />
          <Bar dataKey="volume" isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.isUp ? RISE : FALL} opacity={0.7} />)}
          </Bar>
          <Line type="monotone" dataKey="vol5avg" stroke="#facc15" dot={false} strokeWidth={1} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── MACD 子图 ──────────────────────────────────────────
function MACDChart({ data, height = 140 }: { data: ReturnType<typeof buildChartData>; height?: number }) {
  const tickInterval = Math.floor(data.length / 4);
  return (
    <div style={{ height }}>
      <div className="text-[9px] text-white/40 px-1 mb-0.5">MACD(12,26,9)</div>
      <ResponsiveContainer width="100%" height="calc(100% - 16px)">
        <ComposedChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={tickInterval} />
          <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} width={38} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-[#1a1f2e] border border-white/10 rounded p-1.5 text-[9px] shadow-xl">
                  <div>{d.date}</div>
                  <div style={{ color: '#facc15' }}>DIF {fmt(d.dif, 3)}</div>
                  <div style={{ color: '#c084fc' }}>DEA {fmt(d.dea, 3)}</div>
                  <div style={{ color: d.macd >= 0 ? RISE : FALL }}>MACD {fmt(d.macd, 3)}</div>
                </div>
              );
            }}
          />
          <ReferenceLine y={0} stroke="rgba(148,163,184,0.3)" />
          <Bar dataKey="macd" isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={(d.macd ?? 0) >= 0 ? RISE : FALL} opacity={0.85} />)}
          </Bar>
          <Line type="monotone" dataKey="dif" stroke="#facc15" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="dea" stroke="#c084fc" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Legend
            wrapperStyle={{ fontSize: 9, color: '#94a3b8' }}
            formatter={(v) => v === 'dif' ? 'DIF' : v === 'dea' ? 'DEA' : 'MACD'}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── SKDJ 子图 ──────────────────────────────────────────
function SKDJChart({ data, height = 140 }: { data: ReturnType<typeof buildChartData>; height?: number }) {
  const tickInterval = Math.floor(data.length / 4);
  return (
    <div style={{ height }}>
      <div className="text-[9px] text-white/40 px-1 mb-0.5">SKDJ(9,3)</div>
      <ResponsiveContainer width="100%" height="calc(100% - 16px)">
        <ComposedChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={tickInterval} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} width={28} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-[#1a1f2e] border border-white/10 rounded p-1.5 text-[9px] shadow-xl">
                  <div>{d.date}</div>
                  <div style={{ color: '#facc15' }}>K {fmt(d.K)}</div>
                  <div style={{ color: '#c084fc' }}>D {fmt(d.D)}</div>
                  <div style={{ color: '#22d3ee' }}>J {fmt(d.J)}</div>
                </div>
              );
            }}
          />
          <ReferenceLine y={80} stroke={RISE} strokeDasharray="2 2" strokeOpacity={0.4} />
          <ReferenceLine y={20} stroke={FALL} strokeDasharray="2 2" strokeOpacity={0.4} />
          <Line type="monotone" dataKey="K" stroke="#facc15" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="D" stroke="#c084fc" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Line type="monotone" dataKey="J" stroke="#22d3ee" dot={false} strokeWidth={1} isAnimationActive={false} />
          <Legend wrapperStyle={{ fontSize: 9, color: '#94a3b8' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── 四量图 ──────────────────────────────────────────────
// ─── 四量图组件 ─────────────────────────────────────────
const LIANG_LABELS = ['① 散户', '② 游资', '③ 机构', '④ 主力'];
const LIANG_KEYS: (keyof LiangData)[] = ['sanhu', 'youzi', 'jigou', 'zhuli'];

function SingleLiangBar({ rows, label, syncId }: { rows: LiangRow[]; label: string; syncId: string }) {
  const tickInterval = Math.floor(rows.length / 5);
  // 当前最后一根的颜色
  const last = rows[rows.length - 1];
  const labelColor = last?.isRed ? RISE : FALL;
  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-0.5">
        <span className="text-[9px]" style={{ color: labelColor }}>{label}</span>
        <span className="text-[8px]" style={{ color: labelColor }}>{last?.isRed ? '▲ 进场' : '▼ 出逃'}</span>
      </div>
      <ResponsiveContainer width="100%" height={42}>
        <ComposedChart data={rows} syncId={syncId} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} height={0} />
          <YAxis domain={[0, 1]} tick={false} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={() => null} />
          <Bar dataKey="val" isAnimationActive={false} maxBarSize={12}>
            {rows.map((d, i) => (
              <Cell key={i} fill={d.isRed ? RISE : FALL} opacity={0.9} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function VolChart4({ liangData }: { liangData: LiangData }) {
  const display = liangData.sanhu;
  const tickInterval = Math.floor(display.length / 5);

  // 强弱钝化线数据（从 sanhu 中取，已附带）
  const qrData = display.map(d => ({ date: d.date, qr: d.qiangRuo }));

  // 直接使用传入的已切片数据，无需再次slice
  const sliced: LiangData = liangData;

  // 统计四量齐红（最新一根）
  const lastIdx = display.length - 1;
  const allRed = lastIdx >= 0 && LIANG_KEYS.every(k => sliced[k][lastIdx]?.isRed);

  return (
    <div className="space-y-1">
      {/* 使用说明 */}
      <div className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-[9px] text-white/50 leading-relaxed">
        <span className="text-[#facc15] font-medium">📊 四量图说明</span>：
        红色＝资金进场，绿色＝资金出逃。散户→游资→机构→{' '}
        <span className="text-[#ef4444] font-medium">主力（最关键）</span>。
        策略：主力变红买入，主力变绿撤出。
        <span className="text-[#facc15]">「四量齐红为最美！」</span>
      </div>

      {/* 四量齐红提示 */}
      {allRed && (
        <div className="text-center text-[9px] font-bold py-1 rounded" style={{ color: RISE, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          🔥 四量齐红！主力全线进场
        </div>
      )}

      {/* 强弱钝化线 */}
      <div>
        <div className="flex items-center gap-1 px-1 mb-0.5">
          <span className="text-[9px] text-[#facc15]">强弱钝化线</span>
          <span className="text-[8px] text-white/30">（≥0 多头，&lt;0 空头，高位平行=强势钝化）</span>
        </div>
        <ResponsiveContainer width="100%" height={55}>
          <ComposedChart data={qrData} syncId="liang4" margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.08)" />
            <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} height={0} />
            <YAxis domain={[-4.2, 4.2]} tick={{ fontSize: 8, fill: '#94a3b8' }} width={48}
              ticks={[-4, -2, 0, 2, 4]} />
            <ReferenceLine y={0} stroke="rgba(148,163,184,0.4)" />
            <ReferenceLine y={3} stroke="rgba(239,68,68,0.3)" strokeDasharray="2 2" />
            <ReferenceLine y={-3} stroke="rgba(34,211,238,0.3)" strokeDasharray="2 2" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const v = payload[0]?.payload?.qr;
                return (
                  <div className="bg-[#1a1f2e] border border-white/10 rounded p-1 text-[9px] shadow-xl">
                    <span style={{ color: '#facc15' }}>强弱 {v != null ? v : '--'}</span>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="qr" stroke="#facc15" dot={false} strokeWidth={1.5}
              connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 四量柱状（由上至下：散户→游资→机构→主力） */}
      {LIANG_KEYS.map((key, i) => (
        <SingleLiangBar
          key={key}
          rows={sliced[key]}
          label={LIANG_LABELS[i]}
          syncId="liang4"
        />
      ))}

      {/* X轴（只在最后一排下方显示，YAxis占位与上方图对齐） */}
      <div style={{ height: 20 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sliced.zhuli} syncId="liang4" margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
            <YAxis domain={[0, 1]} tick={false} axisLine={false} tickLine={false} width={48} />
            <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={tickInterval} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 底部格言 */}
      <p className="text-center text-[8px] text-white/25 pt-1">
        「你我跟着主力走，一切财富全都有！」
      </p>
    </div>
  );
}

// ─── 图表行类型 ────────────────────────────────────────
interface ChartRow extends Candle {
  isUp: boolean;
  s1: number; s2: number; s3: number; s4: number;
  ma5: number | null; ma10: number | null; ma20: number | null; ma30: number | null; ma60: number | null;
  vol5avg: number;
  dif: number | null; dea: number | null; macd: number | null;
  K: number | null; D: number | null; J: number | null;
}

// ─── 数据整合 ──────────────────────────────────────────
function buildChartData(candles: Candle[]): ChartRow[] {
  const closes = candles.map(c => c.close);
  const macdCalc = closes.length >= 26 ? calcMACD(closes) : null;
  const skdjCalc = candles.length >= 9 ? calcSKDJ(candles) : null;

  const mas = MA_PERIODS.map(p => calcMA(closes, p));
  const vol5avg: number[] = candles.map((_, i) => {
    const start = Math.max(0, i - 4);
    return Math.round(candles.slice(start, i + 1).reduce((s, c) => s + c.volume, 0) / (i - start + 1));
  });

  const allLows = candles.map(c => c.low);
  const allHighs = candles.map(c => c.high);
  const minLow = Math.min(...allLows);
  const maxHigh = Math.max(...allHighs);
  const minBodySize = (maxHigh - minLow) * 0.002;

  return candles.map((c, i) => {
    const bodyLow = Math.min(c.open, c.close);
    const bodyHigh = Math.max(c.open, c.close);
    return {
      ...c,
      isUp: c.close >= c.open,
      s1: c.low,
      s2: bodyLow - c.low,
      s3: Math.max(bodyHigh - bodyLow, minBodySize),
      s4: c.high - bodyHigh,
      ma5: mas[0][i],
      ma10: mas[1][i],
      ma20: mas[2][i],
      ma30: mas[3][i],
      ma60: mas[4][i],
      vol5avg: vol5avg[i],
      dif: macdCalc ? +macdCalc.dif[i].toFixed(3) : null,
      dea: macdCalc ? +macdCalc.dea[i].toFixed(3) : null,
      macd: macdCalc ? +macdCalc.macd[i].toFixed(3) : null,
      K: skdjCalc ? +skdjCalc[i].K.toFixed(2) : null,
      D: skdjCalc ? +skdjCalc[i].D.toFixed(2) : null,
      J: skdjCalc ? +skdjCalc[i].J.toFixed(2) : null,
    } satisfies ChartRow;
  });
}

// ─── 周期配置 ──────────────────────────────────────────
type PeriodKey = 'fens' | '101' | '102' | '103';
const PERIOD_CONFIG: Record<PeriodKey, { label: string; pageSize: string; isMink: boolean; dateFormat: (ts: number | string) => string }> = {
  fens: { label: '分时', pageSize: '240', isMink: true,
    dateFormat: (s: number | string) => {
      const str = String(s);
      return str.length >= 16 ? str.slice(11, 16) : str; // HH:mm
    }
  },
  '101': { label: '日K', pageSize: '120', isMink: false,
    dateFormat: (ts: number | string) => new Date(Number(ts) * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
  },
  '102': { label: '周K', pageSize: '104', isMink: false,
    dateFormat: (ts: number | string) => new Date(Number(ts) * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
  },
  '103': { label: '月K', pageSize: '60', isMink: false,
    dateFormat: (ts: number | string) => new Date(Number(ts) * 1000).toLocaleDateString('zh-CN', { year: '2-digit', month: '2-digit' }),
  },
};

// 分时图行数据
interface MinkRow {
  date: string; // HH:mm
  open: number; close: number; high: number; low: number;
  volume: number;
  ma5: number | null; ma10: number | null; ma30: number | null;
  preclose: number;
  changeRate: number;
}

const VIEW_SIZE = 60; // 每次显示的蜡烛数量

// ─── 主组件 ──────────────────────────────────────────────
interface Props { stock: Stock; onClose: () => void; }

export default function StockDetailPanel({ stock, onClose }: Props) {
  const [info, setInfo] = useState<StockInfo | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [minkRows, setMinkRows] = useState<MinkRow[]>([]);
  const [period, setPeriod] = useState<PeriodKey>('101');
  const [viewOffset, setViewOffset] = useState(0); // 0=最新，正=向历史移动
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isListed = stock.market !== '未上市' && !stock.code.includes('未上市');

  const loadData = useCallback(async (p: PeriodKey) => {
    if (!isListed) { setLoading(false); return; }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null); setViewOffset(0);
    const cfg = PERIOD_CONFIG[p];
    try {
      if (cfg.isMink) {
        // 分时图：只需 mink + info
        const [infoRes, minkRes] = await Promise.all([
          supabase.functions.invoke('stock-info', { body: { code: stock.code } }),
          supabase.functions.invoke('stock-mink', { body: { code: stock.code, period: '1', pageSize: cfg.pageSize } }),
        ]);
        if (infoRes.error) throw infoRes.error;
        if (minkRes.error) throw minkRes.error;
        if (infoRes.data?.code === 200) setInfo(infoRes.data.data);
        if (minkRes.data?.code === 200) {
          const list = minkRes.data.data.list as {
            day: string; open: string; close: string; high: string; low: string;
            volume: string; ma_price5: number; ma_price10: number; ma_price30: number;
          }[];
          const preclose = infoRes.data?.data?.preclose_px ?? parseFloat(list[0]?.open ?? '0');
          const rows: MinkRow[] = list.map(item => {
            const close = parseFloat(item.close);
            return {
              date: cfg.dateFormat(item.day),
              open: parseFloat(item.open), close,
              high: parseFloat(item.high), low: parseFloat(item.low),
              volume: parseFloat(item.volume),
              ma5: item.ma_price5 ?? null,
              ma10: item.ma_price10 ?? null,
              ma30: item.ma_price30 ?? null,
              preclose,
              changeRate: preclose > 0 ? +((close - preclose) / preclose * 100).toFixed(2) : 0,
            };
          });
          setMinkRows(rows);
          setCandles([]);
        }
      } else {
        // K线
        const [infoRes, klineRes] = await Promise.all([
          supabase.functions.invoke('stock-info', { body: { code: stock.code } }),
          supabase.functions.invoke('stock-kline', { body: { code: stock.code, period: p, fuquan: '1', pageSize: cfg.pageSize } }),
        ]);
        if (infoRes.error) throw infoRes.error;
        if (klineRes.error) throw klineRes.error;
        if (infoRes.data?.code === 200) setInfo(infoRes.data.data);
        if (klineRes.data?.code === 200) {
          const raw = klineRes.data.data;
          const parsed: Candle[] = (raw.candle as number[][]).map((row) => ({
            date: cfg.dateFormat(row[0]),
            open: row[1], close: row[2], high: row[3], low: row[4],
            volume: row[5], amount: row[6], change: row[7], changeRate: row[8],
          }));
          setCandles(parsed);
          setMinkRows([]);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setError(e.message);
    } finally { setLoading(false); }
  }, [stock.code, isListed]);

  useEffect(() => { loadData(period); return () => abortRef.current?.abort(); }, [loadData, period]);

  const handlePeriodChange = (p: PeriodKey) => { setPeriod(p); };

  const changeColor = info
    ? info.px_change_rate > 0 ? RISE : info.px_change_rate < 0 ? FALL : '#94a3b8'
    : '#94a3b8';

  // 分时数据视图（不做pan，直接用全量）
  const isFens = period === 'fens';

  // 时间轴平移逻辑（仅对K线）
  const totalBars = candles.length;
  const maxOffset = Math.max(0, totalBars - VIEW_SIZE);
  const safeOffset = Math.min(viewOffset, maxOffset);
  const viewEnd = totalBars - safeOffset;
  const viewStart = Math.max(0, viewEnd - VIEW_SIZE);
  const displayCandles = candles.slice(viewStart, viewEnd);

  const chartData = displayCandles.length > 0 ? buildChartData(displayCandles) : [];
  // 四量图用全量candles计算（保证MA60/MA90/MA120有足够历史数据）
  // 再将viewStart/viewEnd对应段传入VolChart4展示，保持与上方图表时间窗口一致
  const liangDataFull = candles.length > 0 ? calc4Liang(candles) : null;
  const liangData = liangDataFull ? {
    sanhu: liangDataFull.sanhu.slice(viewStart, viewEnd),
    youzi: liangDataFull.youzi.slice(viewStart, viewEnd),
    jigou: liangDataFull.jigou.slice(viewStart, viewEnd),
    zhuli: liangDataFull.zhuli.slice(viewStart, viewEnd),
  } : null;

  const allPrices = displayCandles.flatMap(c => [c.high, c.low]);
  const minLow = allPrices.length ? Math.min(...allPrices) * 0.999 : 0;
  const maxHigh = allPrices.length ? Math.max(...allPrices) * 1.001 : 0;
  const tickInterval = Math.floor((isFens ? minkRows.length : displayCandles.length) / 5);

  // 分时图Y轴范围
  const minkPrices = minkRows.flatMap(r => [r.high, r.low]).filter(Boolean);
  const minkMinY = minkPrices.length ? Math.min(...minkPrices) * 0.999 : 0;
  const minkMaxY = minkPrices.length ? Math.max(...minkPrices) * 1.001 : 0;

  const canPanLeft = safeOffset < maxOffset;
  const canPanRight = safeOffset > 0;

  return (
    <div className="flex flex-col h-full bg-[#0f1117] text-white/90">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-sm truncate">{stock.name}</span>
          <span className="text-[10px] text-white/40 shrink-0">{stock.code}</span>
          <Badge variant="outline" className="text-[10px] px-1 py-0 border-white/20 text-white/60 shrink-0">{stock.market}</Badge>
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1 py-0 shrink-0',
              stock.strength === '核心' ? 'border-primary/50 text-primary' :
              stock.strength === '一般' ? 'border-amber-500/50 text-amber-400' :
              'border-white/20 text-white/40')}
          >{stock.strength}</Badge>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {isListed && (
            <Button variant="ghost" size="icon" onClick={() => loadData(period)} className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10">
              <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {stock.desc && (
        <div className="px-3 py-1.5 text-[10px] text-white/40 border-b border-white/10 bg-white/3 shrink-0">
          {stock.desc}
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0">
        {!isListed ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-white/40">
            <span className="text-2xl">🔒</span>
            <span className="text-xs">该公司暂未上市，无行情数据</span>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-40 text-white/40 text-xs gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />加载中…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/40">
            <span className="text-xs text-red-400">{error}</span>
            <Button variant="outline" size="sm" onClick={() => loadData(period)} className="border-white/20 text-white/60 hover:bg-white/10">重试</Button>
          </div>
        ) : (
          <div className="px-2 py-2 space-y-2">
            {/* 基本行情 */}
            {info && (
              <div className="space-y-2">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: changeColor }}>
                    {fmt(info.last_px)}
                  </span>
                  <div className="flex items-center gap-1 pb-0.5" style={{ color: changeColor }}>
                    {info.px_change_rate > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : info.px_change_rate < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    <span className="text-xs font-medium">
                      {info.px_change > 0 ? '+' : ''}{fmt(info.px_change)} ({info.px_change_rate > 0 ? '+' : ''}{fmt(info.px_change_rate)}%)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[10px]">
                  {[
                    ['今开', fmt(info.open_px)], ['最高', fmt(info.high_px)], ['最低', fmt(info.low_px)],
                    ['昨收', fmt(info.preclose_px)], ['振幅', fmt(info.amplitude) + '%'], ['换手率', fmt(info.turnover_ratio) + '%'],
                    ['总市值', fmtWan(info.market_value)], ['PE', fmt(info.pe_rate)], ['PB', fmt(info.pb_rate)],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-white/40">{label}</span>
                      <span className="font-medium tabular-nums text-white/80">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 周期选择 + 时间轴平移 */}
            {(candles.length > 0 || minkRows.length > 0) && (
              <div className="flex items-center justify-between">
                {/* 周期按钮 */}
                <div className="flex gap-0.5">
                  {(Object.keys(PERIOD_CONFIG) as PeriodKey[]).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePeriodChange(p)}
                      className={cn(
                        'px-2 py-0.5 text-[10px] rounded transition-colors',
                        period === p
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
                      )}
                    >
                      {PERIOD_CONFIG[p].label}
                    </button>
                  ))}
                </div>
                {/* 时间轴平移（仅K线） */}
                {!isFens && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setViewOffset(o => Math.min(o + Math.floor(VIEW_SIZE / 2), maxOffset))}
                      disabled={!canPanLeft}
                      className={cn('p-0.5 rounded', canPanLeft ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed')}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] text-white/30 tabular-nums min-w-[60px] text-center">
                      {displayCandles[0]?.date}~{displayCandles[displayCandles.length - 1]?.date}
                    </span>
                    <button
                      onClick={() => setViewOffset(o => Math.max(o - Math.floor(VIEW_SIZE / 2), 0))}
                      disabled={!canPanRight}
                      className={cn('p-0.5 rounded', canPanRight ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed')}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── 分时图 ── */}
            {isFens && minkRows.length > 0 && (
              <div className="space-y-0">
                {/* 分时价格折线 */}
                <div>
                  <div className="text-[9px] text-white/30 px-1 mb-0.5">
                    分时 &nbsp;
                    <span style={{ color: '#facc15' }}>MA5</span>&nbsp;
                    <span style={{ color: '#c084fc' }}>MA10</span>&nbsp;
                    <span style={{ color: '#22d3ee' }}>MA30</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={minkRows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} height={0} />
                      <YAxis domain={[minkMinY, minkMaxY]} tick={{ fontSize: 9, fill: '#94a3b8' }} width={48} tickFormatter={(v: number) => v.toFixed(2)} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as MinkRow;
                          return (
                            <div className="bg-[#1a1f2e] border border-white/10 rounded p-1.5 text-[9px] shadow-xl space-y-0.5">
                              <div className="text-white/70">{d.date}</div>
                              <div className="text-white/90">收 {fmt(d.close)}</div>
                              <div style={{ color: d.changeRate >= 0 ? RISE : FALL }}>
                                {d.changeRate >= 0 ? '+' : ''}{d.changeRate}%
                              </div>
                              {d.ma5 != null && <div style={{ color: '#facc15' }}>MA5 {fmt(d.ma5)}</div>}
                              {d.ma10 != null && <div style={{ color: '#c084fc' }}>MA10 {fmt(d.ma10)}</div>}
                              {d.ma30 != null && <div style={{ color: '#22d3ee' }}>MA30 {fmt(d.ma30)}</div>}
                            </div>
                          );
                        }}
                      />
                      {/* 价格折线，颜色跟随涨跌 */}
                      <Line type="monotone" dataKey="close" stroke={RISE} dot={false} strokeWidth={1.5} isAnimationActive={false} />
                      {/* 均价线 */}
                      <Line type="monotone" dataKey="ma5" stroke="#facc15" dot={false} strokeWidth={1} connectNulls isAnimationActive={false} />
                      <Line type="monotone" dataKey="ma10" stroke="#c084fc" dot={false} strokeWidth={1} connectNulls isAnimationActive={false} />
                      <Line type="monotone" dataKey="ma30" stroke="#22d3ee" dot={false} strokeWidth={1} connectNulls isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* 分时成交量 */}
                <div>
                  <div className="text-[9px] text-white/30 px-1 mb-0.5">VOL</div>
                  <ResponsiveContainer width="100%" height={50}>
                    <ComposedChart data={minkRows} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={tickInterval} />
                      <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} width={48} tickFormatter={fmtWan} />
                      <Bar dataKey="volume" isAnimationActive={false}>
                        {minkRows.map((d, i) => <Cell key={i} fill={d.changeRate >= 0 ? RISE : FALL} opacity={0.75} />)}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── K线图表区域：K线 → VOL → MACD → SKDJ → 四量图 ── */}
            {!isFens && candles.length > 0 && (
              <div className="space-y-0">
                {/* 均线图例 */}
                <div className="flex items-center gap-2 px-1">
                  {MA_PERIODS.map((p, i) => (
                    <span key={p} className="text-[9px] flex items-center gap-0.5">
                      <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: MA_COLORS[i] }} />
                      <span style={{ color: MA_COLORS[i] }}>MA{p}</span>
                    </span>
                  ))}
                </div>

                {/* 蜡烛图 */}
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} height={0} />
                      <YAxis
                        domain={[minLow, maxHigh]}
                        tick={{ fontSize: 9, fill: '#94a3b8' }}
                        width={48}
                        tickFormatter={(v: number) => v.toFixed(2)}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-[#1a1f2e] border border-white/10 rounded p-2 text-[10px] space-y-0.5 shadow-xl">
                              <div className="font-semibold text-white/80">{d.date}</div>
                              <div className="grid grid-cols-2 gap-x-3">
                                <span className="text-white/40">开</span><span className="tabular-nums">{fmt(d.open)}</span>
                                <span className="text-white/40">高</span><span className="tabular-nums" style={{ color: RISE }}>{fmt(d.high)}</span>
                                <span className="text-white/40">低</span><span className="tabular-nums" style={{ color: FALL }}>{fmt(d.low)}</span>
                                <span className="text-white/40">收</span><span className="tabular-nums font-bold" style={{ color: d.isUp ? RISE : FALL }}>{fmt(d.close)}</span>
                                <span className="text-white/40">涨跌</span>
                                <span className="tabular-nums" style={{ color: d.changeRate >= 0 ? RISE : FALL }}>
                                  {d.changeRate >= 0 ? '+' : ''}{fmt(d.changeRate)}%
                                </span>
                              </div>
                              <div className="border-t border-white/10 pt-0.5 mt-0.5">
                                {MA_PERIODS.map((p, i) => d[`ma${p}`] != null && (
                                  <div key={p} style={{ color: MA_COLORS[i] }} className="text-[9px]">
                                    MA{p}: {fmt(d[`ma${p}`] as number)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="s1" stackId="k" fill="transparent" isAnimationActive={false} />
                      <Bar dataKey="s2" stackId="k" shape={<CandleWick />} isAnimationActive={false} />
                      <Bar dataKey="s3" stackId="k" shape={<CandleBody />} isAnimationActive={false}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.isUp ? RISE : FALL} />)}
                      </Bar>
                      <Bar dataKey="s4" stackId="k" shape={<CandleWick />} isAnimationActive={false} />
                      {MA_PERIODS.map((p, i) => (
                        <Line key={p} type="monotone" dataKey={`ma${p}`}
                          stroke={MA_COLORS[i]} dot={false} strokeWidth={1}
                          connectNulls isAnimationActive={false} />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* 成交量 */}
                <div>
                  <div className="text-[9px] text-white/30 px-1 mb-0.5">VOL  MA5</div>
                  <ResponsiveContainer width="100%" height={50}>
                    <ComposedChart data={chartData} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                      <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} height={0} />
                      <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} width={48} tickFormatter={fmtWan} />
                      <Bar dataKey="volume" isAnimationActive={false}>
                        {chartData.map((d, i) => <Cell key={i} fill={d.isUp ? RISE : FALL} opacity={0.75} />)}
                      </Bar>
                      <Line type="monotone" dataKey="vol5avg" stroke="#facc15" dot={false} strokeWidth={1} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* MACD */}
                <div>
                  <div className="text-[9px] text-white/40 px-1 mb-0.5">
                    MACD(12,26,9)
                    {chartData[chartData.length - 1]?.dif != null && (
                      <>&nbsp;
                        <span style={{ color: '#facc15' }}>DIF:{fmt(chartData[chartData.length-1].dif as number, 3)}</span>&nbsp;
                        <span style={{ color: '#c084fc' }}>DEA:{fmt(chartData[chartData.length-1].dea as number, 3)}</span>&nbsp;
                        <span style={{ color: (chartData[chartData.length-1].macd ?? 0) >= 0 ? RISE : FALL }}>
                          MACD:{fmt(chartData[chartData.length-1].macd as number, 3)}
                        </span>
                      </>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={110}>
                    <ComposedChart data={chartData} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} height={0} />
                      <YAxis tick={{ fontSize: 8, fill: '#94a3b8' }} width={48} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-[#1a1f2e] border border-white/10 rounded p-1 text-[9px] shadow-xl">
                              <div style={{ color: '#facc15' }}>DIF {fmt(d.dif, 3)}</div>
                              <div style={{ color: '#c084fc' }}>DEA {fmt(d.dea, 3)}</div>
                              <div style={{ color: (d.macd ?? 0) >= 0 ? RISE : FALL }}>MACD {fmt(d.macd, 3)}</div>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={0} stroke="rgba(148,163,184,0.3)" />
                      <Bar dataKey="macd" isAnimationActive={false}>
                        {chartData.map((d, i) => <Cell key={i} fill={(d.macd as number ?? 0) >= 0 ? RISE : FALL} opacity={0.85} />)}
                      </Bar>
                      <Line type="monotone" dataKey="dif" stroke="#facc15" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                      <Line type="monotone" dataKey="dea" stroke="#c084fc" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* SKDJ */}
                <div>
                  <div className="text-[9px] text-white/40 px-1 mb-0.5">
                    SKDJ(9,3)
                    {chartData[chartData.length - 1]?.K != null && (
                      <>&nbsp;
                        <span style={{ color: '#facc15' }}>K:{fmt(chartData[chartData.length-1].K as number)}</span>&nbsp;
                        <span style={{ color: '#c084fc' }}>D:{fmt(chartData[chartData.length-1].D as number)}</span>&nbsp;
                        <span style={{ color: '#22d3ee' }}>J:{fmt(chartData[chartData.length-1].J as number)}</span>
                      </>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={110}>
                    <ComposedChart data={chartData} margin={{ top: 2, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={tickInterval} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} width={48} ticks={[0, 20, 50, 80, 100]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="bg-[#1a1f2e] border border-white/10 rounded p-1 text-[9px] shadow-xl">
                              <div style={{ color: '#facc15' }}>K {fmt(d.K)}</div>
                              <div style={{ color: '#c084fc' }}>D {fmt(d.D)}</div>
                              <div style={{ color: '#22d3ee' }}>J {fmt(d.J)}</div>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={80} stroke={RISE} strokeDasharray="2 2" strokeOpacity={0.35} />
                      <ReferenceLine y={20} stroke={FALL} strokeDasharray="2 2" strokeOpacity={0.35} />
                      <Line type="monotone" dataKey="K" stroke="#facc15" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                      <Line type="monotone" dataKey="D" stroke="#c084fc" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                      <Line type="monotone" dataKey="J" stroke="#22d3ee" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* 四量图 */}
                <div className="border-t border-white/10 pt-2">
                  <div className="text-[10px] text-white/50 px-1 mb-1.5 font-medium">📊 最牛四量图</div>
                  <VolChart4 liangData={liangData ?? { sanhu: [], youzi: [], jigou: [], zhuli: [] }} />
                </div>
              </div>
            )}

            {/* 外部链接 */}
            {isListed && stock.market === 'A股' && (
              <div className="pb-1">
                <a
                  href={`https://xueqiu.com/S/${stock.code.replace('.SZ', '').replace('.SH', '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary"
                >
                  <ExternalLink className="h-2.5 w-2.5" />在雪球查看完整行情
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
