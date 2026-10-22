import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  AgentProfile,
  DoraemonCharacterKey,
  OfficeZone,
  TaskAssignment,
  ZoneId
} from '../types/office';
import {
  computeAgentWaypoint,
  getActiveSocialDialogue
} from '../utils/officeLogic';
import {
  buildDetailedAgencyStaffCharacter,
  buildDetailedDoraemonCharacter
} from '../utils/doraemonCharacterBuilder';

export interface OfficeActivityStats {
  workingCount: number;
  totalStaff: number;
  cafeCount: number;
  gameCount: number;
  talkingCount?: number;
}

export interface LiveDialogueBannerInfo {
  speakerName: string;
  listenerName: string;
  hubLabel: string;
  line: string;
  speakerKey: string;
}

interface VirtualOffice3DProps {
  zones: OfficeZone[];
  agents: AgentProfile[];
  activeZoneId: ZoneId;
  selectedAgentId: string;
  tasks: TaskAssignment[];
  isAllHandsMeeting: boolean;
  isSocialGathering?: boolean;
  onSelectZone: (zoneId: ZoneId) => void;
  onSelectAgent: (agentId: string) => void;
  onActivityStatsChange?: (stats: OfficeActivityStats) => void;
  onActiveDialogueChange?: (info: LiveDialogueBannerInfo) => void;
}

interface AgentActorRig {
  agent: AgentProfile;
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  headGroup: THREE.Group;
  tailGroup?: THREE.Group;
  propellerGroup?: THREE.Group;
  eyeGroups: THREE.Group[];
  statusRing: THREE.Mesh;
  labelSprite: THREE.Sprite;
  chatBubbleSprite: THREE.Sprite;
  lastBadgeText: string;
  lastChatText: string;
  patrolWaypoints: THREE.Vector3[];
  patrolIndex: number;
  patrolWaitTimer: number;
}

interface AutonomousNpcRig {
  id: string;
  roleLabel: string;
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  head: THREE.Object3D;
  labelSprite: THREE.Sprite;
  chatBubbleSprite: THREE.Sprite;
  lastChatText: string;
  chatLines: string[];
  partnerLookAt?: THREE.Vector3;
  mode: 'seated_work' | 'seated_cafe' | 'seated_game' | 'walker';
  waypoints: { pos: THREE.Vector3; activity: 'cafe' | 'game' | 'work' | 'walk'; lookAt?: THREE.Vector3 }[];
  currentWpIndex: number;
  waitTimer: number;
  currentActivity: 'cafe' | 'game' | 'work' | 'walk';
}

function createDarkFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#26272e';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle architectural concrete tile seams
  ctx.strokeStyle = '#2d2f37';
  ctx.lineWidth = 2;
  const step = 128;
  for (let i = 0; i <= 512; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(14, 10);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createWoodParquetTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5c4028';
  ctx.fillRect(0, 0, 512, 512);

  const plankColors = ['#543a24', '#63452b', '#4d3520', '#694a2f'];
  for (let y = 0; y < 512; y += 32) {
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = plankColors[((x / 128) + (y / 32)) % plankColors.length];
      ctx.fillRect(x + 1, y + 1, 126, 30);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 3);
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createNeonSignTexture(
  text: string,
  bgHex: string,
  borderHex: string,
  textHex: string,
  glowHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 144, 18);
  ctx.fill();

  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.save();
  ctx.shadowColor = glowHex;
  ctx.shadowBlur = 18;
  ctx.fillStyle = textHex;
  ctx.font = '900 68px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 84);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createFloor3DLettersTexture(
  text: string,
  colorHex: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 192);

  // 3D Extruded shadow effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.font = '800 78px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 516, 104);

  ctx.fillStyle = colorHex;
  ctx.fillText(text, 512, 96);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createTurboKartScreenTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d')!;

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 150);
  skyGrad.addColorStop(0, '#1d4ed8');
  skyGrad.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 150);

  // Green hills & horizon
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 140, 512, 148);

  // Perspective race road
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(210, 140);
  ctx.lineTo(302, 140);
  ctx.lineTo(470, 288);
  ctx.lineTo(42, 288);
  ctx.closePath();
  ctx.fill();

  // Red & white road curbs
  for (let i = 0; i < 6; i++) {
    const y1 = 140 + i * 24;
    const y2 = y1 + 24;
    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#f8fafc';
    ctx.fillRect(200 - i * 26, y1, 16, 22);
    ctx.fillRect(296 + i * 26, y1, 16, 22);
  }

  // Center dashed line
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.setLineDash([16, 14]);
  ctx.beginPath();
  ctx.moveTo(256, 144);
  ctx.lineTo(256, 288);
  ctx.stroke();
  ctx.setLineDash([]);

  // Racing Kart in center foreground
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(220, 215, 72, 38, 10);
  ctx.fill();
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(208, 224, 14, 26);
  ctx.fillRect(290, 224, 14, 26);
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(256, 206, 16, 0, Math.PI * 2);
  ctx.fill();

  // TURBO KART Banner at top
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.beginPath();
  ctx.roundRect(106, 18, 300, 54, 12);
  ctx.fill();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TURBO KART', 256, 56);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function createFloatingPillTexture(
  title: string,
  subtitle: string,
  accentHex: string,
  isSelected: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 520;
  canvas.height = 124;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 520, 124);

  // Dark sleek pill matching the video's floating labels ("Trưởng nhóm SEO", "Nghiên cứu từ khoá")
  ctx.fillStyle = isSelected ? 'rgba(15, 23, 42, 0.96)' : 'rgba(17, 24, 39, 0.88)';
  ctx.beginPath();
  ctx.roundRect(12, 14, 496, 96, 24);
  ctx.fill();

  ctx.lineWidth = isSelected ? 4 : 2.5;
  ctx.strokeStyle = isSelected ? accentHex : 'rgba(255, 255, 255, 0.22)';
  ctx.stroke();

  // Accent dot on left
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.arc(42, 62, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 25px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, 64, 54, 428);

  ctx.fillStyle = '#fde047';
  ctx.font = '600 18px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle.slice(0, 44), 64, 88, 428);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createSpeechBubbleTexture(
  speakerName: string,
  message: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 560;
  canvas.height = 168;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 560, 168);

  // Warm Ivory / High-contrast Speech Bubble with glowing accent border & pointer tail
  ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
  ctx.beginPath();
  ctx.roundRect(14, 10, 532, 126, 24);
  ctx.fill();

  // Speech pointer tail at bottom center
  ctx.beginPath();
  ctx.moveTo(260, 134);
  ctx.lineTo(280, 162);
  ctx.lineTo(300, 134);
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 4.5;
  ctx.strokeStyle = accentHex;
  ctx.beginPath();
  ctx.roundRect(14, 10, 532, 126, 24);
  ctx.stroke();

  // Speaker Header Pill
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.roundRect(30, 22, 220, 30, 12);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = '800 18px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`💬 ${speakerName.slice(0, 20)}`, 42, 43);

  // Wrapped 2-line Vietnamese dialogue message
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 21px "Be Vietnam Pro", "Plus Jakarta Sans", sans-serif';
  const words = message.split(' ');
  let line1 = '';
  let line2 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length <= 42) {
      line1 = (line1 + ' ' + w).trim();
    } else {
      line2 = (line2 + ' ' + w).trim();
    }
  }
  ctx.fillText(line1, 32, 82, 496);
  if (line2) {
    ctx.fillText(line2.length > 46 ? `${line2.slice(0, 44)}...` : line2, 32, 114, 496);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const VirtualOffice3D: React.FC<VirtualOffice3DProps> = ({
  zones,
  agents,
  activeZoneId,
  selectedAgentId,
  tasks,
  isAllHandsMeeting,
  isSocialGathering = false,
  onSelectZone,
  onSelectAgent,
  onActivityStatsChange,
  onActiveDialogueChange
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const propsRef = useRef({
    zones,
    agents,
    activeZoneId,
    selectedAgentId,
    tasks,
    isAllHandsMeeting,
    isSocialGathering,
    onSelectZone,
    onSelectAgent,
    onActivityStatsChange,
    onActiveDialogueChange
  });

  useEffect(() => {
    propsRef.current = {
      zones,
      agents,
      activeZoneId,
      selectedAgentId,
      tasks,
      isAllHandsMeeting,
      isSocialGathering,
      onSelectZone,
      onSelectAgent,
      onActivityStatsChange,
      onActiveDialogueChange
    };
  }, [
    zones,
    agents,
    activeZoneId,
    selectedAgentId,
    tasks,
    isAllHandsMeeting,
    isSocialGathering,
    onSelectZone,
    onSelectAgent,
    onActivityStatsChange,
    onActiveDialogueChange
  ]);

  const cameraGoalRef = useRef<{
    pos: THREE.Vector3;
    target: THREE.Vector3;
    active: boolean;
  }>({
    pos: new THREE.Vector3(-2.4, 16.2, 24.6),
    target: new THREE.Vector3(0.5, -0.2, 1.0),
    active: true
  });

  useEffect(() => {
    if (isSocialGathering) {
      cameraGoalRef.current.pos.set(-0.5, 4.4, 7.8);
      cameraGoalRef.current.target.set(-0.3, 1.15, 2.0);
      cameraGoalRef.current.active = true;
      return;
    }
    const targetZone = zones.find((z) => z.id === activeZoneId);
    if (targetZone) {
      cameraGoalRef.current.pos.set(
        targetZone.cameraPosition.x,
        targetZone.cameraPosition.y,
        targetZone.cameraPosition.z
      );
      cameraGoalRef.current.target.set(
        targetZone.cameraTarget.x,
        targetZone.cameraTarget.y,
        targetZone.cameraTarget.z
      );
      cameraGoalRef.current.active = true;
    }
  }, [activeZoneId, zones, isSocialGathering]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection per threejs/SKILL.md
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);
    scene.fog = new THREE.FogExp2(0x070b12, 0.011);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 160);
    camera.position.set(-2.4, 16.2, 24.6);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    pmremGenerator.dispose();

    // 3. Balanced Warm Interior & Cool Nighttime Pond Lighting
    const hemiLight = new THREE.HemisphereLight(0xffe8cc, 0x0f172a, 0.92);
    hemiLight.position.set(0, 26, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.38);
    keyLight.position.set(12, 24, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 20;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 65;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.48);
    rimLight.position.set(-18, 14, -14);
    scene.add(rimLight);

    // Warm interior point lights over Cafe, Lounge, and Game Zone
    const cafePointLight = new THREE.PointLight(0xffb74d, 1.6, 14);
    cafePointLight.position.set(-8.5, 3.6, 7.2);
    scene.add(cafePointLight);

    const loungePointLight = new THREE.PointLight(0xffe0b2, 1.4, 15);
    loungePointLight.position.set(-1.5, 4.0, -1.8);
    scene.add(loungePointLight);

    const gamePointLight = new THREE.PointLight(0xf472b6, 1.5, 13);
    gamePointLight.position.set(11.5, 3.5, 3.5);
    scene.add(gamePointLight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2.2;
    controls.maxDistance = 44;
    controls.target.set(0.4, 0.2, 0.6);

    controls.addEventListener('start', () => {
      cameraGoalRef.current.active = false;
    });

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const interactables: THREE.Object3D[] = [];

    // Shared PBR Materials
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x181920,
      roughness: 0.35,
      metalness: 0.78
    });
    const whiteDeskMat = new THREE.MeshStandardMaterial({
      color: 0xf4f5f7,
      roughness: 0.32,
      metalness: 0.08
    });
    const warmWoodMat = new THREE.MeshStandardMaterial({
      color: 0x9a6538,
      roughness: 0.52,
      metalness: 0.08
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2f18,
      roughness: 0.58,
      metalness: 0.08
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.88
    });

    // =========================================================================
    // 4. DARK REFLECTIVE WATER POND & LILY PADS AROUND FLOATING OFFICE SLAB
    // =========================================================================
    const waterGeo = new THREE.PlaneGeometry(90, 70);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x091622,
      roughness: 0.14,
      metalness: 0.72
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -0.32, 2);
    scene.add(waterMesh);

    // Lily pads with realistic V-notch and lotus blossoms floating in front & right water
    const lilyPadGeo = new THREE.CylinderGeometry(
      0.52,
      0.52,
      0.025,
      20,
      1,
      false,
      0.28,
      Math.PI * 1.84
    );
    const lilyMat1 = new THREE.MeshStandardMaterial({
      color: 0x2d6a3e,
      roughness: 0.65,
      metalness: 0.05
    });
    const lilyMat2 = new THREE.MeshStandardMaterial({
      color: 0x3b824e,
      roughness: 0.6,
      metalness: 0.05
    });
    const lotusMat = new THREE.MeshStandardMaterial({
      color: 0xf9a8d4,
      emissive: 0xbe185d,
      emissiveIntensity: 0.25,
      roughness: 0.4
    });

    const lilyPositions: [number, number, number, boolean][] = [
      [-15.2, 13.0, 0.9, true],
      [-14.1, 13.8, 0.65, false],
      [-11.8, 12.8, 1.05, false],
      [-10.4, 14.2, 0.8, true],
      [-8.6, 13.1, 0.7, false],
      [-6.5, 14.5, 1.1, false],
      [-5.1, 13.3, 0.85, true],
      [-3.2, 12.7, 0.95, false],
      [-1.8, 14.1, 0.75, false],
      [0.4, 13.2, 1.0, true],
      [1.9, 14.6, 0.68, false],
      [3.5, 12.9, 0.9, false],
      [5.4, 13.7, 1.12, true],
      [7.1, 12.6, 0.78, false],
      [8.9, 14.3, 0.95, false],
      [10.8, 13.1, 0.82, true],
      [12.4, 14.0, 1.05, false],
      [14.2, 12.8, 0.72, false],
      [16.0, 13.6, 0.92, true],
      [18.2, 12.2, 0.88, false],
      [18.8, 9.8, 1.04, true],
      [19.5, 7.6, 0.75, false],
      [18.4, 5.2, 0.92, false],
      [19.2, 2.8, 0.8, true],
      [18.5, 0.4, 1.08, false],
      [19.6, -2.4, 0.7, false],
      [18.3, -5.2, 0.95, true],
      [19.1, -8.0, 0.82, false]
    ];

    lilyPositions.forEach(([lx, lz, scale, hasFlower], idx) => {
      const padGroup = new THREE.Group();
      padGroup.position.set(lx, -0.3, lz);
      padGroup.rotation.y = (idx * 1.7) % (Math.PI * 2);
      padGroup.scale.setScalar(scale);

      const pad = new THREE.Mesh(
        lilyPadGeo,
        idx % 2 === 0 ? lilyMat1 : lilyMat2
      );
      padGroup.add(pad);

      if (hasFlower) {
        const flower = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.16, 7),
          lotusMat
        );
        flower.position.set(0.05, 0.08, 0.05);
        padGroup.add(flower);
      }

      scene.add(padGroup);
    });

    // =========================================================================
    // 5. FLOATING ARCHITECTURAL OFFICE SLAB & PERIMETER PLANTER TROUGHS
    // =========================================================================
    const floorTex = createDarkFloorTexture(maxAniso);
    const mainSlabGeo = new THREE.BoxGeometry(34.4, 0.36, 23.2);
    const mainSlabMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: floorTex,
      roughness: 0.68,
      metalness: 0.12
    });
    const mainSlab = new THREE.Mesh(mainSlabGeo, mainSlabMat);
    mainSlab.position.set(0, -0.18, 0);
    mainSlab.receiveShadow = true;
    scene.add(mainSlab);

    // Helper: Lush Multi-Leaf Tropical Office Plant
    const foliageMatDark = new THREE.MeshStandardMaterial({
      color: 0x1e4d2b,
      roughness: 0.48
    });
    const foliageMatMid = new THREE.MeshStandardMaterial({
      color: 0x2e6f40,
      roughness: 0.42
    });
    const foliageMatLight = new THREE.MeshStandardMaterial({
      color: 0x4ca65b,
      roughness: 0.38
    });
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x7c3f23,
      roughness: 0.6
    });

    function createTropicalPlant(scale = 1.0, withPot = true): THREE.Group {
      const plant = new THREE.Group();
      plant.scale.setScalar(scale);

      if (withPot) {
        const pot = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.18, 0.34, 12),
          potMat
        );
        pot.position.y = 0.17;
        plant.add(pot);
      }

      const baseH = withPot ? 0.32 : 0.08;
      const leafCount = 7;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 10, 8),
          i % 3 === 0
            ? foliageMatLight
            : i % 2 === 0
            ? foliageMatMid
            : foliageMatDark
        );
        leaf.scale.set(0.65, 0.18, 1.45);
        leaf.position.set(
          Math.cos(angle) * 0.22,
          baseH + 0.18 + (i % 3) * 0.08,
          Math.sin(angle) * 0.22
        );
        leaf.rotation.y = -angle + Math.PI / 2;
        leaf.rotation.x = 0.35;
        plant.add(leaf);
      }

      return plant;
    }

    // Front Planter Ledge & Right Planter Ledge (matching the video's lush green border)
    function createPlanterBox(
      x: number,
      z: number,
      w: number,
      d: number,
      plantCount: number
    ): THREE.Group {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const box = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.42, d),
        darkMetalMat
      );
      box.position.y = 0.21;
      box.castShadow = true;
      group.add(box);

      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(w - 0.12, 0.06, d - 0.12),
        darkWoodMat
      );
      soil.position.y = 0.41;
      group.add(soil);

      const isHorizontal = w >= d;
      for (let i = 0; i < plantCount; i++) {
        const t = plantCount === 1 ? 0 : (i / (plantCount - 1)) - 0.5;
        const p = createTropicalPlant(0.85 + (i % 3) * 0.18, i % 2 === 0);
        p.position.set(
          isHorizontal ? t * (w - 1.1) : 0,
          0.38,
          isHorizontal ? 0 : t * (d - 1.1)
        );
        group.add(p);
      }

      // Warm glowing floor spotlight discs in planter
      const spotMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      [-0.32, 0.32].forEach((offset) => {
        const spot = new THREE.Mesh(
          new THREE.CircleGeometry(0.11, 12),
          spotMat
        );
        spot.rotation.x = -Math.PI / 2;
        spot.position.set(
          isHorizontal ? offset * w : 0,
          0.45,
          isHorizontal ? 0 : offset * d
        );
        group.add(spot);
      });

      return group;
    }

    // Front planter boxes along z = 11.15
    scene.add(createPlanterBox(-11.2, 11.15, 9.8, 0.85, 6));
    scene.add(createPlanterBox(0.2, 11.15, 7.6, 0.85, 5));
    scene.add(createPlanterBox(10.8, 11.15, 9.8, 0.85, 6));
    // Right planter boxes along x = 16.65
    scene.add(createPlanterBox(16.65, 5.5, 0.85, 9.5, 5));
    scene.add(createPlanterBox(16.65, -5.2, 0.85, 9.5, 5));

    // =========================================================================
    // 6. ORGANIC ROUNDED COLORED RUGS & 3D EXTRUDED FLOOR TYPOGRAPHY
    // =========================================================================
    function createRoundedRugMesh(
      width: number,
      depth: number,
      radius: number,
      colorHex: string,
      zoneId?: ZoneId
    ): THREE.Mesh {
      const shape = new THREE.Shape();
      const hw = width / 2;
      const hd = depth / 2;
      const r = Math.min(radius, hw * 0.48, hd * 0.48);

      shape.moveTo(-hw + r, -hd);
      shape.lineTo(hw - r, -hd);
      shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
      shape.lineTo(hw, hd - r);
      shape.quadraticCurveTo(hw, hd, hw - r, hd);
      shape.lineTo(-hw + r, hd);
      shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
      shape.lineTo(-hw, -hd + r);
      shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.032,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.01
      });
      geo.rotateX(Math.PI / 2);

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.82,
        metalness: 0.04
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = 0.035;
      mesh.receiveShadow = true;
      if (zoneId) {
        mesh.userData = { type: 'zone', zoneId };
        interactables.push(mesh);
      }
      return mesh;
    }

    const fontRefreshCallbacks: (() => void)[] = [];

    function addFloorLabel(
      text: string,
      x: number,
      z: number,
      colorHex: string,
      width = 5.4,
      rotY = 0
    ) {
      const tex = createFloor3DLettersTexture(text, colorHex, maxAniso);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false
      });
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(width, width * 0.18),
        mat
      );
      plane.rotation.x = -Math.PI / 2;
      plane.rotation.z = rotY;
      plane.position.set(x, 0.052, z);
      scene.add(plane);

      fontRefreshCallbacks.push(() => {
        const old = mat.map;
        mat.map = createFloor3DLettersTexture(text, colorHex, maxAniso);
        mat.needsUpdate = true;
        if (old) old.dispose();
      });
    }

    // A. KỸ THUẬT · THIẾT KẾ Sage Green Rug (Mid-Left)
    const techRug = createRoundedRugMesh(8.6, 5.4, 2.2, '#5c7c52', 'design_tech');
    techRug.position.set(-8.5, 0.035, 1.4);
    techRug.rotation.y = -0.06;
    scene.add(techRug);
    addFloorLabel('K Ỹ   T H U Ậ T', -8.0, 4.35, '#8fb382', 5.2, 0.05);

    // B. SEO · AEO / CSKH BÁO GIÁ Forest Green Rug (Front-Center-Right)
    const seoRug = createRoundedRugMesh(8.4, 5.6, 2.1, '#265838', 'sales_quoting');
    seoRug.position.set(3.8, 0.035, 5.2);
    seoRug.rotation.y = 0.04;
    scene.add(seoRug);
    addFloorLabel('S E O   ·   A E O', 4.6, 8.35, '#599870', 5.2, -0.04);

    // C. KẾ TOÁN & ĐIỀU PHỐI Lavender Purple Rug (Back-Center-Right)
    const accRug = createRoundedRugMesh(8.2, 5.2, 2.0, '#6c47ff', 'accounting');
    accRug.position.set(5.5, 0.035, -4.2);
    scene.add(accRug);

    // D. GAME ZONE Coral / Terracotta Rug (Far-Right Front)
    const gameRug = createRoundedRugMesh(8.6, 6.4, 2.4, '#b35c52', 'coworking');
    gameRug.position.set(11.6, 0.035, 3.6);
    scene.add(gameRug);

    // E. CÀ PHÊ Warm Wood Floor Zone (Front-Left)
    const cafeWoodTex = createWoodParquetTexture(maxAniso);
    const cafeFloor = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.03, 5.4),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: cafeWoodTex,
        roughness: 0.55
      })
    );
    cafeFloor.position.set(-8.8, 0.018, 7.6);
    cafeFloor.receiveShadow = true;
    cafeFloor.userData = { type: 'zone', zoneId: 'lobby' };
    interactables.push(cafeFloor);
    scene.add(cafeFloor);
    addFloorLabel('C À   P H Ê', -2.2, 8.6, '#a67c52', 4.2, -0.1);

    // F. Back-Left Glass Room Blue Carpet (Meeting & Executive Room)
    const meetingRug = createRoundedRugMesh(9.2, 5.8, 0.6, '#2b3984', 'meeting');
    meetingRug.position.set(-10.6, 0.035, -6.2);
    scene.add(meetingRug);

    // =========================================================================
    // 7. HANGING WARM CONE PENDANT LIGHTS & 4-DESK WORKSTATION CLUSTERS
    // =========================================================================
    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: 0xd9a05b,
      roughness: 0.4,
      metalness: 0.3
    });
    const lampBulbMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0
    });
    const lightConeMat = new THREE.MeshBasicMaterial({
      color: 0xffe8a3,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    function createHangingPendantLight(x: number, z: number, y = 3.25): THREE.Group {
      const lamp = new THREE.Group();
      lamp.position.set(x, y, z);

      // Ceiling cord
      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 1.4, 6),
        darkMetalMat
      );
      cord.position.y = 0.7;
      lamp.add(cord);

      // Conical warm brass shade
      const shade = new THREE.Mesh(
        new THREE.ConeGeometry(0.36, 0.26, 16),
        lampShadeMat
      );
      lamp.add(shade);

      // Glowing inner bulb
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 10, 8),
        lampBulbMat
      );
      bulb.position.y = -0.08;
      lamp.add(bulb);

      // Subtle volumetric light cone
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(1.45, 2.6, 16, 1, true),
        lightConeMat
      );
      cone.position.y = -1.35;
      lamp.add(cone);

      return lamp;
    }

    function createOfficeChair(rotY = 0): THREE.Group {
      const chair = new THREE.Group();
      chair.rotation.y = rotY;

      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.07, 0.52),
        whiteDeskMat
      );
      seat.position.y = 0.46;

      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.54, 0.06),
        whiteDeskMat
      );
      back.position.set(0, 0.75, -0.23);

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8),
        chromeMat
      );
      post.position.y = 0.22;

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.03, 5),
        darkMetalMat
      );
      base.position.y = 0.03;

      chair.add(seat, back, post, base);
      return chair;
    }

    // 4-Desk Modern White Workstation Cluster (matching video's white desk islands)
    function createWorkstationCluster4(
      x: number,
      z: number,
      screenAccentHex: string,
      hasTrellisFrame = false
    ): THREE.Group {
      const cluster = new THREE.Group();
      cluster.position.set(x, 0, z);

      // Main 4-person table surface (3.6m x 1.7m)
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.07, 1.7),
        whiteDeskMat
      );
      deskTop.position.y = 0.74;
      deskTop.castShadow = true;
      deskTop.receiveShadow = true;
      cluster.add(deskTop);

      // Center privacy divider screen
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.36, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 })
      );
      divider.position.set(0, 0.94, 0);
      cluster.add(divider);

      // Desk legs
      [-1.65, 0, 1.65].forEach((lx) => {
        [-0.75, 0.75].forEach((lz) => {
          const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.72, 0.06),
            darkMetalMat
          );
          leg.position.set(lx, 0.36, lz);
          cluster.add(leg);
        });
      });

      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: screenAccentHex,
        emissiveIntensity: 0.35,
        roughness: 0.2
      });

      // 4 Workstations (2 on North side, 2 on South side)
      [-0.95, 0.95].forEach((dx) => {
        [-1, 1].forEach((side) => {
          // Monitor
          const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(0.68, 0.42, 0.04),
            darkMetalMat
          );
          monitor.position.set(dx, 1.06, side * 0.22);

          const display = new THREE.Mesh(
            new THREE.BoxGeometry(0.62, 0.36, 0.045),
            screenMat
          );
          display.position.set(dx, 1.06, side * 0.225);

          const stand = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.16, 0.08),
            chromeMat
          );
          stand.position.set(dx, 0.82, side * 0.2);

          // Keyboard
          const kb = new THREE.Mesh(
            new THREE.BoxGeometry(0.34, 0.02, 0.12),
            darkMetalMat
          );
          kb.position.set(dx, 0.78, side * 0.52);

          // Chair
          const chair = createOfficeChair(side > 0 ? Math.PI : 0);
          chair.position.set(dx, 0, side * 1.12);

          cluster.add(monitor, display, stand, kb, chair);
        });
      });

      // Small potted plant at desk end
      const endPlant = createTropicalPlant(0.75, true);
      endPlant.position.set(-2.15, 0, 0);
      cluster.add(endPlant);

      // 2 Warm Hanging Pendant Lamps above the cluster
      cluster.add(createHangingPendantLight(-0.9, 0, 3.1));
      cluster.add(createHangingPendantLight(0.9, 0, 3.1));

      // Optional Black Open Frame Pergola / Trellis (for the front SEO · AEO / CSKH cluster)
      if (hasTrellisFrame) {
        const frameGroup = new THREE.Group();
        [-1.9, 1.9].forEach((px) => {
          [-1.0, 1.0].forEach((pz) => {
            const post = new THREE.Mesh(
              new THREE.BoxGeometry(0.07, 2.8, 0.07),
              darkMetalMat
            );
            post.position.set(px, 1.4, pz);
            frameGroup.add(post);
          });
        });
        // Top crossbars
        [-1.0, 1.0].forEach((pz) => {
          const beam = new THREE.Mesh(
            new THREE.BoxGeometry(3.9, 0.07, 0.07),
            darkMetalMat
          );
          beam.position.set(0, 2.8, pz);
          frameGroup.add(beam);
        });
        [-1.9, 0, 1.9].forEach((px) => {
          const cross = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.07, 2.1),
            darkMetalMat
          );
          cross.position.set(px, 2.8, 0);
          frameGroup.add(cross);
        });
        // Hanging vine plants on top of trellis
        const vine1 = createTropicalPlant(0.55, false);
        vine1.position.set(-1.5, 2.75, 0.9);
        const vine2 = createTropicalPlant(0.55, false);
        vine2.position.set(1.5, 2.75, 0.9);
        frameGroup.add(vine1, vine2);

        cluster.add(frameGroup);
      }

      return cluster;
    }

    // Place the workstation clusters matching the video
    scene.add(createWorkstationCluster4(-8.8, 1.3, '#facc15', false)); // Kỹ Thuật / Thiết Kế
    scene.add(createWorkstationCluster4(3.6, 5.2, '#38bdf8', true));   // SEO · AEO / CSKH Báo Giá
    scene.add(createWorkstationCluster4(5.5, -4.2, '#a855f7', false)); // Kế Toán / Điều Phối
    scene.add(createWorkstationCluster4(-10.6, -6.2, '#60a5fa', false)); // Back-Left Glass Room

    // =========================================================================
    // 8. CÀ PHÊ BAR, NEON SIGN & BISTRO TABLES (FRONT-LEFT)
    // =========================================================================
    function createCafeZoneGroup(): THREE.Group {
      const cafe = new THREE.Group();
      cafe.position.set(-11.8, 0, 7.6);

      // Slatted wooden bar counter
      const barBase = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 1.05, 0.95),
        warmWoodMat
      );
      barBase.position.set(0, 0.525, 0.6);
      barBase.castShadow = true;
      cafe.add(barBase);

      // Vertical wooden slats on front of counter
      for (let i = -9; i <= 9; i++) {
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.98, 0.04),
          darkWoodMat
        );
        slat.position.set(i * 0.22, 0.52, 1.08);
        cafe.add(slat);
      }

      // White stone countertop
      const barTop = new THREE.Mesh(
        new THREE.BoxGeometry(4.55, 0.08, 1.08),
        whiteDeskMat
      );
      barTop.position.set(0, 1.08, 0.6);
      cafe.add(barTop);

      // Chrome Dual-Group Espresso Machine
      const espresso = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.52, 0.52),
        chromeMat
      );
      espresso.position.set(-1.1, 1.36, 0.55);
      cafe.add(espresso);

      // Coffee Grinder & Cup Stacks
      const grinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 0.48, 12),
        darkMetalMat
      );
      grinder.position.set(-0.35, 1.34, 0.55);
      cafe.add(grinder);

      // Pastry Display Case
      const pastryCase = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.46, 0.5),
        new THREE.MeshPhysicalMaterial({
          color: 0xfef3c7,
          transparent: true,
          opacity: 0.55,
          roughness: 0.1
        })
      );
      pastryCase.position.set(0.95, 1.34, 0.55);
      cafe.add(pastryCase);

      // 3 High Barstools in front of counter
      [-1.3, 0, 1.3].forEach((sx) => {
        const stool = new THREE.Group();
        stool.position.set(sx, 0, 1.55);
        const cushion = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 0.08, 14),
          warmWoodMat
        );
        cushion.position.y = 0.72;
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.16, 0.7, 10),
          darkMetalMat
        );
        leg.position.y = 0.35;
        stool.add(cushion, leg);
        cafe.add(stool);
      });

      // Back Partition Frame + Glowing "CÀ PHÊ" Neon Sign
      const signFrame = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 2.5, 0.12),
        darkMetalMat
      );
      signFrame.position.set(0, 1.25, -1.25);
      cafe.add(signFrame);

      const cafeSignTex = createNeonSignTexture(
        'CÀ PHÊ',
        '#27171c',
        '#f472b6',
        '#fef08a',
        '#f472b6',
        maxAniso
      );
      const cafeSignMat = new THREE.MeshBasicMaterial({ map: cafeSignTex });
      const cafeSignBoard = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 0.86, 0.14),
        cafeSignMat
      );
      cafeSignBoard.position.set(0, 2.35, -1.18);
      cafe.add(cafeSignBoard);

      fontRefreshCallbacks.push(() => {
        const old = cafeSignMat.map;
        cafeSignMat.map = createNeonSignTexture(
          'CÀ PHÊ',
          '#27171c',
          '#f472b6',
          '#fef08a',
          '#f472b6',
          maxAniso
        );
        cafeSignMat.needsUpdate = true;
        if (old) old.dispose();
      });

      // 2 Round Bistro Tables with 4 Chairs & Coffee Cups (to the right of the bar)
      [5.8, 9.2].forEach((tx) => {
        const bistro = new THREE.Group();
        bistro.position.set(tx, 0, 0.2);

        const roundTop = new THREE.Mesh(
          new THREE.CylinderGeometry(0.78, 0.78, 0.06, 20),
          warmWoodMat
        );
        roundTop.position.y = 0.74;
        roundTop.castShadow = true;

        const ped = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.28, 0.72, 12),
          darkMetalMat
        );
        ped.position.y = 0.36;

        // 2 Coffee Mugs on table
        [-0.24, 0.24].forEach((cx) => {
          const mug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.05, 0.11, 10),
            whiteDeskMat
          );
          mug.position.set(cx, 0.82, 0.12);
          bistro.add(mug);
        });

        // 3 Cafe Chairs around table
        [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((ang) => {
          const c = new THREE.Group();
          c.position.set(Math.cos(ang) * 1.05, 0, Math.sin(ang) * 1.05);
          c.lookAt(0, 0, 0);
          const cSeat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.06, 14),
            warmWoodMat
          );
          cSeat.position.y = 0.45;
          const cBack = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.38, 0.05),
            warmWoodMat
          );
          cBack.position.set(0, 0.68, -0.2);
          const cLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.18, 0.44, 8),
            darkMetalMat
          );
          cLeg.position.y = 0.22;
          c.add(cSeat, cBack, cLeg);
          bistro.add(c);
        });

        bistro.add(roundTop, ped);
        cafe.add(bistro);
      });

      return cafe;
    }
    scene.add(createCafeZoneGroup());

    // =========================================================================
    // 9. CENTRAL CIRCULAR LOUNGE PIT (CURVED WHITE SOFA & ORANGE ARMCHAIRS)
    // =========================================================================
    function createCentralLoungeGroup(): THREE.Group {
      const lounge = new THREE.Group();
      lounge.position.set(-1.5, 0, -1.8);

      // Circular dark rug with warm border ring
      const circleRug = new THREE.Mesh(
        new THREE.CylinderGeometry(3.2, 3.2, 0.03, 36),
        new THREE.MeshStandardMaterial({ color: 0x1e2028, roughness: 0.85 })
      );
      circleRug.position.y = 0.02;
      circleRug.receiveShadow = true;
      lounge.add(circleRug);

      // Curved White Modular Sofa (arc of 6 segments along back-left)
      for (let i = 0; i < 6; i++) {
        const ang = Math.PI * 0.72 + i * 0.28;
        const seg = new THREE.Group();
        seg.position.set(Math.cos(ang) * 2.25, 0, Math.sin(ang) * 2.25);
        seg.lookAt(0, 0, 0);

        const base = new THREE.Mesh(
          new THREE.BoxGeometry(0.78, 0.42, 0.76),
          whiteDeskMat
        );
        base.position.y = 0.21;
        base.castShadow = true;

        const backRest = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.48, 0.22),
          whiteDeskMat
        );
        backRest.position.set(0, 0.56, -0.27);
        backRest.castShadow = true;

        seg.add(base, backRest);
        lounge.add(seg);
      }

      // 3 Red-Orange Barrel Armchairs
      const armchairMat = new THREE.MeshStandardMaterial({
        color: 0xd94826,
        roughness: 0.55
      });
      [-0.4, 0.35, 1.1].forEach((ang) => {
        const chair = new THREE.Group();
        chair.position.set(Math.cos(ang) * 1.95, 0, Math.sin(ang) * 1.95);
        chair.lookAt(0, 0, 0);

        const seat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.38, 0.4, 16),
          armchairMat
        );
        seat.position.y = 0.22;
        const back = new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.44,
            0.42,
            0.42,
            16,
            1,
            false,
            Math.PI * 0.6,
            Math.PI * 0.8
          ),
          armchairMat
        );
        back.position.y = 0.52;
        chair.add(seat, back);
        lounge.add(chair);
      });

      // Center Round Dark Coffee Table
      const coffeeTable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 0.36, 24),
        darkMetalMat
      );
      coffeeTable.position.y = 0.18;
      coffeeTable.castShadow = true;
      lounge.add(coffeeTable);

      // Center decorative bonsai/plant on coffee table
      const tablePlant = createTropicalPlant(0.48, true);
      tablePlant.position.y = 0.36;
      lounge.add(tablePlant);

      return lounge;
    }
    scene.add(createCentralLoungeGroup());

    // =========================================================================
    // 10. GAME ZONE (TURBO KART TV, NEON SIGN, RED SOFA & ARCADE CABINETS)
    // =========================================================================
    function createGameZoneGroup(): THREE.Group {
      const gz = new THREE.Group();
      gz.position.set(11.4, 0, 3.6);

      // Media Wall & TV Stand at north side of Game Zone
      const mediaStand = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.52, 0.65),
        darkMetalMat
      );
      mediaStand.position.set(-1.1, 0.26, -2.1);
      gz.add(mediaStand);

      // Large Widescreen TV displaying TURBO KART
      const tvFrame = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 1.85, 0.1),
        darkMetalMat
      );
      tvFrame.position.set(-1.1, 1.55, -2.1);
      gz.add(tvFrame);

      const turboKartTex = createTurboKartScreenTexture(maxAniso);
      const tvScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(3.04, 1.7),
        new THREE.MeshBasicMaterial({ map: turboKartTex })
      );
      tvScreen.position.set(-1.1, 1.55, -2.04);
      gz.add(tvScreen);

      // Glowing Pink Neon "GAME ZONE" Sign above TV
      const gzSignTex = createNeonSignTexture(
        'GAME ZONE',
        '#2e1026',
        '#f472b6',
        '#fbcfe8',
        '#ec4899',
        maxAniso
      );
      const gzSign = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.76, 0.12),
        new THREE.MeshBasicMaterial({ map: gzSignTex })
      );
      gzSign.position.set(-1.1, 2.95, -2.08);
      gz.add(gzSign);

      // Red Gaming Sofa facing the TV
      const redSofaMat = new THREE.MeshStandardMaterial({
        color: 0xc83e2b,
        roughness: 0.55
      });
      const sofaSeat = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.42, 0.9),
        redSofaMat
      );
      sofaSeat.position.set(-1.1, 0.21, 0.85);
      sofaSeat.castShadow = true;

      const sofaBack = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.52, 0.24),
        redSofaMat
      );
      sofaBack.position.set(-1.1, 0.58, 1.18);
      gz.add(sofaSeat, sofaBack);

      // Low gaming coffee table
      const gameTable = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.34, 0.7),
        darkMetalMat
      );
      gameTable.position.set(-1.1, 0.17, -0.35);
      gz.add(gameTable);

      // 2 Glowing Arcade Cabinets + 1 Glowing Blue Machine on the right
      const arcadeConfigs = [
        { x: 1.5, z: 1.3, bodyColor: 0x3b0764, neonColor: 0xd946ef },
        { x: 2.6, z: 1.3, bodyColor: 0x451a03, neonColor: 0xfacc15 },
        { x: 2.9, z: -0.9, bodyColor: 0x0c4a6e, neonColor: 0x38bdf8 }
      ];

      arcadeConfigs.forEach((cfg, idx) => {
        const cab = new THREE.Group();
        cab.position.set(cfg.x, 0, cfg.z);
        cab.rotation.y = idx === 2 ? -Math.PI / 2 : 0;

        const hull = new THREE.Mesh(
          new THREE.BoxGeometry(0.88, 1.95, 0.82),
          new THREE.MeshStandardMaterial({
            color: cfg.bodyColor,
            roughness: 0.35,
            metalness: 0.3
          })
        );
        hull.position.y = 0.975;
        hull.castShadow = true;

        const screen = new THREE.Mesh(
          new THREE.BoxGeometry(0.72, 0.62, 0.06),
          new THREE.MeshBasicMaterial({ color: cfg.neonColor })
        );
        screen.position.set(0, 1.28, 0.4);

        const marquee = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 0.24, 0.08),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        marquee.position.set(0, 1.8, 0.4);

        cab.add(hull, screen, marquee);
        gz.add(cab);
      });

      return gz;
    }
    scene.add(createGameZoneGroup());

    // =========================================================================
    // 11. BACK GLASS CURTAIN WALLS, GLASS ROOM PARTITIONS & WOOD BOOKSHELVES
    // =========================================================================
    const glassWallMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      roughness: 0.12,
      metalness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.78,
      transparent: true,
      opacity: isSoftwareGl ? 0.24 : 1,
      depthWrite: false
    });

    function createGlassWallSegment(
      x: number,
      z: number,
      length: number,
      rotY = 0
    ): THREE.Group {
      const wall = new THREE.Group();
      wall.position.set(x, 0, z);
      wall.rotation.y = rotY;

      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(length, 2.9, 0.06),
        glassWallMat
      );
      glass.position.y = 1.45;
      glass.renderOrder = 2;
      wall.add(glass);

      // Top & bottom black frame rails
      [0.04, 2.88].forEach((ry) => {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(length, 0.07, 0.09),
          darkMetalMat
        );
        rail.position.y = ry;
        wall.add(rail);
      });

      // Vertical mullions every ~2.2m
      const cols = Math.max(2, Math.round(length / 2.2));
      for (let i = 0; i <= cols; i++) {
        const mx = -length / 2 + (i / cols) * length;
        const mullion = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 2.9, 0.09),
          darkMetalMat
        );
        mullion.position.set(mx, 1.45, 0);
        wall.add(mullion);
      }

      return wall;
    }

    // Back-left glass room enclosure
    scene.add(createGlassWallSegment(-10.6, -3.2, 9.2, 0));
    scene.add(createGlassWallSegment(-6.0, -6.2, 6.0, Math.PI / 2));
    // Back perimeter wall & glass partitions
    scene.add(createGlassWallSegment(-15.8, -6.2, 6.0, Math.PI / 2));
    scene.add(createGlassWallSegment(0, -10.8, 32.0, 0));

    // Warm Lit Wooden Bookshelves along the back wall
    function createBookshelfUnit(x: number, z: number, rotY = 0): THREE.Group {
      const shelf = new THREE.Group();
      shelf.position.set(x, 0, z);
      shelf.rotation.y = rotY;

      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 2.35, 0.42),
        warmWoodMat
      );
      frame.position.y = 1.175;
      frame.castShadow = true;
      shelf.add(frame);

      const bookColors = [0xf59e0b, 0x38bdf8, 0xec4899, 0x10b981, 0xf8fafc];
      for (let row = 0; row < 4; row++) {
        const yRow = 0.42 + row * 0.48;
        // Warm shelf LED strip
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(1.95, 0.04, 0.38),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        strip.position.set(0, yRow + 0.18, 0.04);
        shelf.add(strip);

        for (let b = 0; b < 5; b++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.26, 0.3, 0.32),
            new THREE.MeshStandardMaterial({
              color: bookColors[(row + b) % bookColors.length],
              roughness: 0.45
            })
          );
          book.position.set(-0.72 + b * 0.36, yRow, 0.05);
          shelf.add(book);
        }
      }

      return shelf;
    }

    [-13.5, -8.2, -2.5, 2.8, 8.2, 13.2].forEach((bx) => {
      scene.add(createBookshelfUnit(bx, -10.4, 0));
    });

    // =========================================================================
    // 12. 5 HIGH-DETAIL DORAEMON LEADERS + 12 AGENCY STAFF (17 NHÂN SỰ TOTAL)
    // =========================================================================
    const agentRigs: AgentActorRig[] = [];
    const npcRigs: AutonomousNpcRig[] = [];

    // Contact shadow texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0,0,0,0.68)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const contactShadowTex = new THREE.CanvasTexture(shadowCanvas);

    // Patrol & social visiting routes for the 5 Doraemon leaders
    const agentPatrolRoutes: Record<string, THREE.Vector3[]> = {
      shizuka: [
        new THREE.Vector3(2.2, 0, 6.2),
        new THREE.Vector3(-1.1, 0, 2.1),
        new THREE.Vector3(-3.8, 0, 6.8),
        new THREE.Vector3(0.5, 0, 2.4),
        new THREE.Vector3(2.2, 0, 6.2)
      ],
      suneo: [
        new THREE.Vector3(5.2, 0, -3.2),
        new THREE.Vector3(0.9, 0, -0.8),
        new THREE.Vector3(3.4, 0, 0.6),
        new THREE.Vector3(1.8, 0, -1.6),
        new THREE.Vector3(5.2, 0, -3.2)
      ],
      nobita: [
        new THREE.Vector3(-7.2, 0, 1.8),
        new THREE.Vector3(-2.5, 0, 2.1),
        new THREE.Vector3(-4.8, 0, 3.6),
        new THREE.Vector3(-5.6, 0, 1.8),
        new THREE.Vector3(-7.2, 0, 1.8)
      ],
      chaian: [
        new THREE.Vector3(5.5, 0, 4.5),
        new THREE.Vector3(1.8, 0, 4.6),
        new THREE.Vector3(8.2, 0, 3.8),
        new THREE.Vector3(4.8, 0, 0.6),
        new THREE.Vector3(5.5, 0, 4.5)
      ],
      doraemon: [
        new THREE.Vector3(-3.2, 0, -2.2),
        new THREE.Vector3(-0.6, 0, -0.8),
        new THREE.Vector3(-4.2, 0, 1.8),
        new THREE.Vector3(-0.2, 0, 1.5),
        new THREE.Vector3(-3.2, 0, -2.2)
      ]
    };

    propsRef.current.agents.forEach((agent, idx) => {
      const root = new THREE.Group();
      root.position.set(agent.homePosition.x, 0, agent.homePosition.z);

      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.65, 20),
        new THREE.MeshBasicMaterial({
          map: contactShadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.75
        })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.04;
      root.add(shadowDisc);

      const ringGeo = new THREE.RingGeometry(0.52, 0.68, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const statusRing = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({
          color: agent.accentHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          depthWrite: false
        })
      );
      statusRing.position.y = 0.045;
      root.add(statusRing);

      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      const builtParts = buildDetailedDoraemonCharacter(agent, bodyGroup);
      const {
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        headGroup,
        tailGroup,
        propellerGroup,
        eyeGroups,
        interactableMeshes
      } = builtParts;

      interactableMeshes.forEach((m) => {
        m.userData = { type: 'agent', agentId: agent.id };
        interactables.push(m);
      });

      const hitProxy = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 2.2, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitProxy.position.y = 1.1;
      hitProxy.userData = { type: 'agent', agentId: agent.id };
      interactables.push(hitProxy);
      root.add(hitProxy);

      const shortRoleMap: Record<string, string> = {
        sales_quoting: 'Trưởng nhóm CSKH & Báo giá',
        accounting: 'Trưởng nhóm Kế toán',
        design_tech: 'Kỹ thuật & Thiết kế CMYK',
        marketing: 'Trưởng nhóm SEO · Marketing',
        hr_ops: 'Trưởng phòng Quản lý chung'
      };

      const initBadgeTex = createFloatingPillTexture(
        shortRoleMap[agent.departmentId] || agent.name,
        `${agent.name} · Trực tiếp`,
        agent.accentHex,
        agent.id === propsRef.current.selectedAgentId
      );
      const spriteMat = new THREE.SpriteMaterial({
        map: initBadgeTex,
        transparent: true,
        depthWrite: false
      });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.position.set(0, 2.38, 0);
      labelSprite.scale.set(1.85, 0.44, 1);
      root.add(labelSprite);

      // 3D Floating Speech Bubble above the character when conversing
      const initChatTex = createSpeechBubbleTexture(
        agent.name.split(' ')[0],
        'Sẵn sàng phối hợp!',
        agent.accentHex
      );
      const chatBubbleSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: initChatTex,
          transparent: true,
          depthWrite: false
        })
      );
      chatBubbleSprite.position.set(0, 2.98, 0);
      chatBubbleSprite.scale.set(2.35, 0.72, 1);
      chatBubbleSprite.visible = false;
      root.add(chatBubbleSprite);

      bodyGroup.lookAt(
        agent.workstationLookAt.x,
        0,
        agent.workstationLookAt.z
      );

      scene.add(root);

      agentRigs.push({
        agent,
        root,
        bodyGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        headGroup,
        tailGroup,
        propellerGroup,
        eyeGroups,
        statusRing,
        labelSprite,
        chatBubbleSprite,
        lastBadgeText: '',
        lastChatText: '',
        patrolWaypoints: agentPatrolRoutes[agent.characterKey] || [
          new THREE.Vector3(agent.homePosition.x, 0, agent.homePosition.z)
        ],
        patrolIndex: 0,
        patrolWaitTimer: idx * 1.4
      });
    });

    // Helper: Build 12 Lifelike Sculpted Agency Staff Members (so total staff = 17 nhân sự!)
    function createAgencyStaffMember(
      config: {
        id: string;
        roleLabel: string;
        characterName?: string;
        characterKey?: DoraemonCharacterKey;
        departmentLabel?: string;
        slashCommand?: string;
        accentHex?: string;
        suitColor: number;
        pantsColor: number;
        hairColor: number;
        isFemale: boolean;
        mode: 'seated_work' | 'seated_cafe' | 'seated_game' | 'walker';
        startPos: [number, number, number];
        lookAtPos: [number, number, number];
        partnerLookAt?: [number, number, number];
        chatLines?: string[];
        waypoints?: { pos: [number, number, number]; activity: 'cafe' | 'game' | 'work' | 'walk' }[];
        showFloatingLabel?: boolean;
      },
      staffIndex: number
    ): AutonomousNpcRig {
      const root = new THREE.Group();
      root.position.set(config.startPos[0], config.startPos[1], config.startPos[2]);

      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.46, 16),
        new THREE.MeshBasicMaterial({
          map: contactShadowTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.6
        })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.035;
      root.add(shadowDisc);

      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      const { leftLeg, rightLeg, leftArm, rightArm, head } =
        buildDetailedAgencyStaffCharacter(
          {
            id: config.id,
            suitColor: config.suitColor,
            pantsColor: config.pantsColor,
            hairColor: config.hairColor,
            isFemale: config.isFemale,
            mode: config.mode,
            staffIndex,
            characterKey: config.characterKey
          },
          bodyGroup
        );

      // Floating Anime Pill Badge for Doraemon Staff Character
      const pillTitle = config.characterName || config.roleLabel;
      const pillSubtitle = config.slashCommand
        ? `${config.departmentLabel || 'Nhân sự'} (${config.slashCommand})`
        : (config.departmentLabel || 'PrintAd Agency · Nhân sự');
      const pillColor = config.accentHex || '#f59e0b';

      const pillTex = createFloatingPillTexture(
        pillTitle,
        pillSubtitle,
        pillColor,
        false
      );
      const labelSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: pillTex,
          transparent: true,
          depthWrite: false
        })
      );
      labelSprite.position.set(0, 2.32, 0);
      labelSprite.scale.set(1.95, 0.44, 1);
      labelSprite.visible = config.showFloatingLabel !== false;
      root.add(labelSprite);

      // 3D Speech Bubble for NPC conversations
      const defaultLines = config.chatLines || [
        'Đơn in bạt 80m² sáng nay đẹp quá!',
        'Chuẩn bị chuyển file CMYK sang xưởng nhé!'
      ];
      const chatTex = createSpeechBubbleTexture(
        config.roleLabel.split('·')[0].trim(),
        defaultLines[0],
        '#f59e0b'
      );
      const chatBubbleSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: chatTex,
          transparent: true,
          depthWrite: false
        })
      );
      chatBubbleSprite.position.set(0, 2.38, 0);
      chatBubbleSprite.scale.set(2.05, 0.62, 1);
      chatBubbleSprite.visible = false;
      root.add(chatBubbleSprite);

      bodyGroup.lookAt(config.lookAtPos[0], config.startPos[1], config.lookAtPos[2]);
      scene.add(root);

      const parsedWps = (config.waypoints || []).map((w) => ({
        pos: new THREE.Vector3(w.pos[0], w.pos[1], w.pos[2]),
        activity: w.activity
      }));

      return {
        id: config.id,
        roleLabel: config.roleLabel,
        root,
        bodyGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        head,
        labelSprite,
        chatBubbleSprite,
        lastChatText: defaultLines[0],
        chatLines: defaultLines,
        partnerLookAt: config.partnerLookAt
          ? new THREE.Vector3(
              config.partnerLookAt[0],
              config.partnerLookAt[1],
              config.partnerLookAt[2]
            )
          : undefined,
        mode: config.mode,
        waypoints: parsedWps,
        currentWpIndex: 0,
        waitTimer: 1.2 + (staffIndex % 3) * 0.9,
        currentActivity:
          config.mode === 'seated_cafe'
            ? 'cafe'
            : config.mode === 'seated_game'
            ? 'game'
            : config.mode === 'seated_work'
            ? 'work'
            : 'walk'
      };
    }

    // 8 Doraemon Supporting Staff Configurations (9 Department Heads + 8 Staff = exactly 17 Doraemon Characters!)
    const staffConfigs: Parameters<typeof createAgencyStaffMember>[0][] = [
      // 1. JAIKO — Em gái Chaian (03 - Marketing B2B)
      {
        id: 'staff-jaiko',
        characterKey: 'jaiko',
        characterName: 'Jaiko (Em gái Chaian)',
        roleLabel: 'Sáng tạo nội dung & Visual Story',
        departmentLabel: '03 - Marketing B2B',
        slashCommand: '/mkt',
        accentHex: '#ec4899',
        suitColor: 0xf43f5e,
        pantsColor: 0x881337,
        hairColor: 0x18181b,
        isFemale: true,
        mode: 'seated_cafe',
        startPos: [-6.8, 0, 7.8],
        lookAtPos: [-5.1, 0, 7.8],
        partnerLookAt: [-5.1, 0, 7.8],
        showFloatingLabel: true,
        chatLines: [
          'Mình vừa hoàn thiện bản phác thảo bộ Key Visual POSM chuỗi bán lẻ!',
          'Tone màu pastel rực rỡ và bố cục 3D rất đúng ý anh Chaian duyệt.'
        ]
      },
      // 2. TAMAKO — Mẹ Nobita (05 - Kế Toán & Chi Phí)
      {
        id: 'staff-tamako',
        characterKey: 'tamako',
        characterName: 'Tamako (Mẹ Nobita)',
        roleLabel: 'Kế toán kho & Kiểm soát chứng từ',
        departmentLabel: '05 - Kế Toán',
        slashCommand: '/kt',
        accentHex: '#10b981',
        suitColor: 0x10b981,
        pantsColor: 0x1e293b,
        hairColor: 0x27272a,
        isFemale: true,
        mode: 'seated_cafe',
        startPos: [-5.1, 0, 7.8],
        lookAtPos: [-6.8, 0, 7.8],
        partnerLookAt: [-6.8, 0, 7.8],
        showFloatingLabel: true,
        chatLines: [
          'Đã kiểm tra đối soát 18 hóa đơn đầu vào vật tư Hiflex & Standee!',
          'Các khoản tạm ứng 50% đơn hàng lớn đều đã vào sổ kế toán Standard Costing.'
        ]
      },
      // 3. SEWASHI — Cháu Nobita thế kỷ 22 (01 - Ban Giám Đốc)
      {
        id: 'staff-sewashi',
        characterKey: 'sewashi',
        characterName: 'Sewashi (Cháu Nobita)',
        roleLabel: 'Tự động hóa & Dữ liệu 4.0',
        departmentLabel: '01 - Ban Giám Đốc',
        slashCommand: '/bgd',
        accentHex: '#06b6d4',
        suitColor: 0x06b6d4,
        pantsColor: 0x0f172a,
        hairColor: 0x1e293b,
        isFemale: false,
        mode: 'seated_game',
        startPos: [10.3, 0, 4.3],
        lookAtPos: [10.3, 0, 1.5],
        partnerLookAt: [12.9, 0, 4.1],
        showFloatingLabel: true,
        chatLines: [
          'Dashboard phân tích hiệu suất 8 Sub-Agents đang vận hành tối ưu!',
          'Thuật toán dự báo nhu cầu in ấn tuần tới đạt độ chính xác 96.5%!'
        ]
      },
      // 4. SUNETSUGU — Em họ Suneo New York (02 - Kinh Doanh B2B)
      {
        id: 'staff-sunetsugu',
        characterKey: 'sunetsugu',
        characterName: 'Sunetsugu (Em họ Suneo)',
        roleLabel: 'Pháp chế & Hợp đồng B2B',
        departmentLabel: '02 - Kinh Doanh B2B',
        slashCommand: '/kd',
        accentHex: '#3b82f6',
        suitColor: 0x3b82f6,
        pantsColor: 0x1e293b,
        hairColor: 0x18181b,
        isFemale: false,
        mode: 'walker',
        startPos: [12.9, 0, 4.1],
        lookAtPos: [10.3, 0, 4.3],
        showFloatingLabel: true,
        chatLines: [
          'Hợp đồng nguyên tắc cung cấp POSM với chuỗi bán lẻ quốc tế đã hoàn tất!',
          'Các điều khoản SLA bảo hành màu sắc và thời gian giao hàng rất chặt chẽ.'
        ],
        waypoints: [
          { pos: [12.2, 0, 4.1], activity: 'game' },
          { pos: [7.8, 0, 2.8], activity: 'walk' },
          { pos: [3.2, 0, 2.4], activity: 'walk' },
          { pos: [13.5, 0, 4.1], activity: 'game' }
        ]
      },
      // 5. MINI-DORA ĐỎ — Kỹ Thuật Chế Bản & Preflight CMYK
      {
        id: 'staff-minidora-red',
        characterKey: 'minidora_red',
        characterName: 'Mini-Dora Đỏ',
        roleLabel: 'Kỹ thuật chế bản & In Proof CMYK',
        departmentLabel: 'Kỹ Thuật Chế Bản',
        slashCommand: '/tk',
        accentHex: '#ef4444',
        suitColor: 0xef4444,
        pantsColor: 0xef4444,
        hairColor: 0xef4444,
        isFemale: false,
        mode: 'seated_work',
        startPos: [-9.75, 0, 0.25],
        lookAtPos: [-9.75, 0, 1.3],
        partnerLookAt: [-7.2, 0, 1.8],
        showFloatingLabel: true,
        chatLines: [
          'Poko poko! Đã kiểm tra 300 DPI, bù tràn lề 3mm cho file anh Nobita!',
          'Bản in proof test màu ISO Coated v2 đạt độ lệch Delta-E < 1.0!'
        ]
      },
      // 6. NOBISUKE — Bố Nobita (02 - Kinh Doanh B2B)
      {
        id: 'staff-nobisuke',
        characterKey: 'nobisuke',
        characterName: 'Nobisuke (Bố Nobita)',
        roleLabel: 'Chuyên viên Đàm phán Hợp đồng B2B',
        departmentLabel: '02 - Kinh Doanh B2B',
        slashCommand: '/kd',
        accentHex: '#3b82f6',
        suitColor: 0x475569,
        pantsColor: 0x1e293b,
        hairColor: 0x18181b,
        isFemale: false,
        mode: 'seated_work',
        startPos: [2.65, 0, 4.15],
        lookAtPos: [2.65, 0, 5.2],
        partnerLookAt: [4.55, 0, 6.25],
        showFloatingLabel: true,
        chatLines: [
          'Khách hàng B2B chuỗi nhà hàng vừa đồng ý ký hợp đồng in bạt 500m²!',
          'Anh Dekisugi để bố chuẩn bị sẵn phụ lục đơn giá ưu đãi nhé!'
        ]
      },
      // 7. MINI-DORA VÀNG — Kho Bãi & Mua Hàng FIFO
      {
        id: 'staff-minidora-yellow',
        characterKey: 'minidora_yellow',
        characterName: 'Mini-Dora Vàng',
        roleLabel: 'Điều phối Kho & Mã vạch QR FIFO',
        departmentLabel: '07 - Kho Bãi & Mua Hàng',
        slashCommand: '/kho',
        accentHex: '#eab308',
        suitColor: 0xfacc15,
        pantsColor: 0xfacc15,
        hairColor: 0xfacc15,
        isFemale: false,
        mode: 'seated_work',
        startPos: [4.55, 0, 6.25],
        lookAtPos: [4.55, 0, 5.2],
        partnerLookAt: [2.65, 0, 4.15],
        showFloatingLabel: true,
        chatLines: [
          'Poko poko! Lô phôi bạt nhập sáng nay đã dán tem QR theo chuẩn FIFO!',
          'Bác Kaminari yên tâm, tồn kho an toàn luôn đảm bảo cho đơn gấp.'
        ]
      },
      // 8. GODA MOM — Mẹ Chaian (08 - Hành Chính & EHS 5S)
      {
        id: 'staff-goda-mom',
        characterKey: 'goda_mom',
        characterName: 'Mẹ Chaian (Bà chủ Goda)',
        roleLabel: 'Giám sát Hiện trường 5S & BHLĐ',
        departmentLabel: '08 - Hành Chính & EHS',
        slashCommand: '/hc',
        accentHex: '#0d9488',
        suitColor: 0x0d9488,
        pantsColor: 0x1e293b,
        hairColor: 0x18181b,
        isFemale: true,
        mode: 'walker',
        startPos: [-0.8, 0, 2.5],
        lookAtPos: [-6.5, 0, 5.5],
        showFloatingLabel: true,
        chatLines: [
          'Khu vực máy in và gia công cắt bạt phải luôn giữ sạch sẽ 5S!',
          'Bình PCCC và lối thoát hiểm đã được kiểm tra nghiêm ngặt đạt 100%!'
        ],
        waypoints: [
          { pos: [-0.8, 0, 2.5], activity: 'walk' },
          { pos: [-4.8, 0, 2.8], activity: 'work' },
          { pos: [-7.2, 0, 5.8], activity: 'cafe' },
          { pos: [-1.8, 0, -0.4], activity: 'walk' },
          { pos: [2.4, 0, 1.8], activity: 'work' }
        ]
      }
    ];

    staffConfigs.forEach((cfg, sIdx) => {
      npcRigs.push(createAgencyStaffMember(cfg, sIdx));
    });

    if (typeof document !== 'undefined' && document.fonts) {
      Promise.all([
        document.fonts.load('700 25px "Be Vietnam Pro"'),
        document.fonts.load('800 78px "Be Vietnam Pro"')
      ])
        .catch(() => {})
        .finally(() => {
          if (isDisposed) return;
          fontRefreshCallbacks.forEach((cb) => cb());
          agentRigs.forEach((rig) => {
            rig.lastBadgeText = '';
          });
          npcRigs.forEach((npc) => {
            const oldMap = npc.labelSprite.material.map;
            npc.labelSprite.material.map = createFloatingPillTexture(
              npc.roleLabel,
              'PrintAd Agency · Nhân sự',
              '#f59e0b',
              false
            );
            npc.labelSprite.material.needsUpdate = true;
            if (oldMap) oldMap.dispose();
          });
        });
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // 13. RAYCASTING (CLICK TO SELECT, DOUBLE-CLICK TO ZOOM IN CLOSE)
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const pickHit = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(interactables, false);
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;

      const hits = pickHit(e.clientX, e.clientY);
      if (hits.length > 0) {
        const hitData = hits[0].object.userData;
        if (hitData.type === 'agent' && hitData.agentId) {
          propsRef.current.onSelectAgent(hitData.agentId);
          const clickedAgent = propsRef.current.agents.find(
            (a) => a.id === hitData.agentId
          );
          if (clickedAgent) {
            propsRef.current.onSelectZone(clickedAgent.zoneId);
          }
        } else if (hitData.type === 'zone' && hitData.zoneId) {
          propsRef.current.onSelectZone(hitData.zoneId);
        }
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const hits = pickHit(e.clientX, e.clientY);
      if (hits.length > 0) {
        const pt = hits[0].point;
        cameraGoalRef.current.target.set(pt.x, 1.0, pt.z);
        cameraGoalRef.current.pos.set(pt.x - 1.4, 2.4, pt.z + 3.6);
        cameraGoalRef.current.active = true;
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);

    // Keyboard WASD / Arrow Keys Navigation
    const keysPressed: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      keysPressed[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', onResize);

    // =========================================================================
    // 14. ANIMATION LOOP WITH AUTONOMOUS STAFF WALKING & ACTIVITY STATS
    // =========================================================================
    const clock = new THREE.Clock();
    const _targetPos = new THREE.Vector3();
    let frameId = 0;
    let isDisposed = false;
    let lastStatsSignature = '';

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const currentProps = propsRef.current;

      // Keyboard Panning
      const panSpeed = 10 * dt;
      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) {
        cameraGoalRef.current.active = false;
        camera.position.z -= panSpeed;
        controls.target.z -= panSpeed;
      }
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) {
        cameraGoalRef.current.active = false;
        camera.position.z += panSpeed;
        controls.target.z += panSpeed;
      }
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
        cameraGoalRef.current.active = false;
        camera.position.x -= panSpeed;
        controls.target.x -= panSpeed;
      }
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
        cameraGoalRef.current.active = false;
        camera.position.x += panSpeed;
        controls.target.x += panSpeed;
      }

      // Smooth Camera Preset Transition
      if (cameraGoalRef.current.active) {
        const speed = isSoftwareGl ? 14.0 : 6.0;
        const alpha = 1 - Math.exp(-speed * dt);
        camera.position.lerp(cameraGoalRef.current.pos, alpha);
        controls.target.lerp(cameraGoalRef.current.target, alpha);
        if (
          camera.position.distanceToSquared(cameraGoalRef.current.pos) < 0.02 &&
          controls.target.distanceToSquared(cameraGoalRef.current.target) < 0.02
        ) {
          cameraGoalRef.current.active = false;
        }
      }

      controls.update();

      // A. Evaluate Active Social Conversation Pair & Update 5 Doraemon Leaders
      const socialState = getActiveSocialDialogue(elapsed);
      const { exchange, activeTurn, activeText } = socialState;

      // Social gathering circles in Central Lounge when user toggles "Tụ họp giao lưu"
      const socialGatheringSpots: Record<string, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
        doraemon: {
          pos: new THREE.Vector3(-0.9, 0, 1.4),
          lookAt: new THREE.Vector3(0.4, 0, 2.2)
        },
        shizuka: {
          pos: new THREE.Vector3(0.6, 0, 2.3),
          lookAt: new THREE.Vector3(-0.9, 0, 1.4)
        },
        nobita: {
          pos: new THREE.Vector3(-2.1, 0, 2.5),
          lookAt: new THREE.Vector3(0.2, 0, 2.0)
        },
        suneo: {
          pos: new THREE.Vector3(1.5, 0, 1.1),
          lookAt: new THREE.Vector3(-0.5, 0, 1.8)
        },
        chaian: {
          pos: new THREE.Vector3(-0.2, 0, 3.3),
          lookAt: new THREE.Vector3(-0.4, 0, 1.5)
        }
      };

      let activeTaskRunners = 0;
      let talkingCharactersCount = 0;

      agentRigs.forEach((rig, idx) => {
        const wp = computeAgentWaypoint(
          rig.agent,
          currentProps.tasks,
          currentProps.zones,
          currentProps.isAllHandsMeeting,
          idx
        );

        const isTaskBusy =
          wp.stateLabel.includes('Đang') ||
          wp.stateLabel.includes('Thực thi') ||
          wp.stateLabel.includes('Điều phối');
        if (isTaskBusy) activeTaskRunners += 1;

        const isOverviewOrSocial =
          currentProps.activeZoneId === 'overview' ||
          Boolean(currentProps.isSocialGathering);

        const isSpeakerInPair =
          rig.agent.characterKey === exchange.speakerKey &&
          !isTaskBusy &&
          !currentProps.isAllHandsMeeting;
        const isListenerInPair =
          rig.agent.characterKey === exchange.listenerKey &&
          !isTaskBusy &&
          !currentProps.isAllHandsMeeting;

        let socialPartnerPos: THREE.Vector3 | null = null;
        let isCurrentlyConversing = false;
        let currentBubbleText = '';

        if (
          currentProps.isSocialGathering &&
          !isTaskBusy &&
          !currentProps.isAllHandsMeeting
        ) {
          const gatherSpot = socialGatheringSpots[rig.agent.characterKey];
          if (gatherSpot) {
            _targetPos.copy(gatherSpot.pos);
            socialPartnerPos = gatherSpot.lookAt;
            if (rig.root.position.distanceTo(_targetPos) > 0.35) {
              rig.root.position.lerp(_targetPos, 0.45);
            }
          }
          isCurrentlyConversing = true;
          if (isSpeakerInPair || isListenerInPair) {
            currentBubbleText =
              isSpeakerInPair && activeTurn === 'speaker'
                ? exchange.speakerLine
                : isListenerInPair && activeTurn === 'listener'
                ? exchange.listenerReply
                : '';
          } else if (rig.agent.characterKey === 'doraemon') {
            currentBubbleText =
              'Anh em phối hợp nhịp nhàng lắm! Cứ giữ vững tiến độ SOP nhé!';
          }
        } else if (
          isOverviewOrSocial &&
          (isSpeakerInPair || isListenerInPair)
        ) {
          // Active dialogue pair walks to their shared meeting spot to converse face-to-face!
          const spot = isSpeakerInPair
            ? exchange.speakerSpot
            : exchange.listenerSpot;
          const partnerSpot = isSpeakerInPair
            ? exchange.listenerSpot
            : exchange.speakerSpot;
          _targetPos.set(spot.x, 0, spot.z);
          socialPartnerPos = new THREE.Vector3(partnerSpot.x, 0, partnerSpot.z);
          isCurrentlyConversing = true;
          currentBubbleText =
            isSpeakerInPair && activeTurn === 'speaker'
              ? exchange.speakerLine
              : isListenerInPair && activeTurn === 'listener'
              ? exchange.listenerReply
              : '';
        } else if (
          isOverviewOrSocial &&
          !isTaskBusy &&
          !currentProps.isAllHandsMeeting &&
          rig.patrolWaypoints.length > 1
        ) {
          const pTarget = rig.patrolWaypoints[rig.patrolIndex];
          _targetPos.copy(pTarget);
          if (rig.root.position.distanceTo(_targetPos) < 0.22) {
            rig.patrolWaitTimer -= dt;
            if (rig.patrolWaitTimer <= 0) {
              rig.patrolIndex =
                (rig.patrolIndex + 1) % rig.patrolWaypoints.length;
              rig.patrolWaitTimer = 2.6 + (idx % 3) * 1.2;
            }
          }
        } else {
          _targetPos.set(wp.position.x, 0, wp.position.z);
          if (
            !isOverviewOrSocial &&
            !isTaskBusy &&
            rig.agent.zoneId === currentProps.activeZoneId
          ) {
            rig.root.position.copy(_targetPos);
            // Even when inspecting a single character close-up, show their friendly greeting bubble!
            if (isSpeakerInPair || isListenerInPair) {
              isCurrentlyConversing = true;
              currentBubbleText = isSpeakerInPair
                ? exchange.speakerLine
                : exchange.listenerReply;
            }
          }
        }

        const dist = rig.root.position.distanceTo(_targetPos);

        if (dist > 0.14 && !currentProps.isSocialGathering) {
          const moveAlpha = 1 - Math.exp(-3.4 * dt);
          rig.root.position.lerp(_targetPos, moveAlpha);
          rig.bodyGroup.lookAt(_targetPos.x, 0, _targetPos.z);

          const walkCycle = Math.sin(elapsed * 8.8 + idx) * 0.48;
          rig.leftLeg.rotation.x = walkCycle;
          rig.rightLeg.rotation.x = -walkCycle;
          rig.leftArm.rotation.x = -walkCycle * 0.72;
          rig.rightArm.rotation.x = walkCycle * 0.72;
          rig.rightArm.rotation.z = 0;
          rig.bodyGroup.position.y =
            Math.abs(Math.cos(elapsed * 8.8 + idx)) * 0.048;
          rig.chatBubbleSprite.visible = false;
        } else {
          if (currentProps.isSocialGathering && dist > 0.02) {
            rig.root.position.copy(_targetPos);
          }
          rig.leftLeg.rotation.x = THREE.MathUtils.damp(
            rig.leftLeg.rotation.x,
            0,
            8,
            dt
          );
          rig.rightLeg.rotation.x = THREE.MathUtils.damp(
            rig.rightLeg.rotation.x,
            0,
            8,
            dt
          );
          rig.bodyGroup.position.y = isCurrentlyConversing
            ? Math.abs(Math.sin(elapsed * 4.5 + idx)) * 0.018
            : 0;

          if (socialPartnerPos) {
            rig.bodyGroup.lookAt(socialPartnerPos.x, 0, socialPartnerPos.z);
          } else {
            rig.bodyGroup.lookAt(wp.lookAt.x, 0, wp.lookAt.z);
          }

          if (isCurrentlyConversing) {
            talkingCharactersCount += 1;
            const isSpeakingNow = Boolean(currentBubbleText);
            if (isSpeakingNow) {
              // Expressive hand-talking & head gesture while speaking
              rig.leftArm.rotation.x =
                -0.48 + Math.sin(elapsed * 8.2 + idx) * 0.24;
              rig.rightArm.rotation.x =
                -0.62 + Math.cos(elapsed * 7.4 + idx) * 0.28;
              rig.rightArm.rotation.z =
                -0.18 + Math.sin(elapsed * 6.0 + idx) * 0.14;
              rig.headGroup.rotation.y =
                Math.sin(elapsed * 3.8 + idx) * 0.16;
              rig.headGroup.rotation.x =
                Math.sin(elapsed * 6.5 + idx) * 0.07;
            } else {
              // Attentive listener nodding & friendly wave
              rig.leftArm.rotation.x =
                -0.18 + Math.sin(elapsed * 2.8 + idx) * 0.08;
              rig.rightArm.rotation.x =
                -0.35 + Math.sin(elapsed * 4.2 + idx) * 0.15;
              rig.rightArm.rotation.z = 0;
              rig.headGroup.rotation.x =
                Math.sin(elapsed * 5.2 + idx) * 0.095;
              rig.headGroup.rotation.y =
                Math.sin(elapsed * 1.8 + idx) * 0.08;
            }
          } else {
            const armSwing = isTaskBusy
              ? -0.42 + Math.sin(elapsed * 7 + idx) * 0.22
              : -0.14 + Math.sin(elapsed * 2.2 + idx) * 0.06;
            rig.leftArm.rotation.x = armSwing;
            rig.rightArm.rotation.x = armSwing * 0.7 - 0.08;
            rig.rightArm.rotation.z = 0;

            rig.headGroup.rotation.y =
              Math.sin(elapsed * 1.4 + idx * 1.3) * 0.14;
            rig.headGroup.rotation.x = Math.sin(elapsed * 2.1 + idx) * 0.04;
          }

          // Show or hide 3D Floating Speech Bubble
          if (currentBubbleText) {
            rig.chatBubbleSprite.visible = true;
            if (rig.lastChatText !== currentBubbleText) {
              rig.lastChatText = currentBubbleText;
              const oldChatMap = rig.chatBubbleSprite.material.map;
              rig.chatBubbleSprite.material.map = createSpeechBubbleTexture(
                rig.agent.name.split(' ')[0],
                currentBubbleText,
                rig.agent.accentHex
              );
              rig.chatBubbleSprite.material.needsUpdate = true;
              if (oldChatMap) oldChatMap.dispose();
            }
          } else {
            rig.chatBubbleSprite.visible = false;
          }
        }

        if (rig.propellerGroup) {
          rig.propellerGroup.rotation.y = elapsed * 14.0;
        }
        if (rig.tailGroup) {
          rig.tailGroup.rotation.z = Math.sin(elapsed * 5.0 + idx) * 0.22;
        }

        // Natural periodic eye blink
        const blinkPhase = (elapsed * 0.85 + idx * 1.7) % 4.2;
        const eyeScaleY = blinkPhase > 4.02 ? 0.12 : 1.0;
        if (rig.eyeGroups) {
          rig.eyeGroups.forEach((eg) => {
            eg.scale.y = eyeScaleY;
          });
        }

        const isSelected = rig.agent.id === currentProps.selectedAgentId;
        const statusSubtitle = isCurrentlyConversing
          ? `💬 Đang trao đổi cùng ${
              isSpeakerInPair ? exchange.listenerName.split(' ')[0] : exchange.speakerName.split(' ')[0]
            }`
          : wp.stateLabel;
        const badgeKey = `${statusSubtitle}|${isSelected}`;
        if (rig.lastBadgeText !== badgeKey) {
          rig.lastBadgeText = badgeKey;
          const oldMap = rig.labelSprite.material.map;
          const shortRoleMap: Record<string, string> = {
            sales_quoting: 'Trưởng nhóm CSKH & Báo giá',
            accounting: 'Trưởng nhóm Kế toán',
            design_tech: 'Kỹ thuật & Thiết kế CMYK',
            marketing: 'Trưởng nhóm SEO · Marketing',
            hr_ops: 'Trưởng phòng Quản lý chung'
          };
          const newMap = createFloatingPillTexture(
            shortRoleMap[rig.agent.departmentId] || rig.agent.name,
            `${rig.agent.name.split(' ')[0]} · ${statusSubtitle}`,
            rig.agent.accentHex,
            isSelected
          );
          rig.labelSprite.material.map = newMap;
          rig.labelSprite.material.needsUpdate = true;
          if (oldMap) oldMap.dispose();

          rig.statusRing.scale.setScalar(
            isSelected || isCurrentlyConversing ? 1.25 : 1.0
          );
        }
      });

      // B. Update 12 Lifelike Agency Staff Members (Walking, Socializing, Cafe, Game Zone, Work)
      let cafeCount = 0;
      let gameCount = 0;

      npcRigs.forEach((npc, nIdx) => {
        if (npc.mode === 'walker' && npc.waypoints.length > 1) {
          const targetWp = npc.waypoints[npc.currentWpIndex];
          const d = npc.root.position.distanceTo(targetWp.pos);

          // Check if another walker or Doraemon leader is nearby for a spontaneous hallway chat!
          let nearbyColleaguePos: THREE.Vector3 | null = null;
          for (let otherIdx = 0; otherIdx < npcRigs.length; otherIdx++) {
            if (otherIdx === nIdx) continue;
            const other = npcRigs[otherIdx];
            const distToOther = npc.root.position.distanceTo(other.root.position);
            if (distToOther < 1.85 && d <= 0.35) {
              nearbyColleaguePos = other.root.position;
              break;
            }
          }

          if (d > 0.14) {
            npc.currentActivity = 'walk';
            const step = Math.min(d, 1.85 * dt);
            _targetPos
              .copy(targetWp.pos)
              .sub(npc.root.position)
              .normalize()
              .multiplyScalar(step);
            npc.root.position.add(_targetPos);
            npc.bodyGroup.lookAt(targetWp.pos.x, 0, targetWp.pos.z);

            const wCycle = Math.sin(elapsed * 7.8 + nIdx) * 0.46;
            npc.leftLeg.rotation.x = wCycle;
            npc.rightLeg.rotation.x = -wCycle;
            npc.leftArm.rotation.x = -wCycle * 0.65;
            npc.rightArm.rotation.x = wCycle * 0.65;
            npc.bodyGroup.position.y =
              Math.abs(Math.cos(elapsed * 7.8 + nIdx)) * 0.038;
            npc.chatBubbleSprite.visible = false;
          } else {
            npc.currentActivity = targetWp.activity;
            npc.leftLeg.rotation.x = 0;
            npc.rightLeg.rotation.x = 0;
            npc.bodyGroup.position.y = 0;

            if (nearbyColleaguePos) {
              npc.bodyGroup.lookAt(
                nearbyColleaguePos.x,
                0,
                nearbyColleaguePos.z
              );
            }

            // Expressive socializing gesture while pausing at waypoint
            npc.leftArm.rotation.x =
              -0.32 + Math.sin(elapsed * 5.2 + nIdx) * 0.16;
            npc.rightArm.rotation.x =
              -0.48 + Math.cos(elapsed * 5.8 + nIdx) * 0.22;
            npc.head.rotation.y = Math.sin(elapsed * 2.8 + nIdx) * 0.18;
            npc.head.rotation.x = Math.sin(elapsed * 4.5 + nIdx) * 0.06;

            // Show floating speech bubble on active walker
            const showNpcChat = (Math.floor(elapsed / 4.5) + nIdx) % 3 === 0;
            npc.chatBubbleSprite.visible = showNpcChat;
            if (showNpcChat) {
              talkingCharactersCount += 1;
              const lineChoice =
                npc.chatLines[
                  Math.floor(elapsed / 9.0 + nIdx) % npc.chatLines.length
                ];
              if (lineChoice && npc.lastChatText !== lineChoice) {
                npc.lastChatText = lineChoice;
                const oldMap = npc.chatBubbleSprite.material.map;
                npc.chatBubbleSprite.material.map = createSpeechBubbleTexture(
                  npc.roleLabel.split('·')[0].trim(),
                  lineChoice,
                  '#f59e0b'
                );
                npc.chatBubbleSprite.material.needsUpdate = true;
                if (oldMap) oldMap.dispose();
              }
            }

            npc.waitTimer -= dt;
            if (npc.waitTimer <= 0) {
              npc.currentWpIndex =
                (npc.currentWpIndex + 1) % npc.waypoints.length;
              npc.waitTimer = 2.8 + (nIdx % 3) * 1.4;
            }
          }
        } else {
          // Seated staff at Cafe, Game Zone & Workstations conversing with partners
          const isCafePairTalking =
            npc.mode === 'seated_cafe' &&
            (Math.floor(elapsed / 4.0) + nIdx) % 2 === 0;
          const isGameOrWorkTalking =
            npc.mode !== 'seated_cafe' &&
            (Math.floor(elapsed / 5.5) + nIdx) % 4 === 0;
          const showSeatedChat = isCafePairTalking || isGameOrWorkTalking;

          npc.head.rotation.y = showSeatedChat
            ? Math.sin(elapsed * 3.4 + nIdx) * 0.22
            : Math.sin(elapsed * 1.4 + nIdx) * 0.14;
          npc.head.rotation.x = showSeatedChat
            ? Math.sin(elapsed * 5.0 + nIdx) * 0.07
            : 0;
          npc.rightArm.rotation.x = showSeatedChat
            ? -0.68 + Math.sin(elapsed * 6.2 + nIdx) * 0.18
            : -0.55 + Math.sin(elapsed * 3.8 + nIdx) * 0.08;

          npc.chatBubbleSprite.visible = showSeatedChat;
          if (showSeatedChat) {
            talkingCharactersCount += 1;
            const lineChoice =
              npc.chatLines[
                Math.floor(elapsed / 8.0 + nIdx) % npc.chatLines.length
              ];
            if (lineChoice && npc.lastChatText !== lineChoice) {
              npc.lastChatText = lineChoice;
              const oldMap = npc.chatBubbleSprite.material.map;
              npc.chatBubbleSprite.material.map = createSpeechBubbleTexture(
                npc.roleLabel.split('·')[0].trim(),
                lineChoice,
                '#38bdf8'
              );
              npc.chatBubbleSprite.material.needsUpdate = true;
              if (oldMap) oldMap.dispose();
            }
          }
        }

        if (npc.currentActivity === 'cafe') cafeCount += 1;
        if (npc.currentActivity === 'game') gameCount += 1;
      });

      // Notify parent HUD if activity stats or active dialogue changed
      const activeSpeakerKey =
        activeTurn === 'speaker' ? exchange.speakerKey : exchange.listenerKey;
      const sig = `${activeTaskRunners}|17|${cafeCount}|${gameCount}|${talkingCharactersCount}|${exchange.id}|${activeTurn}`;
      if (sig !== lastStatsSignature) {
        lastStatsSignature = sig;
        if (currentProps.onActivityStatsChange) {
          currentProps.onActivityStatsChange({
            workingCount: activeTaskRunners,
            totalStaff: 17,
            cafeCount,
            gameCount,
            talkingCount: Math.max(2, talkingCharactersCount)
          });
        }
        if (currentProps.onActiveDialogueChange) {
          currentProps.onActiveDialogueChange({
            speakerName:
              activeTurn === 'speaker'
                ? exchange.speakerName
                : exchange.listenerName,
            listenerName:
              activeTurn === 'speaker'
                ? exchange.listenerName
                : exchange.speakerName,
            hubLabel: exchange.hubLabel,
            line: activeText,
            speakerKey: activeSpeakerKey
          });
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={canvasMountRef}
      data-testid="virtual-office-canvas-container"
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950"
      aria-label="Không gian văn phòng ảo 3D PrintAd Agency"
    />
  );
};
