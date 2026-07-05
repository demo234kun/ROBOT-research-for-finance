# ROBOT-research-for-finance
# 机器人产业投研平台

> 面向机器人赛道的轻量级投研平台，整合产业链知识图谱、实时事件流、专业K线分析、深度研报四大模块，帮助投资者快速理解产业结构、把握市场情绪、跟踪重点个股。

![Version](https://img.shields.io/badge/version-v34-blue)
![Tech](https://img.shields.io/badge/React%20%2B%20Vite%20%2B%20TypeScript-3b82f6)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 项目简介

机器人产业投研平台（RobotResearch）是一个聚焦机器人赛道的研究工具，覆盖减速器、伺服、执行器、磁材、控制器、本体等核心产业链环节。平台通过可视化的产业链图谱、实时热点监控、技术指标分析（K线 / 分时 / MACD / SKDJ / 四量图）以及研报中心，帮助用户系统性地跟踪行业动态和重点A股表现。

---

## 核心功能

| 模块 | 说明 | 入口 |
|------|------|------|
| **产业链图谱** | 可视化展示机器人产业链上中下游结构，点击节点可展开重点个股与K线详情 | `/graph` |
| **实时监控** | 每日热点AI因果分析、产业链重点个股SKDJ/四量实时监控、AI当日投资建议 | `/monitor` |
| **研报中心** | 聚合机器人产业深度研报，支持按标签、机构、时间筛选与阅读 | `/reports` |
| **个股详情** | 完整K线图、分时图、MACD、SKDJ、四量图，支持日K/周K/月K/分时切换与时间轴平移 | 嵌入图谱与监控页 |

---

## 在线访问

- **平台入口**：https://app-csctj2dvhmo1.appmiaoda.com
- **源码仓库**：https://github.com/demo234kun/ROBOT-research-for-finance/edit/main/README.md

---

## 技术栈

- **前端**：React 18 + Vite 5 + TypeScript 5 + Tailwind CSS 3 + shadcn/ui
- **图表**：Recharts
- **后端/数据**：Supabase（Auth + PostgreSQL + Edge Functions）
- **AI 分析**：MiniMax 大模型（热点因果分析与每日策略生成）
- **行情数据**：股票实时行情查询 API（K线、分时、个股信息）

---

## 项目结构

```
robot-research-platform/
├── public/                  # 静态资源
├── src/
│   ├── components/          # UI 组件
│   │   ├── stock/           # 股票详情面板、K线图、指标图
│   │   └── ui/              # shadcn/ui 基础组件
│   ├── data/                # 产业链数据
│   ├── lib/                 # 工具函数与指标计算
│   ├── pages/               # 页面：图谱 / 监控 / 研报
│   ├── App.tsx              # 路由入口
│   └── main.tsx             # 应用挂载点
├── supabase/
│   └── functions/           # Edge Functions
│       ├── stock-info/      # 个股信息
│       ├── stock-kline/     # 日/周/月K线
│       ├── stock-mink/      # 分时K线
│       └── monitor-hotspot/ # 热点AI分析
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 架构图

![系统架构图](./docs/architecture.svg)

> 架构说明：前端通过 Supabase Edge Functions 统一调用后端能力；行情类接口直连实时数据源；AI 分析类接口经 Supabase Function 调用 MiniMax 大模型生成结构化结论。

---



## 数据声明

平台展示的行情数据、K线数据、分时数据均来自实时接口；热点分析与投资建议由 AI 基于公开信息生成，**仅供参考，不构成任何投资建议**。投资有风险，决策需谨慎。

---

## 联系我们

如有问题或合作意向，欢迎通过 GitHub Issues 留言。
