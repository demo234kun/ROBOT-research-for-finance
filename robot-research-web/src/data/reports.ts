// 机构研报 + 科研论文 Demo 数据

export interface ReportArgument {
  title: string;
  content: string;
  highlights: string[];
}

export interface ReportTable {
  title: string;
  headers: string[];
  rows: string[][];
  chartType: 'bar' | 'table';
}

export interface ReportMilestone {
  date: string;
  event: string;
}

export type ReportCategory = 'report' | 'research';

export interface Report {
  id: string;
  category: ReportCategory;
  title: string;
  institution: string;
  date: string;
  tags: string[];
  intro: string;
  /** 研报原文链接 */
  reportUrl?: string;
  /** 科研方向专属字段 */
  authors?: string[];
  venue?: string;
  paperUrl?: string;
  citationCount?: number;
  relatedNodes: string[];
  relatedStocks: { name: string; code: string }[];
  arguments: ReportArgument[];
  tables: ReportTable[];
  milestones: ReportMilestone[];
}

export const reports: Report[] = [
  /* ───── 研报解读 ───── */
  {
    id: 'rpt-001',
    category: 'report',
    title: '人形机器人量产元年：从技术突破到商业化落地',
    institution: '中信证券',
    date: '2026-06-15',
    tags: ['人形机器人', '量产', '特斯拉', 'Optimus'],
    intro: '2026年是人形机器人从实验室走向工厂的关键转折点，特斯拉Optimus Gen3实现小批量量产，国内厂商紧随其后，产业链投资机会从概念走向业绩兑现。',
    reportUrl: 'https://wap.eastmoney.com/report/AP202410231640429975.html',
    relatedNodes: ['humanoid', 'reducer', 'servo', 'end-effector'],
    relatedStocks: [
      { name: '特斯拉', code: 'TSLA' },
      { name: '优必选', code: '09880' },
      { name: '绿的谐波', code: '688017' },
      { name: '汇川技术', code: '300124' },
    ],
    arguments: [
      {
        title: '量产拐点已至',
        content: '特斯拉Optimus Gen3在2026年Q2实现单月产量突破5000台，预计全年产量达3-5万台。国内厂商如宇树科技、智元机器人也相继发布量产计划，标志着人形机器人正式进入产业化阶段。',
        highlights: ['5000台/月', '3-5万台/年', 'Q2量产'],
      },
      {
        title: 'BOM成本快速下降',
        content: '随着核心零部件国产化率提升，人形机器人BOM成本从2024年的约30万元/台下降至2026年的约15万元/台，预计2028年有望降至10万元以内。',
        highlights: ['30万→15万', '降本50%', '2028年<10万'],
      },
      {
        title: '应用场景逐步打开',
        content: '当前人形机器人主要应用于汽车工厂的搬运、装配等场景。随着具身智能技术进步，预计2027年将拓展至仓储物流、家庭服务等更广泛场景。',
        highlights: ['汽车工厂', '仓储物流', '家庭服务'],
      },
    ],
    tables: [
      {
        title: '人形机器人BOM成本拆解（2026年）',
        headers: ['零部件', '成本占比', '国产化率', '降本趋势'],
        rows: [
          ['减速器', '25%', '60%', '快速下降'],
          ['伺服电机', '20%', '70%', '稳步下降'],
          ['控制器', '15%', '50%', '缓慢下降'],
          ['传感器', '15%', '40%', '快速下降'],
          ['结构件', '10%', '90%', '基本稳定'],
          ['其他', '15%', '80%', '小幅下降'],
        ],
        chartType: 'bar',
      },
      {
        title: '主要厂商量产规划对比',
        headers: ['厂商', '2026年规划', '2027年目标', '核心优势'],
        rows: [
          ['特斯拉', '3-5万台', '20万台', 'AI算法+制造能力'],
          ['宇树科技', '1-2万台', '10万台', '运动控制+成本'],
          ['智元机器人', '0.5-1万台', '5万台', '具身智能+生态'],
          ['优必选', '0.3-0.5万台', '3万台', '商业化经验'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2021-08', event: '特斯拉发布Optimus概念' },
      { date: '2022-09', event: 'Optimus原型机亮相AI Day' },
      { date: '2023-12', event: 'Optimus Gen2发布，运动能力大幅提升' },
      { date: '2024-10', event: '"We, Robot"发布会，Optimus展示精细操作' },
      { date: '2025-06', event: 'Optimus进入特斯拉工厂试产线' },
      { date: '2026-03', event: 'Optimus Gen3发布，宣布正式量产' },
      { date: '2026-06', event: '单月产量突破5000台，量产元年开启' },
    ],
  },
  {
    id: 'rpt-002',
    category: 'report',
    title: '谐波减速器国产替代加速：从技术追赶到份额突破',
    institution: '华泰证券',
    date: '2026-05-20',
    tags: ['减速器', '谐波', '国产替代', '绿的谐波'],
    intro: '国产谐波减速器在精度、寿命等核心指标上已接近日本哈默纳科水平，凭借价格优势和服务响应速度，市场份额持续提升，国产替代进入加速期。',
    relatedNodes: ['reducer'],
    relatedStocks: [
      { name: '绿的谐波', code: '688017' },
      { name: '双环传动', code: '002472' },
      { name: '中大力德', code: '002896' },
    ],
    arguments: [
      {
        title: '技术差距大幅缩小',
        content: '国产谐波减速器传动精度已达30弧秒以内，与哈默纳科差距缩小至5%以内。',
        highlights: ['30弧秒', '差距<5%', '精度达标'],
      },
      {
        title: '市场份额持续提升',
        content: '2026年国产份额预计达65%，较2022年的35%大幅提升；绿的谐波市占率超30%。',
        highlights: ['65%市占率', '30%龙头', '翻倍增长'],
      },
      {
        title: '人形机器人打开增量空间',
        content: '人形机器人单台需要14-40个减速器，远超传统工业机器人的6个，增量市场超20亿元。',
        highlights: ['14-40个/台', '20亿增量', '10倍于工业'],
      },
    ],
    tables: [
      {
        title: '国产vs进口谐波减速器对比',
        headers: ['指标', '哈默纳科', '绿的谐波', '差距'],
        rows: [
          ['传动精度', '25弧秒', '30弧秒', '5弧秒'],
          ['寿命', '10000小时', '8000小时', '20%'],
          ['价格', '5000元', '2500元', '低50%'],
          ['交货周期', '3-6月', '1-2月', '快60%'],
        ],
        chartType: 'table',
      },
      {
        title: '国产谐波减速器市场份额变化',
        headers: ['年份', '国产份额', '进口份额', '国产龙头市占率'],
        rows: [
          ['2022', '35%', '65%', '15%'],
          ['2023', '45%', '55%', '20%'],
          ['2024', '52%', '48%', '25%'],
          ['2025', '58%', '42%', '28%'],
          ['2026E', '65%', '35%', '32%'],
        ],
        chartType: 'bar',
      },
    ],
    milestones: [
      { date: '2018', event: '绿的谐波打破国外垄断，实现谐波减速器国产化' },
      { date: '2020', event: '国产精度突破50弧秒大关' },
      { date: '2022', event: '国产份额突破35%' },
      { date: '2024', event: '精度提升至30弧秒' },
      { date: '2026', event: '国产份额预计达65%，龙头市占率超30%' },
    ],
  },
  {
    id: 'rpt-003',
    category: 'report',
    title: '具身智能：AI大模型赋能机器人，开启通用智能时代',
    institution: '国泰君安',
    date: '2026-04-10',
    tags: ['具身智能', '大模型', 'VLA', 'AI'],
    intro: '大语言模型与机器人技术的深度融合正在催生具身智能革命，VLA模型使机器人从专用工具向通用智能体演进，有望重塑整个机器人产业格局。',
    relatedNodes: ['humanoid', 'controller', 'sensor'],
    relatedStocks: [
      { name: '特斯拉', code: 'TSLA' },
      { name: '英伟达', code: 'NVDA' },
    ],
    arguments: [
      {
        title: 'VLA模型突破认知瓶颈',
        content: 'Vision-Language-Action模型将视觉感知、语言理解和动作执行统一在单一框架内，泛化能力显著提升。',
        highlights: ['VLA统一框架', '自然语言交互', '泛化能力'],
      },
      {
        title: 'Sim2Real加速训练',
        content: '在虚拟仿真环境中大规模训练再迁移真实世界，训练效率提升100倍以上，大幅降低数据采集成本。',
        highlights: ['100倍效率', 'Sim2Real', '降低成本'],
      },
      {
        title: '算力需求爆发',
        content: '单台人形机器人推理算力需求约100 TOPS，训练阶段需要千卡级GPU集群，带动AI芯片需求。',
        highlights: ['100 TOPS', '千卡集群', '算力爆发'],
      },
    ],
    tables: [
      {
        title: '具身智能技术路线对比',
        headers: ['路线', '代表企业', '优势', '挑战'],
        rows: [
          ['端到端VLA', '特斯拉/英伟达', '泛化能力强', '训练数据需求大'],
          ['分层架构', 'Figure/智元', '模块化易调试', '系统集成复杂'],
          ['模仿学习', 'Google RT', '快速部署', '泛化能力有限'],
          ['强化学习', 'OpenAI', '探索能力强', '训练不稳定'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2022-10', event: 'Google发布RT-1，首次实现视觉-语言-动作统一' },
      { date: '2023-07', event: 'Google发布RT-X，跨机器人平台泛化突破' },
      { date: '2024-03', event: 'Figure展示接入OpenAI大模型的人形机器人' },
      { date: '2025-01', event: '英伟达发布GR00T人形机器人基础模型' },
      { date: '2026-02', event: 'Optimus展示基于端到端VLA的自主操作能力' },
    ],
  },
  {
    id: 'rpt-004',
    category: 'report',
    title: '机器人上游材料：轻量化新材料带来的投资机会',
    institution: '招商证券',
    date: '2026-03-18',
    tags: ['新材料', '碳纤维', '轻量化', '结构件'],
    intro: '人形机器人对轻量化、高强度结构材料提出更高要求，碳纤维复合材料、钛合金等新材料将迎来放量窗口期，相关产业链企业具备较大成长空间。',
    relatedNodes: ['end-effector', 'actuator'],
    relatedStocks: [
      { name: '光威复材', code: '300699' },
      { name: '中简科技', code: '300777' },
      { name: '宝钛股份', code: '600456' },
    ],
    arguments: [
      {
        title: '碳纤维用量显著提升',
        content: '人形机器人骨架大量采用碳纤维复合材料，单台用量约5-8kg，比同体积铝合金减重40%以上，提升续航与运动效率。',
        highlights: ['5-8kg/台', '减重40%', '运动效率提升'],
      },
      {
        title: '钛合金关节部件放量',
        content: '髋关节、肩关节等高负载部位大量采用航空级钛合金，2026年人形机器人用钛合金市场规模预计超5亿元。',
        highlights: ['航空级钛合金', '5亿市场', '高负载部件'],
      },
    ],
    tables: [
      {
        title: '主流结构材料对比',
        headers: ['材料', '密度(g/cm³)', '强度(MPa)', '成本指数', '机器人适用性'],
        rows: [
          ['碳纤维复合材料', '1.6', '3500', '高', '★★★★★'],
          ['钛合金', '4.5', '900', '较高', '★★★★☆'],
          ['铝合金', '2.7', '400', '低', '★★★☆☆'],
          ['普通钢材', '7.8', '500', '极低', '★★☆☆☆'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2024', event: '特斯拉Optimus首次披露大面积采用碳纤维骨架' },
      { date: '2025', event: '国内碳纤维T800级产品实现量产' },
      { date: '2026', event: '人形机器人碳纤维年用量突破千吨级' },
    ],
  },
  {
    id: 'rpt-005',
    category: 'report',
    title: '丝杠赛道深度：人形机器人打开星辰大海，国产替代加速',
    institution: '东吴证券',
    date: '2024-10-22',
    tags: ['丝杠', '滚珠丝杠', '行星滚柱丝杠', '国产替代'],
    intro: '行星滚柱丝杠是人形机器人线性驱动核心零件，单台用量12-14根，较传统工业远高，国产厂商正加速突破精密制造壁垒，贝斯特、恒立液压等龙头迎来历史性机遇。',
    reportUrl: 'https://wap.eastmoney.com/report/AP202410231640429975.html',
    relatedNodes: ['actuator', 'reducer'],
    relatedStocks: [
      { name: '贝斯特', code: '300580' },
      { name: '恒立液压', code: '601100' },
      { name: '五洲新春', code: '603667' },
      { name: '鼎智科技', code: '873593' },
    ],
    arguments: [
      {
        title: '行星滚柱丝杠是核心增量市场',
        content: '人形机器人膝关节、踝关节等线性驱动单元采用行星滚柱丝杠，单台用量12-14根，是工业机械臂的2-4倍。按2025年全球5万台出货量测算，市场空间约30亿元，2027年有望超百亿。',
        highlights: ['12-14根/台', '2027年百亿市场', '核心驱动部件'],
      },
      {
        title: '国产厂商突破欧洲垄断',
        content: '行星滚柱丝杠精度要求极高，此前长期被Rollvis、SKF等欧洲企业垄断。贝斯特、鼎智科技等已完成样品验证并进入Optimus、宇树等厂商供应链，国产替代加速推进。',
        highlights: ['贝斯特量产', '进入特斯拉供应链', '欧洲垄断打破'],
      },
    ],
    tables: [
      {
        title: '国内丝杠厂商竞争格局',
        headers: ['厂商', '主营产品', '进展', '下游客户'],
        rows: [
          ['贝斯特', '行星滚柱丝杠', '批量交货', 'Optimus/宇树'],
          ['五洲新春', '滚珠丝杠', '定点供货', '国内头部厂商'],
          ['恒立液压', '液压+丝杠', '研发阶段', '多家机器人企业'],
          ['鼎智科技', '微型滚柱丝杠', '样品验证', '智元/宇树'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2023-06', event: '特斯拉披露Optimus采用行星滚柱丝杠方案' },
      { date: '2024-03', event: '贝斯特完成丝杠量产线建设' },
      { date: '2024-10', event: '东吴证券发布丝杠赛道深度报告' },
      { date: '2025-06', event: '国内丝杠年产能预计突破50万套' },
    ],
  },
  {
    id: 'rpt-006',
    category: 'report',
    title: '灵巧手专题报告：五指操控解锁人形机器人商业化瓶颈',
    institution: '天风证券',
    date: '2024-09-05',
    tags: ['灵巧手', '末端执行器', '触觉传感', '因时机器人'],
    intro: '灵巧手是人形机器人商业化落地的核心卡点，五指灵巧手技术复杂度高、触觉感知难度大，国内因时机器人、灵心巧手等初创企业已实现商业化突破，行业进入快速成长期。',
    relatedNodes: ['end-effector', 'sensor'],
    relatedStocks: [
      { name: '兆威机电', code: '003021' },
      { name: '鸣志电器', code: '603728' },
      { name: '柯力传感', code: '603662' },
    ],
    arguments: [
      {
        title: '灵巧手是商业化关键卡点',
        content: '工业夹爪操作精度有限，无法完成精密装配、生活服务等场景任务，五指灵巧手是人形机器人从"搬运工"升级为"多面手"的核心组件。',
        highlights: ['五指结构', '精密装配场景', '关键卡点'],
      },
      {
        title: '触觉传感是技术难点',
        content: '灵巧手抓握需要实时感知接触力、滑动等信息，高精度柔性触觉传感器是核心技术难题，国内因时机器人等已有突破性进展。',
        highlights: ['柔性触觉传感', '接触力感知', '实时反馈'],
      },
    ],
    tables: [
      {
        title: '灵巧手技术路线对比',
        headers: ['方案', '自由度', '承重', '成本', '代表企业'],
        rows: [
          ['欠驱动灵巧手', '5-10', '3-5kg', '低', '宇树/智元'],
          ['全驱动灵巧手', '15-20', '5-8kg', '高', '因时/灵心巧手'],
          ['刚柔混合', '12-15', '4-6kg', '中', 'Figure/Shadow'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2023-01', event: '因时机器人发布RH56DFX灵巧手，实现商业化量产' },
      { date: '2024-05', event: '宇树机器人Dex3-1灵巧手发布，支持100Hz实时控制' },
      { date: '2024-09', event: '天风证券发布灵巧手专题研报' },
      { date: '2025-03', event: '多家人形机器人厂商宣布将灵巧手列为标配' },
    ],
  },
  {
    id: 'rpt-007',
    category: 'report',
    title: '人形机器人传感器全景：感知层是下一个万亿级赛道',
    institution: '国信证券',
    date: '2024-11-18',
    tags: ['传感器', '视觉', '触觉', '力控', '感知'],
    intro: '感知系统是机器人与外界交互的核心接口，涵盖视觉、力觉、触觉、本体感知四大维度。随着人形机器人规模化落地，传感器需求爆发，国内供应链有望实现批量突破。',
    reportUrl: 'https://www.guosen.com.cn/webd/public/infoDetail.jsp?infoid=171201855',
    relatedNodes: ['sensor', 'controller', 'humanoid'],
    relatedStocks: [
      { name: '奥比中光', code: '688322' },
      { name: '睿联技术', code: '301168' },
      { name: '汉威科技', code: '300007' },
      { name: '柯力传感', code: '603662' },
    ],
    arguments: [
      {
        title: '单台传感器价值量超3万元',
        content: '人形机器人搭载深度相机（2-4个）、IMU、力传感器（6-12个）、触觉传感器等，单台传感器BOM价值约3-5万元，预计2026年全球需求市场超100亿元。',
        highlights: ['3-5万元/台', '100亿元市场', '多品类并行'],
      },
      {
        title: '力控传感器是核心增量',
        content: '六维力传感器用于机器人关节力矩感知，单台用量6-12个，国内坤维科技、蓝点触控等已进入头部机器人厂商供应链，价值量大、技术门槛高。',
        highlights: ['六维力传感器', '6-12个/台', '高技术壁垒'],
      },
    ],
    tables: [
      {
        title: '人形机器人传感器需求清单',
        headers: ['类型', '单台用量', '单价(元)', '国产化率'],
        rows: [
          ['深度相机/视觉', '2-4个', '800-3000', '70%'],
          ['六维力传感器', '6-12个', '3000-8000', '40%'],
          ['IMU惯性单元', '1-2个', '200-500', '80%'],
          ['触觉传感器', '200-500点', '5000-15000', '20%'],
          ['编码器', '20-40个', '50-200', '85%'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2023-09', event: '坤维科技六维力传感器进入宇树供应链' },
      { date: '2024-06', event: '奥比中光发布专为机器人设计MX6000深度相机' },
      { date: '2024-11', event: '国信证券发布传感器全景报告' },
      { date: '2025-06', event: '国内触觉传感芯片实现从0到1突破' },
    ],
  },

  /* ───── 科研论文 ───── */
  {
    id: 'res-001',
    category: 'research',
    title: 'Humanoid Locomotion as Next Token Prediction',
    institution: 'UC Berkeley',
    date: '2024-08-12',
    tags: ['人形机器人', '运动控制', '大模型', 'Transformer'],
    authors: ['Ilija Radosavovic', 'Bike Zhang', 'Baifeng Shi', 'Jathushan Rajasegaran', 'Sarthak Kamat', 'Trevor Darrell', 'Koushil Sreenath', 'Jitendra Malik'],
    venue: 'arXiv preprint',
    paperUrl: 'https://arxiv.org/abs/2402.19469',
    citationCount: 412,
    intro: '将人形机器人运动控制建模为自回归序列预测任务，用类GPT的Transformer架构预测下一时刻的动作token，在真实机器人上实现了鲁棒的全身运动控制，无需精心设计的奖励函数。',
    relatedNodes: ['humanoid', 'controller'],
    relatedStocks: [],
    arguments: [
      {
        title: '运动控制即语言建模',
        content: '将机器人状态-动作序列看作"语言"，用下一token预测范式训练，模型能够从大量运动学数据中学到通用的运动先验。',
        highlights: ['自回归预测', '无奖励函数', 'Transformer架构'],
      },
      {
        title: '真实环境泛化',
        content: '在Digit双足机器人上零样本部署，成功在复杂地形（上下楼梯、斜坡、不平整路面）中稳定行走，泛化能力大幅超越传统RL方法。',
        highlights: ['零样本部署', '复杂地形', '双足稳定'],
      },
    ],
    tables: [],
    milestones: [
      { date: '2024-02', event: '论文挂出arXiv，引发学界广泛关注' },
      { date: '2024-08', event: '扩展版发布，补充更多真实机器人实验' },
      { date: '2025-01', event: '方法被多家机器人公司引用并改进' },
    ],
  },
  {
    id: 'res-002',
    category: 'research',
    title: 'RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control',
    institution: 'Google DeepMind',
    date: '2023-07-28',
    tags: ['VLA', '视觉语言模型', '机器人控制', '迁移学习'],
    authors: ['Anthony Brohan', 'Noah Brown', 'Justice Carbajal', 'Yevgen Chebotar', 'Xi Chen'],
    venue: 'Conference on Robot Learning (CoRL) 2023',
    paperUrl: 'https://arxiv.org/abs/2307.15818',
    citationCount: 1840,
    intro: 'RT-2将大规模视觉语言模型（VLM）直接微调用于机器人操作，把网络知识迁移到机器人控制，使机器人能够通过自然语言指令完成未见过的任务，是VLA路线的里程碑工作。',
    relatedNodes: ['humanoid', 'controller', 'sensor'],
    relatedStocks: [{ name: 'Alphabet', code: 'GOOGL' }],
    arguments: [
      {
        title: 'Web知识迁移到机器人',
        content: '利用PaLI-X和PaLM-E作为骨干，将动作序列编码为文本token，网络上学到的常识知识（物理规律、物体属性）可直接应用于机器人决策。',
        highlights: ['网络知识迁移', '动作as文本', '常识推理'],
      },
      {
        title: '涌现能力',
        content: 'RT-2展示出传统方法不具备的涌现能力：将废弃物扔进垃圾桶（新任务组合）、按颜色匹配饮料到国旗等跨域推理任务。',
        highlights: ['涌现能力', '跨域推理', '新任务泛化'],
      },
    ],
    tables: [
      {
        title: 'RT-2 vs RT-1 任务成功率对比',
        headers: ['任务类型', 'RT-1', 'RT-2 (PaLI-X)', '提升'],
        rows: [
          ['已见任务', '82%', '90%', '+8%'],
          ['未见任务', '32%', '62%', '+30%'],
          ['推理任务', '8%', '55%', '+47%'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2022-12', event: 'RT-1发布，奠定大规模机器人数据训练基础' },
      { date: '2023-07', event: 'RT-2发布，VLA路线正式确立' },
      { date: '2023-11', event: 'RT-2在CoRL 2023获最佳论文提名' },
      { date: '2024-03', event: 'Open X-Embodiment数据集发布，与RT-2协同' },
    ],
  },
  {
    id: 'res-003',
    category: 'research',
    title: 'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware',
    institution: 'Stanford University',
    date: '2023-04-26',
    tags: ['双臂操作', '模仿学习', '低成本硬件', 'ACT'],
    authors: ['Tony Z. Zhao', 'Vikash Kumar', 'Sergey Levine', 'Chelsea Finn'],
    venue: 'NeurIPS 2023',
    paperUrl: 'https://arxiv.org/abs/2304.13705',
    citationCount: 980,
    intro: '提出 Action Chunking with Transformers (ACT)，用低成本双臂硬件完成精细操作任务。通过将动作序列"分块"预测，显著降低模仿学习的复合误差，在插充电线、折衣服等高精度任务上达到 80%+ 成功率。',
    relatedNodes: ['end-effector'],
    relatedStocks: [],
    arguments: [
      {
        title: 'Action Chunking 降低复合误差',
        content: '传统单步动作预测会累积误差，ACT 一次预测 k 步动作块，通过时序集成平滑执行，将复合误差降低至近乎零，在精细任务中成功率提升 3-4 倍。',
        highlights: ['k 步动作块', '时序集成', '误差降低'],
      },
      {
        title: '低成本硬件验证',
        content: '使用两台低成本 WidowX 机械臂（总成本约 2 万元人民币）即可完成充电线插拔等极精细任务，大幅降低了灵巧操作研究的门槛。',
        highlights: ['低成本双臂', '充电线插拔', '实用性强'],
      },
    ],
    tables: [
      {
        title: 'ACT vs 基线方法成功率',
        headers: ['任务', 'ACT', 'BC-Transformer', 'GAIL'],
        rows: [
          ['插充电线', '83%', '14%', '0%'],
          ['叠衣服', '62%', '33%', '0%'],
          ['传递方块', '94%', '72%', '43%'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2023-04', event: '论文发布 arXiv，Low-Cost Arm 硬件开源' },
      { date: '2023-12', event: 'NeurIPS 2023 发表，引发双臂操作研究热潮' },
      { date: '2024-02', event: 'Mobile ALOHA 基于 ACT 实现移动双臂操作' },
      { date: '2024-06', event: 'ACT+ 改进版发布，支持更长任务序列' },
    ],
  },
  {
    id: 'res-004',
    category: 'research',
    title: '3D Diffusion Policy: Generalizable Visuomotor Policy Learning via Simple 3D Representations',
    institution: 'Shanghai AI Lab / Tsinghua University',
    date: '2024-03-06',
    tags: ['3D表示', '扩散策略', '操作', '点云'],
    authors: ['Yanjie Ze', 'Gu Zhang', 'Kangning Zhang', 'Chenyuan Hu', 'Muhan Wang', 'Huazhe Xu'],
    venue: 'RSS 2024',
    paperUrl: 'https://arxiv.org/abs/2403.03954',
    citationCount: 310,
    intro: '提出 DP3（3D Diffusion Policy），用极简的 3D 点云表示替代 RGB 图像，与扩散策略结合，在跨光照、跨背景、跨相机位置的操作任务中实现强泛化能力，参数量仅为视觉扩散策略的 1/4。',
    relatedNodes: ['controller', 'sensor', 'end-effector'],
    relatedStocks: [],
    arguments: [
      {
        title: '3D 点云天然具备视角不变性',
        content: '相比 RGB 图像，3D 点云对光照、背景和相机位置变化天然鲁棒，DP3 在新视角下成功率比基于图像的扩散策略高 30% 以上。',
        highlights: ['视角不变性', '光照鲁棒', '泛化+30%'],
      },
      {
        title: '轻量高效，适合边端部署',
        content: '仅需约 200 万点云参数即可编码完整场景，网络参数量仅 10M，推理延迟 80ms，非常适合搭载算力有限的机器人本体。',
        highlights: ['10M参数', '80ms推理', '边端友好'],
      },
    ],
    tables: [
      {
        title: 'DP3 vs 基线方法成功率对比',
        headers: ['方法', '已见场景', '新视角', '新背景', '平均'],
        rows: [
          ['BC-RGB', '72%', '31%', '28%', '44%'],
          ['Diffusion Policy', '82%', '45%', '40%', '56%'],
          ['DP3 (Ours)', '91%', '76%', '73%', '80%'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2024-03', event: '论文发布 arXiv，代码开源' },
      { date: '2024-06', event: 'RSS 2024 Oral Presentation' },
      { date: '2024-09', event: 'GitHub Star 突破 1500，广泛被后续工作引用' },
      { date: '2025-01', event: '国内多家机器人企业将 DP3 列为操作策略基线' },
    ],
  },
  {
    id: 'res-005',
    category: 'research',
    title: '基于深度强化学习的仿人机器人全身运动规划综述',
    institution: '清华大学交叉信息研究院',
    date: '2025-09-01',
    tags: ['综述', '强化学习', '全身运动', '仿人机器人'],
    authors: ['李明宇', '张鹤', '王志远', '陈晓峰'],
    venue: '机器人学报 2025',
    citationCount: 67,
    intro: '系统综述近五年深度强化学习在仿人机器人全身运动规划领域的研究进展，涵盖运动基元学习、层次化策略、多任务泛化三大方向，并展望未来与大模型融合的研究路径。',
    relatedNodes: ['humanoid', 'controller'],
    relatedStocks: [],
    arguments: [
      {
        title: '运动基元学习成为主流',
        content: '基于运动基元（motion primitive）的层次强化学习成为2023-2025年主流方向，低层控制器负责执行基元动作，高层策略负责组合，显著提升复杂任务的学习效率。',
        highlights: ['运动基元', '层次RL', '复杂任务'],
      },
      {
        title: '与大模型融合是趋势',
        content: '将大语言模型作为高层规划器，RL控制器作为低层执行器的"大脑-小脑"架构成为2025年热点，语义理解与物理执行能力互补。',
        highlights: ['LLM高层规划', '大脑-小脑架构', '2025年热点'],
      },
    ],
    tables: [],
    milestones: [
      { date: '2020', event: 'DeepMimic提出基于运动捕捉数据的仿物理RL基础框架' },
      { date: '2022', event: 'AMP方法将对抗训练引入运动风格学习' },
      { date: '2023', event: 'VLA方向兴起，全身运动与操作融合受到关注' },
      { date: '2025', event: '本综述发布，系统梳理五年进展' },
    ],
  },
  {
    id: 'res-006',
    category: 'research',
    title: 'π0: A Vision-Language-Action Flow Model for General Robot Control',
    institution: 'Physical Intelligence (π)',
    date: '2024-10-31',
    tags: ['VLA', '扩散策略', '通用控制', '灵巧操作'],
    authors: ['Kevin Black', 'Noah Brown', 'Danny Driess', 'Adnan Esmail', 'Michael Equi', 'Chelsea Finn', 'Niccolo Fusai', 'Lachy Groom', 'Karol Hausman', 'Brian Ichter'],
    venue: 'arXiv preprint',
    paperUrl: 'https://arxiv.org/abs/2410.24164',
    citationCount: 680,
    intro: 'Physical Intelligence提出π0，将预训练视觉语言模型与流匹配动作生成结合，实现跨机器人、跨任务的通用策略，在叠衣服、整理桌面等复杂灵巧任务上显著超越prior work。',
    relatedNodes: ['humanoid', 'end-effector', 'controller'],
    relatedStocks: [],
    arguments: [
      {
        title: 'VLM预训练赋予通用理解',
        content: '基于PaliGemma视觉语言模型初始化，通过大规模异构机器人数据微调，π0具备强大的跨场景语义理解能力和零样本指令跟随能力。',
        highlights: ['PaliGemma骨干', '异构数据训练', '零样本跟随'],
      },
      {
        title: '流匹配生成高频连续动作',
        content: '采用Flow Matching替代传统回归动作头，能够建模多模态动作分布、生成高频连续平滑动作序列，在折叠衣物等需要细腻力控的任务中表现突出。',
        highlights: ['Flow Matching', '多模态动作分布', '高频平滑动作'],
      },
    ],
    tables: [
      {
        title: 'π0 vs 基线任务成功率',
        headers: ['任务', 'π0', 'Diffusion Policy', 'ACT'],
        rows: [
          ['折叠衬衫', '68%', '21%', '18%'],
          ['装袋打包', '74%', '35%', '28%'],
          ['整理餐桌', '61%', '19%', '12%'],
          ['拼装积木', '82%', '54%', '49%'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2024-03', event: 'Physical Intelligence成立，Chelsea Finn等顶尖学者加入' },
      { date: '2024-10', event: 'π0论文发布arXiv，引发行业广泛关注' },
      { date: '2024-11', event: 'π0演示视频发布，展示跨机器人通用操作能力' },
      { date: '2025-03', event: 'π0.5发布，扩展到更多真实家庭场景' },
    ],
  },
  {
    id: 'res-007',
    category: 'research',
    title: 'HumanPlus: Humanoid Shadowing and Imitation from Humans',
    institution: 'Stanford University',
    date: '2024-06-20',
    tags: ['人形机器人', '模仿学习', '影随控制', '全身操作'],
    authors: ['Zipeng Fu', 'Qingqing Zhao', 'Qi Wu', 'Gordon Wetzstein', 'Chelsea Finn'],
    venue: 'CoRL 2024',
    paperUrl: 'https://arxiv.org/abs/2406.10454',
    citationCount: 310,
    intro: '提出HumanPlus框架，让人形机器人实时"影随"人体动作，通过人类遥操作采集数据再结合模仿学习训练策略，在乒乓球、钢琴演奏、折纸等高难度全身操作任务上实现突破。',
    relatedNodes: ['humanoid', 'end-effector'],
    relatedStocks: [],
    arguments: [
      {
        title: '影随人类实现高效数据采集',
        content: '利用单目相机实时估计人体姿态，直接映射到机器人全身关节，操作者穿普通衣服即可完成遥操作数据采集，数据采集效率比传统手柄提升5倍以上。',
        highlights: ['单目相机姿态估计', '5倍数据效率', '低门槛遥操作'],
      },
      {
        title: '全身模仿学习实现复杂操作',
        content: '基于采集的全身示范数据训练Transformer策略，在1-5小时数据量下实现乒乓球连续对打、钢琴弹奏、折纸等需要全身协调的精细操作。',
        highlights: ['1-5小时数据', '全身协调', '乒乓/钢琴'],
      },
    ],
    tables: [],
    milestones: [
      { date: '2024-04', event: 'HumanPlus项目启动，Unitree H1机器人作为平台' },
      { date: '2024-06', event: '论文提交CoRL 2024并挂出arXiv' },
      { date: '2024-11', event: 'CoRL 2024 Best Paper Finalist' },
      { date: '2025-01', event: '开源代码发布，多个团队基于此框架扩展' },
    ],
  },
  {
    id: 'res-008',
    category: 'research',
    title: 'OpenVLA: An Open-Source Vision-Language-Action Model',
    institution: 'Stanford / UC Berkeley / Toyota Research',
    date: '2024-06-13',
    tags: ['VLA', '开源', '视觉语言', '机器人操作'],
    authors: ['Moo Jin Kim', 'Karl Pertsch', 'Siddharth Karamcheti', 'Ted Xiao', 'Ashwin Balakrishna', 'Suraj Nair', 'Rafael Rafailov', 'Ethan Foster', 'Grace Lam', 'Pannag Sanketi'],
    venue: 'CoRL 2024',
    paperUrl: 'https://arxiv.org/abs/2406.09246',
    citationCount: 520,
    intro: '首个完全开源的视觉语言动作模型，基于Prismatic-7B VLM在Open X-Embodiment数据集上训练，在BridgeV2等标准基准上超越RT-2-X，同时提供完整代码、权重和训练流程。',
    relatedNodes: ['controller', 'humanoid'],
    relatedStocks: [{ name: 'Toyota', code: 'TM' }],
    arguments: [
      {
        title: '开源推动行业标准化',
        content: 'OpenVLA提供完整的模型权重、训练代码和评测脚本，使学术界和中小企业能够在不依赖闭源API的情况下研究VLA技术，大幅降低研究门槛。',
        highlights: ['完全开源', '权重公开', '降低研究门槛'],
      },
      {
        title: '性能超越RT-2',
        content: '在BridgeV2测试集上成功率达到56.7%，超越RT-2-X的21.9%；参数量仅7B，推理速度比RT-2快6倍，适合边端部署。',
        highlights: ['56.7% vs 21.9%', '7B参数', '6倍推理加速'],
      },
    ],
    tables: [
      {
        title: 'OpenVLA vs RT-2 对比',
        headers: ['维度', 'OpenVLA', 'RT-2-X', 'Octo'],
        rows: [
          ['BridgeV2成功率', '56.7%', '21.9%', '42.3%'],
          ['参数量', '7B', '55B', '93M'],
          ['推理延迟(ms)', '320', '1900', '180'],
          ['是否开源', '✓', '✗', '✓'],
        ],
        chartType: 'table',
      },
    ],
    milestones: [
      { date: '2024-06', event: '论文挂出arXiv，同步开源模型权重' },
      { date: '2024-07', event: 'GitHub Star突破3000' },
      { date: '2024-11', event: 'CoRL 2024 Oral Presentation' },
      { date: '2025-02', event: 'OpenVLA-OFT发布，支持高效微调' },
    ],
  },
  {
    id: 'res-009',
    category: 'research',
    title: 'AgiBot World: A Large-scale Manipulation Platform for Robot Learning',
    institution: '上海人工智能实验室 / 智元机器人',
    date: '2025-03-10',
    tags: ['数据集', '操作学习', '具身智能', '大规模数据'],
    authors: ['AgiBot Research Team'],
    venue: 'arXiv preprint',
    paperUrl: 'https://arxiv.org/abs/2503.06669',
    citationCount: 89,
    intro: '发布迄今最大规模的真实机器人操作数据集AgiBot World，包含100种任务、1百万+轨迹，覆盖家庭、工厂、餐饮等多场景，为具身智能基础模型训练提供国内最全面的数据基础设施。',
    relatedNodes: ['humanoid', 'end-effector', 'controller'],
    relatedStocks: [{ name: '智元机器人', code: '未上市' }],
    arguments: [
      {
        title: '百万级真实轨迹数据',
        content: '基于100台以上智元A2机器人在真实环境中采集，覆盖抓取、摆放、倒水、折叠等100种操作任务，是Open X-Embodiment数据量的5倍，为大模型预训练提供坚实数据基础。',
        highlights: ['100万+轨迹', '100种任务', 'Open X 5倍'],
      },
      {
        title: '中文场景本土化优势',
        content: '数据采集场景针对中国家庭、餐饮、工厂环境设计，包含中文指令标注，弥补Open X-Embodiment中文场景空白，对国内具身智能发展具有重要战略意义。',
        highlights: ['中文指令标注', '本土场景', '战略意义'],
      },
    ],
    tables: [],
    milestones: [
      { date: '2024-12', event: 'AgiBot World数据采集完成第一批50万轨迹' },
      { date: '2025-03', event: '论文发布，同步开放数据集下载' },
      { date: '2025-06', event: '基于AgiBot World训练的基础模型发布' },
    ],
  },
];

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const r of reports) {
    for (const t of r.tags) tags.add(t);
  }
  return Array.from(tags);
}

export function getAllInstitutions(): string[] {
  return Array.from(new Set(reports.map((r) => r.institution)));
}

export function getReportsByCategory(category: ReportCategory): Report[] {
  return reports.filter((r) => r.category === category);
}


