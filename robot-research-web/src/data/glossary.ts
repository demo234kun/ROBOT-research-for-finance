// 机器人领域术语库

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

export const glossary: GlossaryTerm[] = [
  { term: '减速器', definition: '连接动力源和执行机构的中间装置，负责降低电机转速、放大扭矩，是机器人关节驱动的核心零部件。', category: '零部件' },
  { term: '谐波减速器', definition: '利用柔性齿轮变形实现减速传动的精密减速器，具有体积小、传动比大、精度高的特点，适用于轻载精密场景。', category: '零部件' },
  { term: 'RV减速器', definition: '摆线针轮行星减速器，承载能力强、精度高、寿命长，适用于重载工业机器人关节。', category: '零部件' },
  { term: '行星减速器', definition: '由太阳轮、行星轮和内齿圈组成的减速装置，结构紧凑、传动效率高。', category: '零部件' },
  { term: '伺服系统', definition: '由伺服电机和伺服驱动器组成的精确运动控制系统，能够根据指令精确控制位置、速度和扭矩。', category: '零部件' },
  { term: '伺服电机', definition: '能够精确控制转子位置和速度的电动机，是机器人关节驱动的执行元件。', category: '零部件' },
  { term: '控制器', definition: '机器人的核心控制单元，负责运动规划、轨迹插补、传感器数据处理和各关节协调控制。', category: '零部件' },
  { term: '力矩传感器', definition: '测量力和力矩的传感器，使机器人能够感知与环境的交互力，实现力控操作。', category: '零部件' },
  { term: '六维力传感器', definition: '同时测量三个方向的力和三个方向的力矩的传感器，是人形机器人灵巧手的关键部件。', category: '零部件' },
  { term: '末端执行器', definition: '安装在机器人末端、用于执行具体操作的工具，如夹爪、吸盘、焊枪等。', category: '零部件' },
  { term: '灵巧手', definition: '具备多自由度、能模拟人手精细操作能力的末端执行器，是人形机器人的核心难点之一。', category: '零部件' },
  { term: 'SLAM', definition: 'Simultaneous Localization and Mapping，同步定位与建图技术，使机器人在未知环境中同时构建地图并确定自身位置。', category: '算法' },
  { term: '视觉SLAM', definition: '基于摄像头图像信息的SLAM技术，通过特征点提取和匹配实现定位与建图。', category: '算法' },
  { term: '激光SLAM', definition: '基于激光雷达点云数据的SLAM技术，精度高、稳定性好，适用于工业场景。', category: '算法' },
  { term: '运动规划', definition: '为机器人规划从起点到终点的无碰撞运动轨迹的算法，包括路径规划和轨迹优化。', category: '算法' },
  { term: '逆运动学', definition: '根据末端执行器的目标位姿，反解各关节角度的数学方法，是机器人控制的基础。', category: '算法' },
  { term: '正运动学', definition: '根据各关节角度，计算末端执行器位姿的数学方法。', category: '算法' },
  { term: '协作机器人', definition: 'Cobot，能够在无围栏环境下与人类安全协作的机器人，具备力觉感知和安全停机功能。', category: '产品类型' },
  { term: 'SCARA', definition: 'Selective Compliance Assembly Robot Arm，平面关节型机器人，适用于快速拾放和装配作业。', category: '产品类型' },
  { term: '多关节机器人', definition: '具有多个旋转关节的机器人，模拟人手臂结构，工作空间大、灵活性强。', category: '产品类型' },
  { term: '人形机器人', definition: '具备类人形态和运动能力的机器人，能够适应人类设计的环境，执行多样化任务。', category: '产品类型' },
  { term: 'AGV', definition: 'Automated Guided Vehicle，自动导引车，沿预设路径自动行驶的搬运机器人。', category: '产品类型' },
  { term: 'AMR', definition: 'Autonomous Mobile Robot，自主移动机器人，无需预设路径，可自主导航避障。', category: '产品类型' },
  { term: '自由度', definition: 'DoF，Degrees of Freedom，机器人独立运动的维度数量，决定其灵活性和操作能力。', category: '基础概念' },
  { term: '负载', definition: '机器人末端能够承载的最大重量，是衡量机器人性能的重要指标。', category: '基础概念' },
  { term: '重复定位精度', definition: '机器人多次到达同一目标位置的偏差范围，反映运动控制的稳定性。', category: '基础概念' },
  { term: '工作空间', definition: '机器人末端执行器能够到达的所有位置构成的空间范围。', category: '基础概念' },
  { term: '力控', definition: '通过力矩传感器反馈，精确控制机器人与环境的交互力，实现柔顺操作。', category: '基础概念' },
  { term: '遥操作', definition: '操作员远程控制机器人执行任务的技术，常用于危险环境和远程手术。', category: '基础概念' },
  { term: '具身智能', definition: 'Embodied AI，将AI大模型与物理机器人结合，使机器人具备感知、理解和执行复杂任务的能力。', category: 'AI技术' },
  { term: '端到端学习', definition: 'End-to-End Learning，从原始感知输入直接到控制输出的学习方法，无需人工设计中间特征。', category: 'AI技术' },
  { term: '模仿学习', definition: '通过观察人类演示来学习机器人技能的方法，是机器人快速获取操作能力的重要途径。', category: 'AI技术' },
  { term: '强化学习', definition: '通过试错和奖励机制学习最优策略的机器学习方法，在机器人运动控制中应用广泛。', category: 'AI技术' },
  { term: '大模型', definition: 'Large Language Model，基于海量数据训练的超大规模神经网络模型，为机器人提供认知和决策能力。', category: 'AI技术' },
  { term: 'VLA', definition: 'Vision-Language-Action，视觉-语言-动作模型，将视觉感知、语言理解和动作执行统一的端到端模型。', category: 'AI技术' },
  { term: '机器视觉', definition: '利用摄像头和算法使机器人获取环境视觉信息的技术，包括目标检测、识别和测量。', category: '感知技术' },
  { term: '3D视觉', definition: '获取环境三维信息的技术，包括结构光、ToF、双目立体视觉等方法。', category: '感知技术' },
  { term: '激光雷达', definition: 'LiDAR，利用激光测量距离的传感器，能够生成高精度三维点云地图。', category: '感知技术' },
  { term: '深度相机', definition: '能够同时获取彩色图像和深度信息的相机，常用于机器人导航和抓取。', category: '感知技术' },
  { term: '触觉感知', definition: '通过触觉传感器获取接触力、纹理、温度等信息的技术，用于精细操作。', category: '感知技术' },
  { term: '系统集成', definition: '将机器人本体、传感器、软件等组合为完整解决方案的过程，是产业链下游的核心环节。', category: '产业概念' },
  { term: '国产替代', definition: '用国内厂商产品替代进口产品的过程，是机器人产业链发展的核心驱动力。', category: '产业概念' },
  { term: '量产', definition: '产品从研发试制阶段进入大规模生产阶段，标志着技术成熟和商业化落地。', category: '产业概念' },
  { term: 'BOM成本', definition: 'Bill of Materials，物料清单成本，机器人所有零部件的成本总和。', category: '产业概念' },
  { term: 'TCO', definition: 'Total Cost of Ownership，总拥有成本，包括采购、安装、维护、能耗等全生命周期成本。', category: '产业概念' },
  { term: '柔性制造', definition: '能够快速适应不同产品型号和生产需求的制造模式，是工业4.0的核心特征。', category: '产业概念' },
  { term: '数字孪生', definition: '在虚拟空间中创建物理实体的数字镜像，用于仿真、监控和优化机器人系统。', category: '产业概念' },
  { term: 'ROS', definition: 'Robot Operating System，机器人操作系统，开源的机器人软件框架，提供硬件抽象和通信机制。', category: '软件平台' },
  { term: 'Sim2Real', definition: '从仿真到现实的迁移学习技术，在虚拟环境中训练机器人策略后部署到真实机器人。', category: 'AI技术' },
  { term: '本体', definition: 'Robot Body，机器人的物理结构，包括机械臂、关节、底座等硬件部分。', category: '基础概念' },
  { term: '关节模组', definition: '集成了电机、减速器、编码器和控制器的标准化关节单元，便于模块化设计和维护。', category: '零部件' },
];

// 搜索术语
export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.toLowerCase();
  return glossary.filter(
    (g) =>
      g.term.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q),
  );
}