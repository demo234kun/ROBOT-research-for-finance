import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// CRT 荧光绿主色
const GREEN = 0x00e676;
const GREEN_DIM = 0x004d26;
const AMBER = 0xffb000;
const BLUE = 0x4fc3f7;

interface RobotCanvasProps {
  /** 当前选中的节点 ID（用于高亮对应部位） */
  activePartId: string | null;
  onPartClick: (partId: string) => void;
  className?: string;
}

// 节点 ID → 机器人身体部位名称映射
const PART_MAP: Record<string, string> = {
  reducer: 'leftShoulder',
  servo: 'leftArm',
  controller: 'head',
  sensor: 'rightShoulder',
  'end-effector': 'rightArm',
  industrial: 'leftLeg',
  humanoid: 'torso',
  service: 'rightLeg',
  special: 'leftFoot',
  'auto-integration': 'rightFoot',
  '3c-integration': 'leftHip',
  'logistics-integration': 'rightHip',
};

// 部位颜色
const PART_COLOR: Record<string, number> = {
  head: GREEN, leftShoulder: GREEN, rightShoulder: GREEN,
  leftArm: GREEN, rightArm: GREEN,
  torso: AMBER, leftHip: BLUE, rightHip: BLUE,
  leftLeg: AMBER, rightLeg: AMBER,
  leftFoot: AMBER, rightFoot: BLUE,
};

/** 创建线框/辉光网格：用于线框视觉 */
function createWireframeMesh(
  geo: THREE.BufferGeometry,
  color: number,
  dim = false,
): THREE.LineSegments {
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: dim ? 0.25 : 0.85,
  });
  return new THREE.LineSegments(edges, mat);
}

/** 创建半透明实体填充（辉光感） */
function createSolidMesh(geo: THREE.BufferGeometry, color: number): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, mat);
}

/** 构建完整机器人 Group，返回 { group, parts } */
function buildRobot() {
  const group = new THREE.Group();
  const parts: Record<string, THREE.Object3D[]> = {};

  function addPart(name: string, ...objs: THREE.Object3D[]) {
    parts[name] = parts[name] || [];
    for (const o of objs) {
      parts[name].push(o);
      group.add(o);
    }
  }

  // ── 头部 ──────────────────────────────────────────────
  const headGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
  const headPos = new THREE.Vector3(0, 2.05, 0);
  const headWire = createWireframeMesh(headGeo, GREEN);
  const headFill = createSolidMesh(headGeo, GREEN);
  headWire.position.copy(headPos);
  headFill.position.copy(headPos);
  addPart('head', headWire, headFill);

  // 眼睛（两个小球）
  [-0.13, 0.13].forEach(ox => {
    const eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const eyeMesh = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: GREEN }));
    eyeMesh.position.set(ox, 2.08, 0.28);
    addPart('head', eyeMesh);
  });

  // 天线
  const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35);
  const antennaMesh = createWireframeMesh(antennaGeo, GREEN);
  antennaMesh.position.set(0, 2.58, 0);
  const antennaBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshBasicMaterial({ color: GREEN }),
  );
  antennaBall.position.set(0, 2.77, 0);
  addPart('head', antennaMesh, antennaBall);

  // 颈部
  const neckGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.18);
  const neckWire = createWireframeMesh(neckGeo, GREEN, true);
  neckWire.position.set(0, 1.74, 0);
  addPart('torso', neckWire);

  // ── 躯干 ──────────────────────────────────────────────
  const torsoGeo = new THREE.BoxGeometry(1.0, 1.1, 0.52);
  const torsoPos = new THREE.Vector3(0, 1.0, 0);
  const torsoWire = createWireframeMesh(torsoGeo, AMBER);
  const torsoFill = createSolidMesh(torsoGeo, AMBER);
  torsoWire.position.copy(torsoPos);
  torsoFill.position.copy(torsoPos);
  addPart('torso', torsoWire, torsoFill);

  // 胸部面板（内嵌小矩形）
  const panelGeo = new THREE.BoxGeometry(0.6, 0.4, 0.06);
  const panelWire = createWireframeMesh(panelGeo, GREEN);
  panelWire.position.set(0, 1.1, 0.28);
  addPart('torso', panelWire);

  // 胸部指示灯
  for (let i = 0; i < 5; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: GREEN }),
    );
    dot.position.set(-0.2 + i * 0.1, 1.05, 0.27);
    addPart('torso', dot);
  }

  // ── 肩关节 ──────────────────────────────────────────
  [[-0.68, 1.5], [0.68, 1.5]].forEach(([x, y], idx) => {
    const shoulderGeo = new THREE.SphereGeometry(0.14, 10, 10);
    const wire = createWireframeMesh(shoulderGeo, GREEN);
    const fill = createSolidMesh(shoulderGeo, GREEN);
    wire.position.set(x as number, y as number, 0);
    fill.position.set(x as number, y as number, 0);
    const name = idx === 0 ? 'leftShoulder' : 'rightShoulder';
    addPart(name, wire, fill);
  });

  // ── 手臂 ──────────────────────────────────────────────
  [
    { name: 'leftArm',  x: -0.82, upperY: 1.1, lowerY: 0.6 },
    { name: 'rightArm', x:  0.82, upperY: 1.1, lowerY: 0.6 },
  ].forEach(({ name, x, upperY, lowerY }) => {
    // 上臂
    const upperGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.55);
    const upperWire = createWireframeMesh(upperGeo, GREEN);
    upperWire.position.set(x, upperY, 0);
    // 肘关节
    const elbowGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const elbowWire = createWireframeMesh(elbowGeo, GREEN, true);
    elbowWire.position.set(x, lowerY + 0.28, 0);
    // 前臂
    const lowerGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.5);
    const lowerWire = createWireframeMesh(lowerGeo, GREEN);
    lowerWire.position.set(x, lowerY, 0);
    // 手部
    const handGeo = new THREE.BoxGeometry(0.22, 0.2, 0.14);
    const handWire = createWireframeMesh(handGeo, GREEN);
    const handFill = createSolidMesh(handGeo, GREEN);
    handWire.position.set(x, lowerY - 0.35, 0);
    handFill.position.set(x, lowerY - 0.35, 0);
    addPart(name, upperWire, elbowWire, lowerWire, handWire, handFill);
  });

  // ── 髋部 ──────────────────────────────────────────────
  const hipGeo = new THREE.BoxGeometry(0.9, 0.26, 0.48);
  const hipPos = new THREE.Vector3(0, 0.37, 0);
  const hipWire = createWireframeMesh(hipGeo, AMBER, true);
  hipWire.position.copy(hipPos);
  addPart('leftHip', hipWire);
  addPart('rightHip', hipWire); // 共用

  // ── 腿部 ──────────────────────────────────────────────
  [
    { name: 'leftLeg',  foot: 'leftFoot',  x: -0.28 },
    { name: 'rightLeg', foot: 'rightFoot', x:  0.28 },
  ].forEach(({ name, foot, x }) => {
    // 大腿
    const upperGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.7);
    const upperWire = createWireframeMesh(upperGeo, AMBER);
    upperWire.position.set(x, -0.1, 0);
    // 膝关节
    const kneeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const kneeWire = createWireframeMesh(kneeGeo, AMBER, true);
    kneeWire.position.set(x, -0.5, 0);
    // 小腿
    const lowerGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.65);
    const lowerWire = createWireframeMesh(lowerGeo, AMBER);
    lowerWire.position.set(x, -0.9, 0);
    // 脚部
    const footGeo = new THREE.BoxGeometry(0.28, 0.14, 0.44);
    const footWire = createWireframeMesh(footGeo, AMBER);
    const footFill = createSolidMesh(footGeo, AMBER);
    footWire.position.set(x, -1.26, 0.06);
    footFill.position.set(x, -1.26, 0.06);
    addPart(name, upperWire, kneeWire, lowerWire);
    addPart(foot, footWire, footFill);
  });

  return { group, parts };
}

export default function RobotCanvas({ activePartId, onPartClick, className }: RobotCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    parts: Record<string, THREE.Object3D[]>;
    rafId: number;
    clock: THREE.Clock;
    autoRotate: boolean;
    rotY: number;
  } | null>(null);

  // 初始化 Three.js 场景（仅一次）
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth || 400, mount.clientHeight || 500);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // 场景
    const scene = new THREE.Scene();

    // 相机
    const camera = new THREE.PerspectiveCamera(
      42,
      (mount.clientWidth || 400) / (mount.clientHeight || 500),
      0.1,
      100,
    );
    camera.position.set(0, 0.4, 6.5);
    camera.lookAt(0, 0.4, 0);

    // 极简环境光
    scene.add(new THREE.AmbientLight(0x00e676, 0.3));
    const keyLight = new THREE.PointLight(0x00e676, 1.5, 20);
    keyLight.position.set(2, 4, 5);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xffb000, 0.5, 20);
    fillLight.position.set(-3, -1, 3);
    scene.add(fillLight);

    // 机器人
    const { group, parts } = buildRobot();
    scene.add(group);

    // 地面网格（极简辉光感）
    const gridHelper = new THREE.GridHelper(6, 12, GREEN_DIM, GREEN_DIM);
    (gridHelper.material as THREE.Material).opacity = 0.2;
    (gridHelper.material as THREE.Material).transparent = true;
    gridHelper.position.y = -1.35;
    scene.add(gridHelper);

    const clock = new THREE.Clock();
    let autoRotate = true;
    let rotY = 0;

    // 动画循环
    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 天线球脉冲（通过 userData 缓存引用）
      group.traverse(obj => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
          const r = (obj.geometry as THREE.SphereGeometry).parameters?.radius;
          if (r === 0.06) {
            // 天线球
            const s = 0.85 + 0.3 * Math.sin(elapsed * 3);
            obj.scale.setScalar(s);
          }
        }
      });

      // 胸部指示灯闪烁
      let ledIdx = 0;
      group.traverse(obj => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
          const r = (obj.geometry as THREE.SphereGeometry).parameters?.radius;
          if (r === 0.04) {
            const blink = 0.4 + 0.6 * Math.abs(Math.sin(elapsed * 2 + ledIdx * 0.7));
            (obj.material as THREE.MeshBasicMaterial).opacity = blink;
            (obj.material as THREE.MeshBasicMaterial).transparent = true;
            ledIdx++;
          }
        }
      });

      // 自动缓慢旋转
      if (autoRotate) {
        rotY += 0.004;
        group.rotation.y = rotY;
      }

      // 轻微上下浮动
      group.position.y = Math.sin(elapsed * 0.8) * 0.06;

      renderer.render(scene, camera);
    }
    animate();

    // 拖拽旋转
    let isDragging = false;
    let lastX = 0;
    const canvas = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      autoRotate = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      rotY += dx * 0.012;
      group.rotation.y = rotY;
      lastX = e.clientX;
    };
    const onPointerUp = () => {
      isDragging = false;
      // 3 秒后恢复自转
      setTimeout(() => { autoRotate = true; }, 3000);
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 响应式
    const ro = new ResizeObserver(() => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(mount);

    stateRef.current = { renderer, scene, camera, group, parts, rafId, clock, autoRotate, rotY };

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
      mount.removeChild(canvas);
    };
  }, []);

  // 响应 activePartId 变化 → 高亮对应部位
  useEffect(() => {
    if (!stateRef.current) return;
    const { parts } = stateRef.current;
    const activePart = activePartId ? PART_MAP[activePartId] : null;

    // 重置所有部位颜色
    Object.entries(parts).forEach(([partName, objs]) => {
      const baseColor = PART_COLOR[partName] || GREEN;
      objs.forEach(obj => {
        if (obj instanceof THREE.LineSegments) {
          (obj.material as THREE.LineBasicMaterial).color.setHex(
            activePart && activePart !== partName ? baseColor : baseColor,
          );
          (obj.material as THREE.LineBasicMaterial).opacity =
            activePart && activePart !== partName ? 0.15 : (obj.material as THREE.LineBasicMaterial).opacity > 0.5 ? 0.85 : 0.25;
        }
        if (obj instanceof THREE.Mesh) {
          (obj.material as THREE.MeshBasicMaterial).opacity =
            activePart && activePart !== partName ? 0.03 : 0.08;
        }
      });
    });

    // 高亮激活部位
    if (activePart && parts[activePart]) {
      parts[activePart].forEach(obj => {
        if (obj instanceof THREE.LineSegments) {
          (obj.material as THREE.LineBasicMaterial).color.setHex(0xffffff);
          (obj.material as THREE.LineBasicMaterial).opacity = 1.0;
        }
        if (obj instanceof THREE.Mesh) {
          (obj.material as THREE.MeshBasicMaterial).opacity = 0.25;
        }
      });
    }
  }, [activePartId]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ cursor: 'grab', touchAction: 'none' }}
      title="拖拽旋转机器人"
    />
  );
}
