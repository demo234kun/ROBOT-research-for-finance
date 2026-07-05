// 股票技术指标计算（共享工具）
// 供 StockDetailPanel 和 MonitorPage 复用

export interface CandleBar {
  date: string;
  open: number; close: number; high: number; low: number;
  volume: number;
  amount?: number;
  change?: number;
  changeRate?: number;
}

// 简单移动均线
export function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    return data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
  });
}

// 指数移动均线
export function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(data[0]); continue; }
    result.push(data[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

// SKDJ(9,3)
export function calcSKDJ(candles: CandleBar[], nPeriod = 9, mPeriod = 3) {
  const result: { K: number; D: number; J: number }[] = [];
  let prevK = 50, prevD = 50;
  for (let i = 0; i < candles.length; i++) {
    const start = Math.max(0, i - nPeriod + 1);
    const slice = candles.slice(start, i + 1);
    const lowest = Math.min(...slice.map(c => c.low));
    const highest = Math.max(...slice.map(c => c.high));
    const rsv = highest === lowest ? 50 : ((candles[i].close - lowest) / (highest - lowest)) * 100;
    const K = (prevK * (mPeriod - 1) + rsv) / mPeriod;
    const D = (prevD * (mPeriod - 1) + K) / mPeriod;
    const J = 3 * K - 2 * D;
    result.push({ K, D, J });
    prevK = K; prevD = D;
  }
  return result;
}

// MACD(12,26,9)
export function calcMACD(closes: number[]) {
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const dif = ema12.map((v, i) => v - ema26[i]);
  const dea = ema(dif, 9);
  const macd = dif.map((v, i) => (v - dea[i]) * 2);
  return { dif, dea, macd };
}

// 散户量能（通达信公式，权重20..1共20项 / 210）
export function calcSanhu(candles: CandleBar[]): (1 | -1)[] {
  const mids = candles.map(c => (3 * c.close + c.low + c.open + c.high) / 6);
  const bulls: (number | null)[] = mids.map((_, i) => {
    if (i < 19) return null;
    let sum = 0;
    for (let k = 0; k < 20; k++) sum += (20 - k) * mids[i - k];
    return sum / 210;
  });
  const bullArr = bulls.map(v => v ?? 0);
  const horses = sma(bullArr, 6);
  return candles.map((c, i) => {
    const bull = bulls[i];
    const horse = horses[i];
    if (bull == null || horse == null) return -1;
    return c.close > bull ? 1 : -1;
  });
}

export function calcYouzi(candles: CandleBar[]): (1 | -1)[] {
  const closes = candles.map(c => c.close);
  const ma60 = sma(closes, 60);
  const ma120 = sma(closes, 120);
  return candles.map((c, i) => {
    const a = ma60[i], b = ma120[i];
    if (a == null || b == null) return -1;
    return c.close >= Math.max(a, b) ? 1 : -1;
  });
}

export function calcJigou(candles: CandleBar[]): (1 | -1)[] {
  const closes = candles.map(c => c.close);
  const ma45 = sma(closes, 45);
  const ma90 = sma(closes, 90);
  return candles.map((c, i) => {
    const a = ma45[i], b = ma90[i];
    if (a == null || b == null) return -1;
    return c.close > Math.max(a, b) ? 1 : -1;
  });
}

export function calcZhuli(candles: CandleBar[]): (1 | -1)[] {
  const closes = candles.map(c => c.close);
  const ma30 = sma(closes, 30);
  const ma60 = sma(closes, 60);
  return candles.map((c, i) => {
    const a = ma30[i], b = ma60[i];
    if (a == null || b == null) return -1;
    return c.close > Math.max(a, b) ? 1 : -1;
  });
}

// 四量综合计算
export function calc4Liang(candles: CandleBar[]) {
  const sh = calcSanhu(candles);
  const yz = calcYouzi(candles);
  const jg = calcJigou(candles);
  const zl = calcZhuli(candles);
  return candles.map((_, i) => ({
    sanhu: sh[i] as 1 | -1,
    youzi: yz[i] as 1 | -1,
    jigou: jg[i] as 1 | -1,
    zhuli: zl[i] as 1 | -1,
  }));
}

// 检测四量最近变化（返回最新一根的信号和前一根对比）
export interface LiangSignal {
  name: '散户' | '游资' | '机构' | '主力';
  current: 1 | -1;
  prev: 1 | -1;
  changed: boolean; // 最新一根是否颜色翻转
}

export function detectLiangSignals(candles: CandleBar[]): LiangSignal[] {
  if (candles.length < 2) return [];
  const all = calc4Liang(candles);
  const last = all[all.length - 1];
  const prev = all[all.length - 2];
  return [
    { name: '散户', current: last.sanhu, prev: prev.sanhu, changed: last.sanhu !== prev.sanhu },
    { name: '游资', current: last.youzi, prev: prev.youzi, changed: last.youzi !== prev.youzi },
    { name: '机构', current: last.jigou, prev: prev.jigou, changed: last.jigou !== prev.jigou },
    { name: '主力', current: last.zhuli, prev: prev.zhuli, changed: last.zhuli !== prev.zhuli },
  ];
}

// SKDJ 信号判断
export type SKDJSignal = 'oversold_buy' | 'overbought_sell' | 'golden_cross' | 'death_cross' | 'normal';

export function detectSKDJSignal(skdj: { K: number; D: number; J: number }[]): SKDJSignal {
  if (skdj.length < 2) return 'normal';
  const last = skdj[skdj.length - 1];
  const prev = skdj[skdj.length - 2];

  // 超卖买点：K < 20 且 K 上穿 D
  if (last.K < 20 && last.K > last.D && prev.K <= prev.D) return 'oversold_buy';
  if (last.K < 25) return 'oversold_buy';

  // 超买卖点：K > 80 且 K 下穿 D
  if (last.K > 80 && last.K < last.D && prev.K >= prev.D) return 'overbought_sell';
  if (last.K > 75) return 'overbought_sell';

  // 金叉（非超卖区）
  if (last.K > last.D && prev.K <= prev.D) return 'golden_cross';

  // 死叉（非超买区）
  if (last.K < last.D && prev.K >= prev.D) return 'death_cross';

  return 'normal';
}

export const SIGNAL_CONFIG: Record<SKDJSignal, { label: string; color: string; bg: string; priority: number }> = {
  oversold_buy:    { label: '超卖买点', color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   priority: 1 },
  golden_cross:    { label: 'SKDJ金叉', color: '#facc15', bg: 'rgba(250,204,21,0.12)',  priority: 2 },
  overbought_sell: { label: '超买卖点', color: '#22d3ee', bg: 'rgba(34,211,238,0.15)',  priority: 3 },
  death_cross:     { label: 'SKDJ死叉', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', priority: 4 },
  normal:          { label: '正常',     color: '#64748b', bg: 'transparent',             priority: 5 },
};
