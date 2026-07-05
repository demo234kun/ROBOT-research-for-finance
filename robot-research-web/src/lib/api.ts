import { supabase } from '@/lib/supabase';
import type { Event, PaginatedEvents, Platform } from '@/types/types';

// 获取事件列表（分页 + 关键词 + 平台筛选）
export async function fetchEvents(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  platform?: Platform | 'all';
}): Promise<PaginatedEvents> {
  const { page, pageSize, keyword, platform } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (keyword && keyword.trim()) {
    query = query.ilike('title', `%${keyword.trim()}%`);
  }
  if (platform && platform !== 'all') {
    query = query.eq('platform', platform);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('fetchEvents error:', error);
    throw error;
  }

  return {
    data: Array.isArray(data) ? data : [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

// 触发事件抓取（调用 Edge Function）
export async function triggerFetchEvents(): Promise<{ success: boolean; message: string; platform_stats?: Record<string, number> }> {
  const { data, error } = await supabase.functions.invoke('fetch-events', {
    method: 'POST',
  });

  if (error) {
    const errorMsg = await error?.context?.text?.();
    console.error('triggerFetchEvents error:', errorMsg || error?.message);
    throw new Error(errorMsg || error?.message || '抓取失败');
  }

  return data as { success: boolean; message: string; platform_stats?: Record<string, number> };
}

// 手动触发单条事件 AI 分析
export async function analyzeEvent(eventId: string, title: string): Promise<void> {
  const { error } = await supabase.functions.invoke('analyze-event', {
    method: 'POST',
    body: { event_id: eventId, title },
  });
  if (error) {
    const errorMsg = await error?.context?.text?.();
    throw new Error(errorMsg || error?.message || '分析失败');
  }
}