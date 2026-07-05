
ALTER TABLE events ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'eastmoney';
CREATE INDEX IF NOT EXISTS idx_events_platform ON events(platform);
COMMENT ON COLUMN events.platform IS '新闻来源平台：eastmoney/cls/ths/jin10/wallstreetcn';
