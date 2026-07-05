// 数据库实体类型定义

export type Platform = 'eastmoney' | 'cls' | 'ths' | 'jin10' | 'wallstreetcn' | 'xueqiu';

export type EventSentiment = 'positive' | 'negative' | 'neutral';

export interface EventAnalysis {
  factors: string[];    // 驱动因素
  outcomes: string[];   // 预期结果
  sentiment: EventSentiment; // 利好/利空/中性
}

export interface Event {
  id: string;
  title: string;
  url: string;
  source: string;
  platform: Platform;
  published_at: string;
  created_at: string;
  analysis?: EventAnalysis | null; // AI 分析结果（可能尚未分析）
}

export interface PaginatedEvents {
  data: Event[];
  total: number;
  page: number;
  pageSize: number;
}