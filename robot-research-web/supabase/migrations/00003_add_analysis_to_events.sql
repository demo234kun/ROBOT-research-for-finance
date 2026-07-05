
-- 给 events 表加 analysis 字段，存储 AI 分析结果
ALTER TABLE events ADD COLUMN IF NOT EXISTS analysis JSONB DEFAULT NULL;

-- 开启 Realtime 发布（UPDATE 事件推送 analysis 变化）
ALTER PUBLICATION supabase_realtime ADD TABLE events;
