-- 事件流表
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  source text NOT NULL DEFAULT '东方财富',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 去重索引：同一URL不重复插入
CREATE UNIQUE INDEX idx_events_url ON public.events (url);

-- 按发布时间倒序索引
CREATE INDEX idx_events_published_at ON public.events (published_at DESC);

-- 启用 RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 所有人可读（无登录系统）
CREATE POLICY "events_select_anon" ON public.events FOR SELECT TO anon USING (true);
CREATE POLICY "events_select_auth" ON public.events FOR SELECT TO authenticated USING (true);

-- 仅 service_role 可写（通过 Edge Function）
CREATE POLICY "events_insert_service" ON public.events FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "events_update_service" ON public.events FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "events_delete_service" ON public.events FOR DELETE TO service_role USING (true);