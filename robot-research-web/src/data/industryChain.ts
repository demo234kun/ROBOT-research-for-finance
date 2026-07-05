// 机器人产业链知识图谱数据（四维重构版）
// 四维：上游材料 | 上游核心零部件 | 中游本体制造 | 下游应用

export interface Stock {
  name: string;
  code: string; // 统一格式：000001.SZ / 600001.SH / 未上市
  market: 'A股' | '港股' | '美股' | '未上市';
  strength: '核心' | '一般' | '概念';
  marketCap?: string; // 市值(亿)
  pe?: string;        // PE(TTM)
  desc?: string;      // 核心定位
}

export interface ChainNode {
  id: string;
  name: string;
  description: string;
  level: 1 | 2 | 3;
  parentId: string | null;
  stocks?: Stock[];
  children?: ChainNode[];
}

export const industryChain: ChainNode[] = [
  /* ═══════════════════════════════════════════════════
   * 维度一：上游材料
   * ═══════════════════════════════════════════════════ */
  {
    id: 'material',
    name: '上游材料',
    description: '人形机器人对轻量化、高强度、高磁性能的极致追求，催生工业金属、稀有金属、仿生材料的结构性需求爆发。',
    level: 1,
    parentId: null,
    children: [
      {
        id: 'industrial-metal',
        name: '工业金属',
        description: '打造机器人"钢铁之躯"，决定结构强度、运动灵活性和续航能力。',
        level: 2,
        parentId: 'material',
        stocks: [
          { name: '宝武镁业', code: '002182.SZ', market: 'A股', strength: '核心', marketCap: '151.5', pe: 'N/A', desc: '全球最大镁合金生产商，产品用于机器人外壳、关节壳体' },
          { name: '南山铝业', code: '600219.SH', market: 'A股', strength: '核心', marketCap: '478.9', pe: '11.6', desc: '国内铝加工龙头，高性能铝合金用于机身骨架' },
          { name: '东方锆业', code: '002167.SZ', market: 'A股', strength: '一般', marketCap: '194.0', pe: '357.7', desc: '锆钛产业链布局，钛合金用于核心受力部件' },
          { name: '中钨高新', code: '000657.SZ', market: 'A股', strength: '核心', marketCap: '2042.3', pe: '106.7', desc: '国内硬质合金龙头，高耐磨执行器部件' },
          { name: '锡业股份', code: '000960.SZ', market: 'A股', strength: '一般', marketCap: '666.1', pe: '29.3', desc: '全球锡行业龙头，锡基合金用于电子连接器' },
        ],
      },
      {
        id: 'rare-metal',
        name: '稀有金属',
        description: '驱动机器人"动力心脏"，钕铁硼永磁材料决定伺服电机输出扭矩，单台需求3.5kg+。',
        level: 2,
        parentId: 'material',
        stocks: [
          { name: '金力永磁', code: '300748.SZ', market: 'A股', strength: '核心', marketCap: '471.1', pe: '63.4', desc: '高性能钕铁硼磁材龙头，单台机器人需3.5kg+' },
          { name: '中国稀土', code: '000831.SZ', market: 'A股', strength: '核心', marketCap: '577.8', pe: '247.5', desc: '国内稀土行业整合平台，资源禀赋优越' },
          { name: '中科三环', code: '000970.SZ', market: 'A股', strength: '核心', marketCap: '200.4', pe: '206.0', desc: '钕铁硼磁材老牌企业，技术积累深厚' },
          { name: '宁波韵升', code: '600366.SH', market: 'A股', strength: '一般', marketCap: '185.0', pe: '44.3', desc: '钕铁硼磁材+伺服电机双布局' },
          { name: '正海磁材', code: '300224.SZ', market: 'A股', strength: '一般', marketCap: '132.1', pe: '43.0', desc: '新能源汽车+机器人磁材双轮驱动' },
          { name: '龙磁科技', code: '300835.SZ', market: 'A股', strength: '一般', marketCap: '227.2', pe: '135.1', desc: '铁氧体+钕铁硼双赛道布局' },
          { name: '有研新材', code: '600206.SH', market: 'A股', strength: '一般', marketCap: '459.7', pe: '159.7', desc: '高纯金属靶材龙头，磁材/传感器应用' },
          { name: '驰宏锌锗', code: '600497.SH', market: 'A股', strength: '概念', marketCap: '551.9', pe: '45.6', desc: '国内锗金属骨干，红外传感器材料' },
        ],
      },
      {
        id: 'bionic-material',
        name: '仿生材料',
        description: '赋予机器人"类人皮肤"，PEEK、硅橡胶、TPE等材料是人形机器人从机械走向类人的关键。',
        level: 2,
        parentId: 'material',
        stocks: [
          { name: '金发科技', code: '600143.SH', market: 'A股', strength: '核心', marketCap: '454.7', pe: '36.2', desc: '国内改性塑料龙头，PEEK等高性能材料' },
          { name: '沃特股份', code: '002886.SZ', market: 'A股', strength: '一般', marketCap: '73.6', pe: '103.6', desc: '硅橡胶/热塑性弹性体，仿生皮肤应用' },
        ],
      },
    ],
  },
  /* ═══════════════════════════════════════════════════
   * 维度二：上游核心零部件
   * ═══════════════════════════════════════════════════ */
  {
    id: 'components',
    name: '上游核心零部件',
    description: '精密减速器、行星滚柱丝杠、六维力传感器等核心部件技术壁垒高，国产替代空间大，投资确定性最强。',
    level: 1,
    parentId: null,
    children: [
      {
        id: 'actuator',
        name: '执行器与关节模组',
        description: '机器人"运动心脏"，全身配置28-40个执行器，特斯拉Optimus供应链最受关注。',
        level: 2,
        parentId: 'components',
        stocks: [
          { name: '三花智控', code: '002050.SZ', market: 'A股', strength: '核心', marketCap: '2061.5', pe: '48.5', desc: '特斯拉Optimus独家关节执行器总成供应商' },
          { name: '拓普集团', code: '601689.SH', market: 'A股', strength: '核心', marketCap: '1084.9', pe: '39.0', desc: '特斯拉灵巧手+线性执行器独家供应商' },
          { name: '绿的谐波', code: '688017.SH', market: 'A股', strength: '核心', marketCap: '894.7', pe: '625.6', desc: '谐波减速器龙头，已进入多家头部整机厂商' },
          { name: '汇川技术', code: '300124.SZ', market: 'A股', strength: '核心', marketCap: '1953.5', pe: '41.7', desc: '伺服电机+驱动器国产龙头' },
          { name: '鸣志电器', code: '603728.SH', market: 'A股', strength: '核心', marketCap: '284.9', pe: '425.1', desc: '混合式步进电机全球市占率超10%' },
          { name: '兆威机电', code: '003021.SZ', market: 'A股', strength: '一般', marketCap: '269.7', pe: '100.8', desc: '微型传动系统龙头，灵巧机构核心' },
        ],
      },
      {
        id: 'reducer',
        name: '减速器',
        description: '关节核心传动部件，谐波减速器国产化率62%，RV减速器持续追赶。',
        level: 2,
        parentId: 'components',
        stocks: [
          { name: '绿的谐波', code: '688017.SH', market: 'A股', strength: '核心', marketCap: '894.7', pe: '625.6', desc: '谐波减速器国内市占率62%，四大整机厂第一大供应商' },
          { name: '双环传动', code: '002472.SZ', market: 'A股', strength: '核心', marketCap: '399.6', pe: '31.3', desc: 'RV减速器国产龙头，环动科技' },
          { name: '中大力德', code: '002896.SZ', market: 'A股', strength: '核心', marketCap: '168.3', pe: '295.2', desc: '谐波+RV+行星三类减速器量产' },
          { name: '昊志机电', code: '300503.SZ', market: 'A股', strength: '一般', marketCap: '342.1', pe: '173.4', desc: '谐波减速器+关节模组，与优必选合资' },
          { name: '斯菱股份', code: '301550.SZ', market: 'A股', strength: '一般', marketCap: '365.8', pe: '218.2', desc: '机器人智能化产线，谐波已投产' },
          { name: '秦川机床', code: '000837.SZ', market: 'A股', strength: '一般', marketCap: '127.2', pe: '248.6', desc: 'RV减速器研发量产' },
          { name: '丰立智能', code: '301368.SZ', market: 'A股', strength: '概念', marketCap: '60.1', pe: 'N/A', desc: '小模数齿轮，适配轻量化关节' },
        ],
      },
      {
        id: 'screw',
        name: '丝杠',
        description: '线性关节核心传动，行星滚柱丝杠是特斯拉Optimus标配，国内多家已通过验证。',
        level: 2,
        parentId: 'components',
        stocks: [
          { name: '贝斯特', code: '300580.SZ', market: 'A股', strength: '核心', marketCap: '130.4', pe: '46.4', desc: '行星滚柱丝杠，已通过特斯拉验证' },
          { name: '五洲新春', code: '603667.SH', market: 'A股', strength: '核心', marketCap: '291.8', pe: '331.1', desc: '行星滚柱丝杠与减速器配套组件' },
          { name: '恒立液压', code: '601100.SH', market: 'A股', strength: '一般', marketCap: '1631.2', pe: '58.8', desc: '液压龙头跨界精密丝杠' },
          { name: '北特科技', code: '603009.SH', market: 'A股', strength: '一般', marketCap: '184.8', pe: '148.2', desc: '汽车转向丝杠→灵巧手丝杠' },
          { name: '双林股份', code: '300100.SZ', market: 'A股', strength: '一般', marketCap: '176.6', pe: '41.7', desc: '灵巧手微型滚珠丝杠，通过特斯拉验证' },
        ],
      },
      {
        id: 'motor',
        name: '电机',
        description: '力矩电机/无框电机/空心杯电机三类覆盖旋转、线性、灵巧手全场景。',
        level: 2,
        parentId: 'components',
        stocks: [
          { name: '鸣志电器', code: '603728.SH', market: 'A股', strength: '核心', marketCap: '284.9', pe: '425.1', desc: '微特电机龙头，空心杯电机适配灵巧手' },
          { name: '汇川技术', code: '300124.SZ', market: 'A股', strength: '核心', marketCap: '1953.5', pe: '41.7', desc: '伺服系统覆盖无框电机等全系列' },
          { name: '步科股份', code: '688160.SH', market: 'A股', strength: '一般', marketCap: '125.0', pe: '161.2', desc: '高端工控电机，适配手指关节' },
          { name: '江苏雷利', code: '300660.SZ', market: 'A股', strength: '一般', marketCap: '193.5', pe: '70.8', desc: '家电电机龙头，拓展空心杯电机' },
          { name: '卧龙电驱', code: '600580.SH', market: 'A股', strength: '概念', marketCap: '583.5', pe: '51.9', desc: '与智元机器人合作' },
        ],
      },
      {
        id: 'sensor',
        name: '传感器',
        description: '六维力/IMU/视觉/触觉/编码器五大类，国产化率最低，增量空间最大。',
        level: 2,
        parentId: 'components',
        stocks: [
          { name: '柯力传感', code: '603662.SH', market: 'A股', strength: '核心', marketCap: '224.7', pe: '73.4', desc: '六维力/力矩传感器国内龙头' },
          { name: '奥比中光', code: '688322.SH', market: 'A股', strength: '核心', marketCap: '605.9', pe: '433.3', desc: '3D视觉感知龙头，与宇树科技深度合作' },
          { name: '芯动联科', code: '688582.SH', market: 'A股', strength: '核心', marketCap: '241.0', pe: '92.3', desc: 'IMU惯性测量单元供应商' },
          { name: '东华测试', code: '300354.SZ', market: 'A股', strength: '一般', marketCap: '51.5', pe: '38.0', desc: '六维力/力矩传感器供应商' },
          { name: '安培龙', code: '301309.SZ', market: 'A股', strength: '一般', marketCap: '32.4', pe: '29.1', desc: '六维力/力矩传感器供应商' },
          { name: '奥普特', code: '688686.SH', market: 'A股', strength: '一般', marketCap: '206.8', pe: '107.8', desc: '视觉传感器供应商' },
          { name: '汉威科技', code: '300007.SZ', market: 'A股', strength: '概念', marketCap: '141.7', pe: '83.2', desc: '触觉传感器供应商' },
          { name: '福莱新材', code: '605488.SH', market: 'A股', strength: '概念', marketCap: '105.3', pe: '158.5', desc: '触觉传感器供应商' },
        ],
      },
    ],
  },
  /* ═══════════════════════════════════════════════════
   * 维度三：中游本体制造
   * ═══════════════════════════════════════════════════ */
  {
    id: 'midstream',
    name: '中游本体制造',
    description: '产业链集成环节，将零部件组装为完整人形机器人。2026年进入量产元年，优必选、宇树科技领跑。',
    level: 1,
    parentId: null,
    children: [
      {
        id: 'humanoid-body',
        name: '人形机器人整机',
        description: '全球人形机器人进入量产元年，Walker S量产交付，G1高性价比切入教育科研市场。',
        level: 2,
        parentId: 'midstream',
        stocks: [
          { name: '优必选', code: '9880.HK', market: '港股', strength: '核心', marketCap: '548.2', pe: 'N/A', desc: 'Walker S量产交付，U1系列订单破万台，全球首家上市' },
          { name: '均普智能', code: '688306.SH', market: 'A股', strength: '核心', marketCap: '127.5', pe: 'N/A', desc: '推出"贾维斯"人形机器人，与智元合资' },
          { name: '禾川科技', code: '688320.SH', market: 'A股', strength: '一般', marketCap: '64.9', pe: 'N/A', desc: '推出"游龙01"，90%核心部件自产' },
          { name: '四川长虹', code: '600839.SH', market: 'A股', strength: '概念', marketCap: '316.2', pe: '42.8', desc: '家电+人形机器人本体研发' },
        ],
      },
      {
        id: 'industrial-robot',
        name: '工业机器人',
        description: '国产工业机器人龙头加快向具身智能延伸，埃斯顿、汇川、新时达持续突破。',
        level: 2,
        parentId: 'midstream',
        stocks: [
          { name: '埃斯顿', code: '002747.SZ', market: 'A股', strength: '核心', marketCap: '433.3', pe: '298.5', desc: '国产工业机器人龙头，具身智能通用底座' },
          { name: '机器人', code: '300024.SZ', market: 'A股', strength: '一般', marketCap: '286.7', pe: 'N/A', desc: '新松机器人，医疗康养机器人' },
          { name: '博实股份', code: '002698.SZ', market: 'A股', strength: '一般', marketCap: '140.5', pe: '28.6', desc: '自动化成套装备龙头' },
          { name: '拓斯达', code: '300607.SZ', market: 'A股', strength: '概念', marketCap: '252.6', pe: '220.7', desc: '自动化解决方案' },
        ],
      },
      {
        id: 'service-robot',
        name: '服务与特种机器人',
        description: '科沃斯、石头科技领跑服务机器人，亿嘉和、申昊科技专注高危巡检场景。',
        level: 2,
        parentId: 'midstream',
        stocks: [
          { name: '科沃斯', code: '603486.SH', market: 'A股', strength: '核心', marketCap: '316.4', pe: '18.7', desc: '服务机器人龙头' },
          { name: '石头科技', code: '688169.SH', market: 'A股', strength: '核心', marketCap: '258.2', pe: '18.1', desc: '智能清洁机器人龙头' },
          { name: '亿嘉和', code: '603666.SH', market: 'A股', strength: '核心', marketCap: '62.2', pe: 'N/A', desc: '电力巡检机器人龙头' },
          { name: '申昊科技', code: '300853.SZ', market: 'A股', strength: '一般', marketCap: '51.6', pe: 'N/A', desc: '电网/轨道交通巡检' },
          { name: '萤石网络', code: '688475.SH', market: 'A股', strength: '概念', marketCap: '217.4', pe: '35.8', desc: '陪护机器人+清洁机器人' },
        ],
      },
    ],
  },
  /* ═══════════════════════════════════════════════════
   * 维度四：下游应用
   * ═══════════════════════════════════════════════════ */
  {
    id: 'downstream',
    name: '下游应用',
    description: '工业场景最先商业化，消费与医疗场景快速扩张，特种场景处于早期验证阶段。',
    level: 1,
    parentId: null,
    children: [
      {
        id: 'auto-mfg',
        name: '汽车制造',
        description: '汽车总装是人形机器人最先落地的工业场景，天奇、比亚迪、赛力斯已开始部署。',
        level: 2,
        parentId: 'downstream',
        stocks: [
          { name: '比亚迪', code: '002594.SZ', market: 'A股', strength: '核心', marketCap: '8066.0', pe: '45.4', desc: '已部署人形机器人进厂实训' },
          { name: '赛力斯', code: '601127.SH', market: 'A股', strength: '核心', marketCap: '1077.2', pe: '17.2', desc: '华为智选车，布局人形机器人赛道' },
          { name: '长安汽车', code: '000625.SZ', market: 'A股', strength: '一般', marketCap: '717.7', pe: '23.4', desc: '与优必选合作，推进汽车产线应用' },
          { name: '长城汽车', code: '601633.SH', market: 'A股', strength: '一般', marketCap: '1315.3', pe: '13.3', desc: '积极布局智能制造' },
          { name: '天奇股份', code: '002009.SZ', market: 'A股', strength: '核心', marketCap: '88.5', pe: '244.3', desc: '与优必选合资，汽车领域人形机器人' },
        ],
      },
      {
        id: 'electronics-logistics',
        name: '电子制造与物流',
        description: '3C精密装配与仓储分拣是高价值应用场景，工业富联、立讯、顺丰快速推进。',
        level: 2,
        parentId: 'downstream',
        stocks: [
          { name: '工业富联', code: '601138.SH', market: 'A股', strength: '核心', marketCap: '12843.1', pe: '31.6', desc: '全球电子代工龙头，精密装配场景' },
          { name: '立讯精密', code: '002475.SZ', market: 'A股', strength: '核心', marketCap: '4716.4', pe: '27.7', desc: '精密制造龙头，3C电子装配自动化' },
          { name: '顺丰控股', code: '002352.SZ', market: 'A股', strength: '核心', marketCap: '1709.6', pe: '14.3', desc: '分拣/搬运场景人形机器人应用' },
          { name: '歌尔股份', code: '002241.SZ', market: 'A股', strength: '一般', marketCap: '782.9', pe: '19.3', desc: '消费电子制造自动化升级' },
          { name: '大族激光', code: '002008.SZ', market: 'A股', strength: '概念', marketCap: '1334.8', pe: '96.7', desc: '激光加工龙头，零部件生产设备' },
        ],
      },
      {
        id: 'consumer-service',
        name: '消费与智能家居',
        description: '小米、美的、海尔依托IoT生态提供家庭场景入口，科大讯飞大模型赋能交互。',
        level: 2,
        parentId: 'downstream',
        stocks: [
          { name: '美的集团', code: '000333.SZ', market: 'A股', strength: '核心', marketCap: '5935.4', pe: '13.4', desc: '智能制造+智能家居双布局' },
          { name: '格力电器', code: '000651.SZ', market: 'A股', strength: '一般', marketCap: '2147.0', pe: '7.3', desc: '工业自动化+智能家居' },
          { name: '海尔智家', code: '600690.SH', market: 'A股', strength: '一般', marketCap: '1874.1', pe: '10.2', desc: '智慧家庭解决方案龙头' },
          { name: '科大讯飞', code: '002230.SZ', market: 'A股', strength: '核心', marketCap: '997.1', pe: '112.2', desc: 'AI语音龙头，大模型赋能交互' },
          { name: '海康威视', code: '002415.SZ', market: 'A股', strength: '核心', marketCap: '3116.1', pe: '20.9', desc: '视觉+移动机器人赋能感知' },
        ],
      },
      {
        id: 'medical-edu',
        name: '医疗康复与教育',
        description: '康复机器人政策支持力度大，脑机接口、陪护机器人快速发展，教育机器人渗透青少年市场。',
        level: 2,
        parentId: 'downstream',
        stocks: [
          { name: '伟思医疗', code: '688580.SH', market: 'A股', strength: '核心', marketCap: '56.3', pe: '34.0', desc: '康复机器人龙头' },
          { name: '翔宇医疗', code: '688626.SH', market: 'A股', strength: '核心', marketCap: '80.3', pe: '96.5', desc: '康复机器人+脑机接口' },
          { name: '鱼跃医疗', code: '002223.SZ', market: 'A股', strength: '一般', marketCap: '266.7', pe: '13.4', desc: '家用医疗器械龙头' },
          { name: '盈趣科技', code: '002925.SZ', market: 'A股', strength: '概念', marketCap: '183.8', pe: '30.2', desc: '康复机器人布局' },
        ],
      },
    ],
  },
];

// 扁平化所有节点，便于搜索和查找
export function flattenNodes(nodes: ChainNode[]): ChainNode[] {
  const result: ChainNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) result.push(...flattenNodes(node.children));
  }
  return result;
}

// 搜索板块或股票
export function searchChain(query: string): ChainNode[] {
  const q = query.toLowerCase();
  const all = flattenNodes(industryChain);
  return all.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.stocks?.some((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)),
  );
}
