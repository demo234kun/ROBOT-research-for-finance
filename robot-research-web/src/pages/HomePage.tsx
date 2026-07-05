import { Link } from 'react-router-dom';
import { Network, Newspaper, FileText, BookOpen, ArrowRight, Bot, TrendingUp, Zap, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { industryChain, flattenNodes } from '@/data/industryChain';
import { reports } from '@/data/reports';
import { glossary } from '@/data/glossary';

const HERO_BG = 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_d1a8b2fc-9723-41c6-8d57-acbe31189854.jpg';
const BANNER_BG = 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_29c2c966-1a4f-4abd-8c16-d775fa548f07.jpg';

const stats = [
  { num: '6+', label: '聚合平台' },
  { num: '50+', label: '过滤关键词' },
  { num: '3', label: '核心模块' },
  { num: '24h', label: '实时更新' },
];

const modules = [
  {
    title: '产业链知识图谱',
    desc: '按产品构成逻辑拆解上中下游，每个细分板块关联上市公司，可视化呈现产业全貌。',
    icon: Network,
    path: '/graph',
    stat: `${flattenNodes(industryChain).filter((n) => n.level === 2).length} 个细分板块`,
    img: 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_e901ee4d-739b-4606-8496-31bcade8da2f.jpg',
  },
  {
    title: '实时事件流',
    desc: '聚合财联社、东方财富、同花顺、金十等五大平台机器人资讯，按时间线实时展示。',
    icon: Newspaper,
    path: '/events',
    stat: '五大平台聚合',
    img: 'https://miaoda-site-img.cdn.bcebos.com/images/MiaoTu_71423719-f75f-46b8-9b4f-f9f231b14166.jpg',
  },
  {
    title: '深度研报重制',
    desc: '将机构研报重做为带术语注释、可视化图表、时间线的交互式网页，高效获取核心观点。',
    icon: FileText,
    path: '/reports',
    stat: `${reports.length} 篇精选研报`,
    img: 'https://miaoda-site-img.cdn.bcebos.com/images/MiaoTu_cf7de8ac-43b0-4fd9-b3a7-c2780a3f3c20.jpg',
  },
  {
    title: '术语库',
    desc: '内置机器人领域专业术语库，研报阅读时可点触查询，快速理解专业概念。',
    icon: BookOpen,
    path: '/glossary',
    stat: `${glossary.length}+ 条术语`,
    img: 'https://miaoda-site-img.cdn.bcebos.com/images/baidu_image_search_92b320e5-d0f3-47c2-85f5-cb3300fc4794.jpg',
  },
];

const features = [
  { icon: TrendingUp, text: '高密度信息呈现，快速获取核心数据' },
  { icon: Zap, text: '交互式图表与时间线，直观理解产业趋势' },
  { icon: Database, text: '产业链节点关联股票，一键定位投资标的' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* ── Hero Banner ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.65 }}
        className="relative overflow-hidden min-h-[380px] md:min-h-[460px] flex items-center"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* 深色遮罩偏左渐变，右侧略透明 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220_30%_8%/0.93)] via-[hsl(220_30%_10%/0.78)] to-[hsl(220_30%_10%/0.40)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220_30%_8%/0.50)] via-transparent to-transparent" />

        <div className="relative z-10 px-8 md:px-14 py-14 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
          >
            {/* 英文眉标 — learnbuffett 风格 */}
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-[hsl(var(--primary)/0.8)]" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[hsl(var(--primary))]">
                Robot Industry · Investment Research
              </span>
            </div>

            {/* 大标题 */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}>
              机器人产业链
              <span className="text-[hsl(var(--primary))]">投研平台</span>
            </h1>

            <p className="text-lg md:text-xl text-white/75 leading-relaxed max-w-xl mb-8">
              聚焦机器人赛道的轻量投研工具——产业链知识图谱可视化、
              多平台实时事件流、深度研报交互重制。
            </p>

            <div className="flex flex-wrap gap-2.5">
              {['产业链图谱', '实时事件流', '研报重制', '术语库'].map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-4 py-1.5 rounded-full border border-white/25 text-white/90 backdrop-blur-sm font-medium"
                  style={{ background: 'hsl(var(--primary) / 0.18)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── 数据统计行 — learnbuffett 风格 ────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="border-b border-border bg-card"
      >
        <div className="max-w-5xl mx-auto px-8 md:px-14">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`py-7 text-center ${i < stats.length - 1 ? 'border-r border-border' : ''}`}
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-1.5"
                  style={{ fontFamily: "'Noto Serif SC', Georgia, serif", color: 'hsl(var(--foreground))' }}
                >
                  {s.num}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="px-6 md:px-14 py-10 max-w-5xl mx-auto">
        {/* ── 核心模块 ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mb-6"
        >
          <div className="section-eyebrow mb-3">核心功能模块</div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">探索平台能力</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {modules.map((m, i) => (
            <motion.div
              key={m.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 * (i + 1) }}
              className="h-full"
            >
              <Link
                to={m.path}
                className="terminal-card block group hover:border-primary/50 transition-all duration-200 overflow-hidden h-full flex flex-col"
              >
                {m.img && (
                  <div className="relative h-36 overflow-hidden shrink-0">
                    <img
                      src={m.img}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 transition-colors group-hover:bg-primary/20"
                      style={{ background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.2)' }}
                    >
                      <m.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className="text-lg font-bold text-foreground group-hover:text-primary transition-colors"
                          style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}
                        >
                          {m.title}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed mb-4">{m.desc}</p>
                      <span
                        className="inline-block text-sm font-semibold px-3 py-1 rounded-full border"
                        style={{
                          color: 'hsl(var(--primary))',
                          background: 'hsl(var(--primary) / 0.08)',
                          borderColor: 'hsl(var(--primary) / 0.25)',
                        }}
                      >
                        {m.stat}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── 多平台 Banner ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="relative overflow-hidden rounded-2xl mb-10 min-h-[160px] flex items-center"
          style={{ border: '1px solid hsl(var(--primary) / 0.35)' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${BANNER_BG})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220_30%_8%/0.92)] to-[hsl(220_30%_8%/0.70)]" />
          <div className="relative z-10 px-8 py-7 flex flex-col md:flex-row md:items-center gap-6 w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="h-px w-6 bg-[hsl(var(--primary))]" />
                <span className="text-xs font-semibold tracking-widest uppercase text-[hsl(var(--primary))]">多平台聚合</span>
              </div>
              <h3
                className="text-xl font-bold text-white mb-1"
                style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}
              >
                六大平台实时数据聚合
              </h3>
              <p className="text-sm text-white/65">财联社 · 东方财富 · 同花顺 · 华尔街见闻 · 金十数据 · 雪球</p>
            </div>
            <div className="flex gap-10 shrink-0">
              {[{ num: '6+', label: '数据平台' }, { num: '24h', label: '实时更新' }, { num: '50+', label: '关键词' }].map((s) => (
                <div key={s.label} className="text-center">
                  <div
                    className="text-3xl font-bold mb-0.5"
                    style={{ fontFamily: "'Noto Serif SC', Georgia, serif", color: 'hsl(var(--primary))' }}
                  >
                    {s.num}
                  </div>
                  <div className="text-xs text-white/55">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 平台特性 ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.62 }}
          className="terminal-card p-7"
        >
          <div className="section-eyebrow mb-4">平台特性</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.text}
                className="flex items-start gap-4 p-5 rounded-xl border border-border/60"
                style={{ background: 'hsl(var(--muted) / 0.5)' }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                  style={{ background: 'hsl(var(--primary) / 0.10)', border: '1px solid hsl(var(--primary) / 0.2)' }}
                >
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-base text-foreground/80 leading-relaxed pt-0.5">{f.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-sm text-muted-foreground/45 text-center mt-10">
          © 2026 RobotResearch · 数据仅供参考，不构成任何投资建议
        </p>
      </div>
    </div>
  );
}
